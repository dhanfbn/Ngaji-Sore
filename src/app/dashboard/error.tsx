'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-red-100 shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl" aria-hidden="true">😿</span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 font-poppins mb-3">
            Aduh, ada sedikit masalah!
          </h2>
          
          <p className="text-slate-500 font-nunito mb-8 leading-relaxed">
            Kami kesulitan mengambil data ngaji kamu saat ini. Mungkin koneksi internet sedang lambat atau sistem sedang istirahat.
          </p>
          
          <Button 
            onClick={() => reset()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-full py-6 font-poppins text-base"
          >
            Coba Lagi Yuk! 🔄
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
