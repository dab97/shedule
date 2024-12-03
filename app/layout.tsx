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

// Определение `metadata`
export const Metadata = {
  title: "Расписание занятий на 29.11-14.12",
  description: "Актуальное расписание занятий на 29.11.2024 - 14.12.2024",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Расписание занятий на 29.11-14.12",
    description: "Актуальное расписание занятий на 29.11.2024 - 14.12.2024",
  },
};

// Определение `viewport` (новый экспорт)
export function generateViewport() {
  return "width=device-width, initial-scale=1.0";
}

// Определение `themeColor` (новый экспорт)
export function generateThemeColor() {
  return "#ffffff";
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSwitcher />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}