import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const baiJamjuree = Bai_Jamjuree({
  weight: ['200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bai-jamjuree',
});

export const metadata: Metadata = {
  title: "Curio - Personalized Learning",
  description: "AI-powered personalized education platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={baiJamjuree.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
