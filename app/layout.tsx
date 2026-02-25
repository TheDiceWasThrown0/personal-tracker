import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { QuickDump } from "@/components/QuickDump";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Billionaire Roadmap Tracker",
  description: "Personal finance and career roadmap to 2030.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} antialiased bg-background text-foreground relative`}
      >
        {children}
        <QuickDump />
      </body>
    </html>
  );
}
