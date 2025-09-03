"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiV1 from "@/lib/axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Cookies from "js-cookie";

interface Form {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      const res = await apiV1.post("/auth/login", form);
      const data = res.data;

      if (data.success) {
        // Save token to cookies (or localStorage)
        Cookies.set("token", data.data.token, { expires: 1 });
        router.push("/"); // redirect to dashboard
      } else {
        console.log(data);
        setError(data.message || "Login failed");
        if (data.error) setFieldErrors(data.error);
        router.push("/auth/login");
      }
    } catch (err: any) {
      const data = err.response?.data;
      console.log(err);
      setError(data?.message || "Failed to login");
      if (data?.error) setFieldErrors(data.error);
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Login</h1>

        {/* Global error */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="******"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            error={fieldErrors.password}
          />

          <Button type="submit" fullWidth>
            Login
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a href="/auth/register" className="text-black hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
