"use client";
import ClientWrapper from './ClientWrapper';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminHeader } from "../../ui/Header";

export default function VerReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "ADMIN") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Gestión de Reservas</h1>
        <ClientWrapper />
      </div>
    </>
  );
} 