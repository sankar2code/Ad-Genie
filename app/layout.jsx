import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Ad-Genie — Your Wish for Savings',
  description: 'AI-powered deals and discount discovery for Target, Walmart, and CVS.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
