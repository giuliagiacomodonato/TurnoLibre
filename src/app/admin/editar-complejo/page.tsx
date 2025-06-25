import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { redirect } from "next/navigation";
import EditarComplejoClient from "@/app/ui/EditarComplejoClient";

export default async function EditarComplejoPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Fetch locations en el servidor
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/locations", { cache: "no-store" });
  const locations = await res.json();

  return (
    <EditarComplejoClient locations={locations} />
  );
} 