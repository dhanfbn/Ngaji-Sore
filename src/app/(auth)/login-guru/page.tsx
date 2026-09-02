'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, User, Rocket } from 'lucide-react';

export default function LoginGuruPage() {
  const router = useRouter();
  const [idGuru, setIdGuru] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_guru: idGuru, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/guru/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Gagal masuk, periksa kembali data kamu.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white px-4">
      {/* Top Section */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-48 h-48 bg-white flex items-center justify-center shadow-md mb-4 border border-green-100">
          <img src="logo.jpeg" alt="Logo" />
        </div>
        <p className="text-green-600 font-semibold font-nunito tracking-wide">
          Ruang Belajar Quran Anak 💚
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-[420px] rounded-[24px] shadow-xl border-slate-100 p-2 sm:p-4 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 font-poppins pt-4">Halo, Ustadz/Ustadzah! 👋</CardTitle>
          <CardDescription className="text-slate-500 font-nunito text-base mt-2">
            Masuk untuk mulai mengajar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id_guru" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ID GURU
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="id_guru"
                  type="text"
                  placeholder="Contoh: GRU001"
                  value={idGuru}
                  onChange={(e) => setIdGuru(e.target.value.toUpperCase())}
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-colors text-slate-700"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                PASSWORD
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-colors text-slate-700"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-nunito animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Sedang masuk...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Masuk
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-slate-50 mt-4">
          <p className="text-sm text-slate-500 text-center font-nunito max-w-[250px]">
            Lupa password? Hubungi admin 😊
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
