import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const fontFamily = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrueSalesBot - Your personlized sales AI assitant.",
  description:
    "Boost your sales with our AI-powered sales assistant that learns your unique style and delivers personalized sales pitches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontFamily.className}>{children}</body>
    </html>
  );
}
