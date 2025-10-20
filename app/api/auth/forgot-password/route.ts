import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // (Don't reveal if email exists or not)
    if (!user) {
      return NextResponse.json(
        {
          message: 'If an account exists with that email, a reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing (extra security)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Create reset token (expires in 24 hours)
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll log it (in production, use a real email service)
    console.log('Password Reset URL:', resetUrl);
    console.log('Token expires in 24 hours');

    // In development, you can return the URL
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          message: 'If an account exists with that email, a reset link has been sent.',
          resetUrl, // Remove this in production!
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'If an account exists with that email, a reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}