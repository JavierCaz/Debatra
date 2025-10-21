import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export function PasswordResetEmail({ resetUrl, userName }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Password Reset Request</Text>
            <Text style={paragraph}>
              {userName ? `Hi ${userName},` : 'Hi,'}
            </Text>
            <Text style={paragraph}>
              You recently requested to reset your password for your Debate Platform account. 
              Click the button below to reset it.
            </Text>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
            </Text>
            <Text style={link}>{resetUrl}</Text>
            <Hr style={hr} />
            <Text style={footer}>
              This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Welcome to Debate Platform! 🎉</Text>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Thanks for joining Debate Platform! We're excited to have you as part of our community 
              of evidence-based debaters.
            </Text>
            <Text style={paragraph}>
              <strong>Here's what you can do:</strong>
            </Text>
            <Text style={paragraph}>
              ✓ Browse ongoing debates and vote on arguments<br />
              ✓ Create your own debates on topics you care about<br />
              ✓ Support arguments with credible references<br />
              ✓ Engage in evidence-based discussions
            </Text>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              If you have any questions, feel free to reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface DebateInvitationEmailProps {
  userName: string;
  debateTitle: string;
  inviterName: string;
  debateUrl: string;
}

export function DebateInvitationEmail({
  userName,
  debateTitle,
  inviterName,
  debateUrl,
}: DebateInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>You've Been Invited to a Debate!</Text>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> has invited you to participate in the debate:
            </Text>
            <Text style={title}>"{debateTitle}"</Text>
            <Text style={paragraph}>
              This is your chance to engage in an evidence-based discussion and share your perspective.
            </Text>
            <Button style={button} href={debateUrl}>
              View Debate
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              You can accept or decline this invitation from the debate page.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1f2937',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
};

const title = {
  fontSize: '20px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#2563eb',
  padding: '16px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '16px',
  marginBottom: '16px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
};