export interface NotificationEmailData {
  title: string;
  message?: string;
  link?: string;
  debateTitle?: string;
  userName?: string;
  inviterName?: string;
}

export interface EmailTemplateProps {
  title: string;
  message?: string;
  link?: string;
  linkText?: string;
  userName?: string;
}
