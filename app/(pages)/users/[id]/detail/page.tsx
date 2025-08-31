"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiV1 from "@/lib/axios";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    apiV1
      .get(`/users/${params.id}`)
      .then((res) => setUser(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-red-600">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          User Detail
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(user.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/users/${user.id}/edit`)}
            className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Edit
          </button>
          <button
            onClick={() => router.push("/users")}
            className="flex-1 border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
