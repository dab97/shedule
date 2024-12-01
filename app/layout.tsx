import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import localFont from "next/font/local";
import "./globals.css";

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
  variable: "--font-geist-mono",
  weight: "100 900",
});
const evolventaBold = localFont({
  src: "./fonts/Evolventa-Bold.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Расписание занятий на 29.11-14.12",
  description: "Актуальное расписание занятий на 29.11.2024 - 14.12.2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${evolventaSans.variable} ${geistMono.variable} antialiased`}
      >       
        {children}
        <Analytics />
      </body>
    </html>
  );
}
