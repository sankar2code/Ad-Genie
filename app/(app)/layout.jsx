'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';

export default function AppLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-ag-bg-base">
      <Nav />
      <main className="flex-1 ml-[72px] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
