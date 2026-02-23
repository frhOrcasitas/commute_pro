"use client";

import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
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
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h4>Loading...</h4>
      </div>
    );
  }
  
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
