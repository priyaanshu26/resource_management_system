import { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resource Management System',
  description: 'Manage buildings, resources, and bookings efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
