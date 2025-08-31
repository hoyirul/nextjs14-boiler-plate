"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import apiV1 from "@/lib/axios";
import Button from "@/components/ui/Button";

interface User {
  id: number;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Ambil data user dari backend / API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiV1.get("/auth/me"); // endpoint get current user
        setUser(res.data.data.user);
      } catch (err) {
        console.error(err);
        Cookies.remove("token");
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiV1.post("/auth/logout");
      Cookies.remove("token");
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-start">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Button onClick={handleLogout} variant="secondary" className="space-x-4 px-6 bg-red-500 hover:bg-red-600 font-regular text-white">
          Logout
        </Button>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-6 items-center">
        <div className="bg-white p-6 rounded-xl shadow-md w-full text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Welcome{user ? `, ${user.email}` : ""}
          </h2>
          <p className="text-gray-600">
            This is your dashboard home page. You can customize it to show stats, recent activity, or anything else.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Button onClick={() => router.push("/users")}>Users</Button>
          <Button onClick={() => router.push("/settings")} variant="secondary">
            Settings
          </Button>
        </div>
      </main>
    </div>
  );
}