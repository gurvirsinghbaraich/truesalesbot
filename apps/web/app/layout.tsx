import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/cn";

const fontFamily = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrueSalesBot - Your personalized sales AI assistant",
  openGraph: {
    title: "TrueSalesBot",
    description: "Your personalized sales AI assistant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen flex flex-col bg-accent-background",
          fontFamily.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
