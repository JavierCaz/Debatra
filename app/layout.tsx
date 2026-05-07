import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/tiptap.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/ui/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Debatra",
  description: "Evidence-based structured debates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ThemeProvider defaultTheme="system" storageKey="debatra-ui-theme">
            <LanguageProvider>
              <Navbar />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
