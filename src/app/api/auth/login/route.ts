import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration to 10 minutes from now
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationExpiry,
      },
    });

    // Send email with Resend
    await resend.emails.send({
      from: 'SLA Simulator <onboarding@resend.dev>',
      to: user.email,
      subject: 'Your Login Verification Code',
      html: `<p>Your verification code is: <strong>${verificationCode}</strong>. It will expire in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: 'Verification code sent.' }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
