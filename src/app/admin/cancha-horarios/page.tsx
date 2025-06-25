import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { redirect } from "next/navigation";
import CanchaHorariosAdminClient from "@/app/ui/CanchaHorariosAdminClient";

export default async function CanchaHorariosAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Fetch sedes, canchas y deportes en el servidor
  const [sedesRes, canchasRes, sportsRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/locations", { cache: "no-store" }),
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/facilities", { cache: "no-store" }),
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/sports", { cache: "no-store" })
  ]);
  const [sedes, canchas, sports] = await Promise.all([
    sedesRes.json(),
    canchasRes.json(),
    sportsRes.json()
  ]);

  return (
    <CanchaHorariosAdminClient sedes={sedes} canchas={canchas} sports={sports} />
  );
}