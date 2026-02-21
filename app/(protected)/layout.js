import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }} = await supabase.auth.getUser();

      if(!user) {
        router.push("/login");

      } else {
        setLoading(false);
      }
    };

    checkUser();
  });

  if (loading) return <h4>Loading...</h4>;
  
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
