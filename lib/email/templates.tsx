import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { getEmailTexts, type Locale } from "./translations";

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
  locale?: Locale;
}

export function PasswordResetEmail({
  resetUrl,
  userName,
  locale = "en",
}: PasswordResetEmailProps) {
  const texts = getEmailTexts(locale).passwordReset;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>{texts.heading}</Text>
            <Text style={paragraph}>
              {userName
                ? texts.greetingName.replace("{{name}}", userName)
                : texts.greeting}
            </Text>
            <Text style={paragraph}>{texts.body}</Text>
            <Button style={button} href={resetUrl}>
              {texts.buttonText}
            </Button>
            <Text style={paragraph}>{texts.copyUrl}</Text>
            <Text style={link}>{resetUrl}</Text>
            <Hr style={hr} />
            <Text style={footer}>{texts.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
  locale?: Locale;
}

export function WelcomeEmail({
  userName,
  loginUrl,
  locale = "en",
}: WelcomeEmailProps) {
  const texts = getEmailTexts(locale).welcome;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>{texts.heading}</Text>
            <Text style={paragraph}>
              {texts.greeting.replace("{{name}}", userName)}
            </Text>
            <Text style={paragraph}>{texts.body}</Text>
            <Text style={paragraph}>
              <strong>{texts.whatYouCanDo}</strong>
            </Text>
            <Text style={paragraph}>
              {texts.bullet1}
              <br />
              {texts.bullet2}
              <br />
              {texts.bullet3}
              <br />
              {texts.bullet4}
            </Text>
            <Button style={button} href={loginUrl}>
              {texts.buttonText}
            </Button>
            <Hr style={hr} />
            <Text style={footer}>{texts.footer}</Text>
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
  locale?: Locale;
}

export function DebateInvitationEmail({
  userName,
  debateTitle,
  inviterName,
  debateUrl,
  locale = "en",
}: DebateInvitationEmailProps) {
  const texts = getEmailTexts(locale).invitation;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>{texts.heading}</Text>
            <Text style={paragraph}>
              {texts.greeting.replace("{{name}}", userName)}
            </Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong>{" "}
              {texts.body.replace("{{inviter}}", inviterName)}
            </Text>
            <Text style={title}>"{debateTitle}"</Text>
            <Text style={paragraph}>{texts.description}</Text>
            <Button style={button} href={debateUrl}>
              {texts.buttonText}
            </Button>
            <Hr style={hr} />
            <Text style={footer}>{texts.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface NotificationEmailProps {
  title: string;
  message?: string;
  linkUrl?: string;
  linkText?: string;
  userName?: string;
  locale?: Locale;
}

export function NotificationEmail({
  title,
  message,
  linkUrl,
  linkText,
  userName,
  locale = "en",
}: NotificationEmailProps) {
  const texts = getEmailTexts(locale).notification;
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>{title}</Text>
            <Text style={paragraph}>
              {userName
                ? texts.greeting.replace("{{name}}", userName)
                : texts.greetingGeneric}
            </Text>
            {message && <Text style={paragraph}>{message}</Text>}
            {linkUrl && (
              <>
                <Button style={button} href={linkUrl}>
                  {linkText || texts.viewButton}
                </Button>
                <Text style={paragraph}>{texts.copyUrl}</Text>
                <Text style={link}>{linkUrl}</Text>
              </>
            )}
            <Hr style={hr} />
            <Text style={footer}>{texts.footer}</Text>
            <Text style={footer}>
              <Link
                href={`${process.env.NEXTAUTH_URL}/settings/notifications`}
                style={footerLink}
              >
                {texts.managePrefs}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1f2937",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
};

const title = {
  fontSize: "20px",
  lineHeight: "1.4",
  fontWeight: "600",
  color: "#2563eb",
  padding: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "16px",
  marginBottom: "16px",
};

const link = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
};

const footerLink = {
  color: "#6b7280",
  textDecoration: "underline",
};
