export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#426a5a] mb-6"></div>
      <p className="text-xl text-[#426a5a] font-semibold">Cargando TurnoLibre...</p>
    </div>
  );
} 