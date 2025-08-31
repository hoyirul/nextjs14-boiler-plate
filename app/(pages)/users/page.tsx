"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiV1 from "@/lib/axios";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiV1
      .get("/users")
      .then((res) => {
        console.log(res.data);
        setUsers(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await apiV1.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Users</h1>
        <Link
          href="/users/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add User
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 text-left">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-500 bg-gray-50"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <Link
                      href={`/users/${user.id}/detail`}
                      className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="px-3 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
