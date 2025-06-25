import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { redirect } from "next/navigation";
import EditarDisponibilidadClient from "@/app/ui/EditarDisponibilidadClient";

export default async function EditarDisponibilidadPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Fetch facilities en el servidor
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/facilities", { cache: "no-store" });
  const facilities = await res.json();

  return (
    <EditarDisponibilidadClient facilities={facilities} />
  );
}