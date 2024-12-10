import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import localFont from "next/font/local";
import "./globals.css";

// Подключение шрифтов
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const evolventaSans = localFont({
  src: "./fonts/Evolventa-Regular.woff",
  variable: "--font-evolventa-sans",
  weight: "400",
});
const evolventaBold = localFont({
  src: "./fonts/Evolventa-Bold.woff",
  variable: "--font-evolventa-bold",
  weight: "700",
});

export const metadata: Metadata = {
  title: "Расписание занятий на 29.11-29.12",
  description: "Актуальное расписание занятий на 29.11.2024 - 29.12.2024",
  icons: {
    icon: '/favicon.png',
    // apple: '/apple-icon.png',
  },
  // viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // themeColor: "system",
  openGraph: {
    title: "Расписание занятий на 29.11-29.12",
    description: "Актуальное расписание занятий на 29.11.2024 - 294.12.2024",    
    type: 'website',
    images: [
      {
        url: 'https://shedule-rgsu.vercel.app/og-image.png',
        width: 800,
        height: 600,
      },
    ],    
  },
};

// RootLayout компонент
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSwitcher />
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
