'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // You might add state for error messages later
  // const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual email/password login logic using NextAuth signIn
    console.log('Attempting email/password login with:', { email, password });
    // Example using signIn (uncomment and adjust when NextAuth is fully set up):
    // const result = await signIn('credentials', {
    //   redirect: false,
    //   email,
    //   password,
    // });
    // if (result?.error) {
    //   setError(result.error);
    // } else {
    //   onClose(); // Close modal on successful login
    //   // Optionally, redirect user or refresh page
    // }

    // For now, just close the modal after a simulated attempt
    // onClose();
  };

  const handleGoogleSignIn = async () => {
    signIn('google', { callbackUrl: '/inicio' });
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-screen overflow-y-auto flex flex-col justify-center">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#426a5a] mb-2">Iniciar Sesión</h2>
        </div>

       

        <div className="mt-4 text-center">{/* Added margin top */}</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full border border-[#426a5a] text-[#426a5a] py-3 px-4 rounded-lg shadow-sm hover:bg-[#426a5a] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb685] transition-all duration-300 flex items-center justify-center"
        >
          <svg className="mr-2" width="18" height="18" viewBox="0 0 18 18">
            <g>
              <path d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8364H9v3.4818h4.8445c-.2082 1.1218-.8345 2.0736-1.7764 2.7136v2.2582h2.8736C16.3464 14.1127 17.64 11.9273 17.64 9.2045z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1864l-2.8736-2.2582c-.7973.5345-1.8145.8491-3.0827.8491-2.3691 0-4.3773-1.6018-5.0964-3.7573H.9391v2.3218C2.4227 16.8973 5.4818 18 9 18z" fill="#34A853"/>
              <path d="M3.9036 10.6473c-.1818-.5345-.2864-1.1045-.2864-1.6473s.1045-1.1127.2864-1.6473V5.0309H.9391C.3409 6.2582 0 7.5909 0 9c0 1.4091.3409 2.7418.9391 3.9691l2.9645-2.3218z" fill="#FBBC05"/>
              <path d="M9 3.5791c1.3227 0 2.5045.4545 3.4364 1.3455l2.5773-2.5773C13.4645.8064 11.4273 0 9 0 5.4818 0 2.4227 1.1027.9391 3.0309l2.9645 2.3218C4.6227 4.4282 6.6309 3.5791 9 3.5791z" fill="#EA4335"/>
            </g>
          </svg>
          Ingresar con Google
        </button>
      </div>
    </div>
  );
}

// Nuevo modal para login de admin
interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  error?: string;
}

export function AdminLoginModal({ isOpen, onClose, onLogin, error }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-screen overflow-y-auto flex flex-col justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#426a5a] mb-2">Iniciar Sesión de Administrador</h2>
        </div>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#426a5a]">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#426a5a]">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="flex items-center mt-2 select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              Mostrar contraseña
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-[#426a5a] text-white py-3 px-4 rounded-lg shadow-sm hover:bg-[#7fb685] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb685] transition-all duration-300"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
} 