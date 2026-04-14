import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TriMerge Consulting Group",
    template: "%s / TriMerge Consulting Group",
  },
  description:
    "TriMerge Consulting Group delivers strategic consulting, search, chat, and administration experiences for modern business teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
