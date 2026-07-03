import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Devices Orchestra",
  description: "Creating and operating a Mobile Device Orchestra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
