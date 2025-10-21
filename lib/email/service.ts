import { Resend } from 'resend';
import { render } from '@react-email/render';
import {
  PasswordResetEmail,
  WelcomeEmail,
  DebateInvitationEmail,
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
) {
  try {
    const emailHtml = await render(
      PasswordResetEmail({ resetUrl, userName })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }

    console.log('Password reset email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(
  email: string,
  userName: string
) {
  try {
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`;
  const emailHtml = await render(
    WelcomeEmail({ userName, loginUrl })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Welcome to Debate Platform!',
    html: emailHtml,
  });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    console.log('Welcome email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendDebateInvitationEmail(
  email: string,
  userName: string,
  debateTitle: string,
  inviterName: string,
  debateId: string
) {
  try {
    const debateUrl = `${process.env.NEXTAUTH_URL}/debates/${debateId}`;
    const emailHtml = await render(
      DebateInvitationEmail({
        userName,
        debateTitle,
        inviterName,
        debateUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `You've been invited to debate: ${debateTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending debate invitation:', error);
      throw error;
    }

    console.log('Debate invitation sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Failed to send debate invitation:', error);
    throw error;
  }
}

// Generic email sender for other use cases
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}