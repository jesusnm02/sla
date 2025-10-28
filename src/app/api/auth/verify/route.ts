import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long');

export async function POST(request: Request) {
  try {
    const { email, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json({ message: 'Email and verification code are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationCode !== verificationCode) {
      return NextResponse.json({ message: 'Invalid verification code.' }, { status: 401 });
    }

    if (!user.verificationExpiry || user.verificationExpiry < new Date()) {
      return NextResponse.json({ message: 'Verification code has expired.' }, { status: 401 });
    }

    // Clear verification fields
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    // Create JWT
    const token = await new SignJWT({ userId: user.id, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // Token expires in 1 hour
      .sign(SECRET_KEY);

    // Set the token in an HttpOnly cookie
    const response = NextResponse.json({ message: 'Login successful.' }, { status: 200 });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
