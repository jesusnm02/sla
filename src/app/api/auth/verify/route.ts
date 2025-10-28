import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long');

export async function POST(request: Request) {
  try {
    const { email, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationCode !== verificationCode || !user.verificationExpiry || user.verificationExpiry < new Date()) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    const token = await new SignJWT({ userId: user.id, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(SECRET_KEY);

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
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
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
