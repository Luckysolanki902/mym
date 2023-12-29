import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p>Loading...</p>; // Display a loader while checking the session
  }

  if (!session) {
    router.replace("/signin"); // Redirect to the signin page if not signed in
    return null; // Return null to prevent rendering anything else
  }
return(
    <>dashboard</>
)
  // Your dashboard content can follow here
}