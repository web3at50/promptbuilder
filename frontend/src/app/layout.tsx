import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ProfileSync } from "@/components/ProfileSync";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prompt Library | Organise & Optimise Your AI Prompts",
  description: "A beautiful prompt library to save, organise, and optimise your AI prompts with Claude and ChatGPT.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${poppins.variable} ${lora.variable} antialiased`}
        >
          <ThemeProvider
            defaultTheme="system"
            storageKey="prompt-library-theme"
          >
            <ProfileSync />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
