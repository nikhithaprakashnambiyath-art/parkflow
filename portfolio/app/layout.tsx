import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nikhitha — Digital Universe",
  description: "Immersive 3D portfolio of Nikhitha Prakash, Creative Developer & Full Stack Builder. Enter a premium interactive digital universe.",
  keywords: ["Nikhitha Prakash", "Portfolio", "3D Portfolio", "Creative Developer", "Full Stack Builder", "React Three Fiber", "Next.js 15"],
  authors: [{ name: "Nikhitha Prakash" }],
  creator: "Nikhitha Prakash",
  openGraph: {
    title: "Nikhitha — Digital Universe",
    description: "Immersive 3D portfolio of Nikhitha Prakash, Creative Developer & Full Stack Builder.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nikhitha — Digital Universe",
    description: "Immersive 3D portfolio of Nikhitha Prakash, Creative Developer & Full Stack Builder.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} scroll-smooth dark`}>
      <body className="bg-[#050816] text-[#FFFFFF] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
