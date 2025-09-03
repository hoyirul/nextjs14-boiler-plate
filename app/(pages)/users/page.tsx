"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiV1 from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const pageSize = 10;

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 🔹 Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await apiV1.get("/users", {
          params: {
            page,
            pageSize,
            search: debouncedSearch,
            sortBy,
            order,
          },
        });
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, debouncedSearch, sortBy, order]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await apiV1.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header & Search */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Users</h1>
        <Link
          href="/users/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add User
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-full"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="created_at">Created At</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 p-4">Loading...</p>
      ) : (
        <table className="w-full text-sm bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
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
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="p-4 font-medium text-gray-800">{user.name}</td>
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
      )}

      {/* Pagination */}
      <div className="flex justify-end gap-1 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">{page}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
