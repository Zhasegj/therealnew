import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const admins = await base44.entities.AdminUser.filter({ 
      username: username, 
      password: password 
    });

    if (admins.length > 0) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      window.location.href = createPageUrl('AdminDashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Panel de Administración</CardTitle>
          <p className="text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 py-5"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-5"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}