import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p>Loading...</p>; // Display a loader while checking the session
  }

  if (!session) {
    router.replace("auth/signin"); // Redirect to the signin page if not signed in
  }



  // Your dashboard content can follow here
  return (
    <>
      <p>dashboard</p>
    </>
  );
}
