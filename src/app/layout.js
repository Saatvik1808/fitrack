import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'FitTrack AI',
  description: 'Minimalistic AI-powered fitness tracking application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
