
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider';
import { UserProvider } from '@/contexts/user-context';

export const metadata: Metadata = {
  title: 'AndonPro',
  description: 'Monitor workflow and resolve issues on your production line.',
  manifest: '/manifest.json',
  icons: {
    icon: '/Andonpro_Liikemerkki_Musta.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
              {children}
          </UserProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
