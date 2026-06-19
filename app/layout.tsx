import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Orbital Pulse – The Living Sky OS',
  description: 'What is the sky above you doing right now?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="scroll-smooth dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head />
      <body className="bg-[#030014] text-white min-h-screen antialiased selection:bg-purple-500/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}