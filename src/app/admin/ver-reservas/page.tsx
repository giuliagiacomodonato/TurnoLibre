import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { redirect } from "next/navigation";
import ReservationsTableClient from "@/app/ui/ReservationsTableClient";
import { AdminHeader } from "../../ui/Header";

export default async function VerReservasPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Gestión de Reservas</h1>
        <ReservationsTableClient />
      </div>
    </>
  );
} 