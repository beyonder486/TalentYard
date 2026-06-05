import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TalentYard",
  description: "Student freelancer marketplace built for part-time earnings and project experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
