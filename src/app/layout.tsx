
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'
import { UserProvider } from '@/contexts/user-context';
import { AppLayout } from '@/components/layout/app-layout';

export const metadata: Metadata = {
  title: 'AndonPro',
  description: 'Monitor workflow and resolve issues on your production line.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
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
          <UserProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </UserProvider>
      </body>
    </html>
  );
}
