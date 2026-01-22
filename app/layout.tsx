import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Расписание занятий РГСУ | Филиал в Минске",
  description: "Актуальное расписание занятий Филиала РГСУ в г. Минске на 2025-2026 учебный год. Поиск по группам, преподавателям и датам. Экспорт в PDF.",
  keywords: ["расписание", "РГСУ", "Минск", "занятия", "университет", "студенты", "преподаватели"],
  authors: [{ name: "Филиал РГСУ в г. Минске" }],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Расписание РГСУ',
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://shedule-rgsu.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Расписание занятий РГСУ | Филиал в Минске",
    description: "Актуальное расписание занятий Филиала РГСУ в г. Минске на 2025-2026 учебный год",
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Расписание РГСУ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Расписание занятий РГСУ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Расписание занятий РГСУ",
    description: "Актуальное расписание занятий Филиала РГСУ в г. Минске",
    images: ['/og-image.png'],
  },
};

// RootLayout компонент
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSwitcher />
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
