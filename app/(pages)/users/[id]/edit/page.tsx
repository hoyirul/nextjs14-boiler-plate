"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiV1 from "@/lib/axios";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    apiV1
      .get(`/users/${params.id}`)
      .then((res) => {
        setForm({
          name: res.data.data.name,
          email: res.data.data.email,
        });
      })
      .catch(() => setError("Failed to fetch user"))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiV1.put(`/users/${params.id}`, form);
      router.push("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          Edit User
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => router.push("/users")}
              className="flex-1 border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
