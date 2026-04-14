import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'VideoForge - Enterprise Video Downloader',
  description: 'Multi-platform video downloading with streaming support',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-dm-sans antialiased">
        {children}
      </body>
    </html>
  );
}
