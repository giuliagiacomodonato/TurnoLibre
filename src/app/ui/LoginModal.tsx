'use client';

import { useState } from 'react';
// You might add imports for NextAuth signIn function later
// import { signIn } from 'next-auth/react';

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
    // TODO: Implement actual Google login logic using NextAuth signIn
    console.log('Attempting Google login');
    // Example using signIn (uncomment and adjust when NextAuth is fully set up and Google provider is configured):
    // signIn('google', { callbackUrl: '/inicio' }); // Redirects to /inicio after successful login
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
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

        {/* {error && <p className="text-red-500 text-sm mb-4">{error}</p>} */}

        <form className="space-y-4" onSubmit={handleSubmit}> {/* Reduced space-y */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#426a5a]">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#426a5a]">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#426a5a] text-white py-3 px-4 rounded-lg shadow-sm hover:bg-[#7fb685] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb685] transition-all duration-300"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-4 text-center">{/* Added margin top */}</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full border border-[#426a5a] text-[#426a5a] py-3 px-4 rounded-lg shadow-sm hover:bg-[#426a5a] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb685] transition-all duration-300 flex items-center justify-center"
        >
           {/* Google Icon Placeholder - Replace with actual SVG or Image */} 
           <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="mr-2"><path d="M16.51 8H17V9H16.51A8.985 8.985 0 0 0 10.2 2.021L9 3.057A7.015 7.015 0 0 1 15.49 8.001Z" fill="#4285F4"></path><path d="M5.78 8.001A7.015 7.015 0 0 1 11.8 3.057L13 2.021A8.985 8.985 0 0 0 1.51 8H1V9H1.51C1.557 8.673 1.622 8.338 1.705 8.001Z" fill="#34A853"></path><path d="M10.2 15.979A8.985 8.985 0 0 0 16.51 9H17V8H16.51A8.985 8.985 0 0 0 10.2 2.021L9 3.057A7.015 7.015 0 0 1 15.49 8.001Z" fill="#FBBC05"></path><path d="M1.705 8.001A7.015 7.015 0 0 1 11.8 3.057L10.66 4.092C7.531 1.072 3.206 0 0 0v17h17v-1h-17c0-2.915 1.177-5.621 3.298-7.701L4.55 6.946A4.996 4.996 0 0 0 0 8.001c0 3.187 2.118 5.854 5 6.735v-1.285a5 5 0 0 1-3.295-5.45z" fill="#EA4335"></path></svg>
          Ingresar con Google
        </button>

        <div className="mt-6 text-center">
          {/* Placeholder for forgot password or sign up link - adjust later */}
          <a href="#" className="text-sm text-[#426a5a] hover:text-[#7fb685] transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
} 