import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./components/theme-toggle/theme-toggle.css";
import "./components/hydration-tracker/hydration-tracker.css";
import "./components/forget-list/forget-list.css";
import "./components/gallery/gallery.css";
import "./components/flower/flower.css";
import "./components/valentine/valentine.css";
import "./components/valentine-runner/valentine-runner.css";
import "./components/birthday/birthday.css";
import "./components/mbta-tracker/mbta-tracker.css";
import ThemeToggle from "./components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sheng ♡ Anne",
  description: "A little corner for Sheng & Anne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
