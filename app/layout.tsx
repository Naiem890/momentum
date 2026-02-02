import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Inter, Russo_One, Playfair_Display, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/auth";
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
  title: {
    default: "Momentum | Gamified Habit Tracking",
    template: "%s | Momentum"
  },
  description: "Build streaks, earn XP, and level up your life with Momentum. The ultimate gamified habit tracker for staying consistent.",
  keywords: ["habit tracker", "gamification", "productivity", "streak", "momentum", "self-improvement", "goals"],
  authors: [{ name: "Momentum Team" }],
  metadataBase: new URL("https://momen-tum.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://momen-tum.vercel.app",
    title: "Momentum | Gamified Habit Tracking",
    description: "Build streaks, earn XP, and level up your life with Momentum. The ultimate gamified habit tracker for staying consistent.",
    siteName: "Momentum",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Momentum Dashboard"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentum | Gamified Habit Tracking",
    description: "Build streaks, earn XP, and level up your life with Momentum. The ultimate gamified habit tracker for staying consistent.",
    images: ["/og-image.png"],
    creator: "@momentum_app",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Momentum",
  },
  icons: {
    icon: "/icon.png?v=5",
    shortcut: "/icon.png?v=5",
    apple: "/apple-touch-icon.png?v=5",
  },
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
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

