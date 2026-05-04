import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";

// Inter Variable — full weight axis, used for all body/UI text
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  axes: ["opsz"],   // optical sizing axis
  display: "swap",
});

// DM Serif Display — used for highlighted/important words
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",    // DM Serif Display only ships weight 400
  display: "swap",
});

// Geist Mono — kept for code/numbers
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brandvertise AI — Automated Social Media for Growing Brands",
  description:
    "AI-powered creative agency that generates, schedules, and publishes brand content across all social platforms — fully automated. Join 2,400+ brands.",
  keywords: ["AI social media", "automated content", "brand marketing", "AI design"],
  icons: {
    icon: [
      { url: "/Brandvertise-Dark-Favicon.webp", media: "(prefers-color-scheme: light)" },
      { url: "/Brandvertise-Light-Favicon.webp", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/Brandvertise-Dark-Favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (      <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable} ${geistMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

