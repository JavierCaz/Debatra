const emailTranslations = {
  en: {
    passwordReset: {
      heading: "Password Reset Request",
      greeting: "Hi",
      greetingName: "Hi {{name}},",
      body: "You recently requested to reset your password for your Debatra account. Click the button below to reset it.",
      buttonText: "Reset Password",
      copyUrl: "Or copy and paste this URL into your browser:",
      footer:
        "This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.",
      subject: "Reset Your Password",
    },
    welcome: {
      heading: "Welcome to Debatra! 🎉",
      greeting: "Hi {{name}},",
      body: "Thanks for joining Debatra! We're excited to have you as part of our community of evidence-based debaters.",
      whatYouCanDo: "Here's what you can do:",
      bullet1: "✓ Browse ongoing debates and vote on arguments",
      bullet2: "✓ Create your own debates on topics you care about",
      bullet3: "✓ Support arguments with credible references",
      bullet4: "✓ Engage in evidence-based discussions",
      buttonText: "Get Started",
      footer: "If you have any questions, feel free to reply to this email.",
      subject: "Welcome to Debatra!",
    },
    invitation: {
      heading: "You've Been Invited to a Debate!",
      greeting: "Hi {{name}},",
      body: "{{inviter}} has invited you to participate in the debate:",
      description:
        "This is your chance to engage in an evidence-based discussion and share your perspective.",
      buttonText: "View Debate",
      footer: "You can accept or decline this invitation from the debate page.",
      subject: "You've been invited to debate: {{title}}",
    },
    notification: {
      greeting: "Hi {{name}},",
      greetingGeneric: "Hi,",
      viewButton: "View Notification",
      copyUrl: "Or copy and paste this URL into your browser:",
      footer:
        "You received this email because you're participating in a debate on Debatra.",
      managePrefs: "Manage notification preferences",
    },
  },
  es: {
    passwordReset: {
      heading: "Solicitud de restablecimiento de contraseña",
      greeting: "Hola",
      greetingName: "Hola {{name}},",
      body: "Solicitaste restablecer tu contraseña para tu cuenta de Debatra. Haz clic en el botón de abajo para restablecerla.",
      buttonText: "Restablecer contraseña",
      copyUrl: "O copia y pega esta URL en tu navegador:",
      footer:
        "Este enlace expirará en 24 horas. Si no solicitaste esto, puedes ignorar este correo de forma segura.",
      subject: "Restablece tu contraseña",
    },
    welcome: {
      heading: "¡Bienvenido a Debatra! 🎉",
      greeting: "Hola {{name}},",
      body: "¡Gracias por unirte a Debatra! Estamos emocionados de tenerte como parte de nuestra comunidad de debatedores basados en evidencia.",
      whatYouCanDo: "Esto es lo que puedes hacer:",
      bullet1: "✓ Explora debates en curso y vota en los argumentos",
      bullet2: "✓ Crea tus propios debates sobre temas que te importan",
      bullet3: "✓ Respaldar argumentos con referencias creíbles",
      bullet4: "✓ Participa en discusiones basadas en evidencia",
      buttonText: "Comenzar",
      footer: "Si tienes alguna pregunta, no dudes en responder a este correo.",
      subject: "¡Bienvenido a Debatra!",
    },
    invitation: {
      heading: "¡Has sido invitado a un debate!",
      greeting: "Hola {{name}},",
      body: "{{inviter}} te ha invitado a participar en el debate:",
      description:
        "Esta es tu oportunidad de participar en una discusión basada en evidencia y compartir tu perspectiva.",
      buttonText: "Ver debate",
      footer:
        "Puedes aceptar o rechazar esta invitación desde la página del debate.",
      subject: "Has sido invitado a debatir: {{title}}",
    },
    notification: {
      greeting: "Hola {{name}},",
      greetingGeneric: "Hola,",
      viewButton: "Ver notificación",
      copyUrl: "O copia y pega esta URL en tu navegador:",
      footer:
        "Recibiste este correo porque participas en un debate en Debatra.",
      managePrefs: "Gestionar preferencias de notificación",
    },
  },
};

export type Locale = keyof typeof emailTranslations;

export function getEmailTexts(locale: Locale = "en") {
  return emailTranslations[locale] || emailTranslations.en;
}
