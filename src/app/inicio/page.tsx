import HomeClient from "@/app/ui/HomeClient";
import { PushSubscribeButton } from "../ui/PushSubscribeButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions";

export default async function HomePage() {
  const [sportsRes, locationsRes, facilitiesRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/sports", { cache: "no-store" }),
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/locations", { cache: "no-store" }),
    fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/facilities", { cache: "no-store" })
  ]);
  const [sports, locations, facilities] = await Promise.all([
    sportsRes.json(),
    locationsRes.json(),
    facilitiesRes.json()
  ]);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <>
      <HomeClient sports={sports} locations={locations} facilities={facilities} />
      
    </>
  );
}

