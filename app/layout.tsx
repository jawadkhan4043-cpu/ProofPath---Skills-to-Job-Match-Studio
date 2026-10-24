import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPath — Skills-to-Job Match Studio",
  description:
    "Compare job descriptions with demonstrable skills and track applications.",
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