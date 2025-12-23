import type { Metadata } from 'next';
import './globals.css';
import { Header, ErrorBoundary } from '@/components';

// Fonts imported via Google Fonts in globals.css

export const metadata: Metadata = {
  title: 'Super Secret Supper',
  description: 'Pairing you with someone new for an unforgettable dinner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Header />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
