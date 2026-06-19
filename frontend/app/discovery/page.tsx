'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DiscoveryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/search');
  }, [router]);

  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-50 items-center justify-center font-bold text-sm tracking-widest uppercase">
      Redirecting to ParkFlow AI Discovery...
    </div>
  );
}
