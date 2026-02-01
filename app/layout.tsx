import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Inter, Russo_One, Playfair_Display, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});
const russoOne = Russo_One({ subsets: ['latin'], weight: '400', variable: '--font-russo' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'] });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], style: ['normal', 'italic'], variable: '--font-merriweather' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentum",
  description: "Gamified habit tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable} ${russoOne.variable} ${playfairDisplay.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
