"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

// ...existing code...
export default function TasksPage() {
  const router = useRouter();

  // Check JWT token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/verifyToken", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.valid) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };
    checkToken();
  }, [router]);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "",
    updateuserby: "",
  });
  const [message, setMessage] = useState<string | null>(null); // <-- Add this line
  const [search, setSearch] = useState("");

  // Filter tasks by title
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIdx = (currentPage - 1) * tasksPerPage;
  const currentTasks = tasks.slice(startIdx, startIdx + tasksPerPage);

  async function fetchTasks(title = "") {
    const token = localStorage.getItem("token");
    const url = title
      ? `/api/tasks?title=${encodeURIComponent(title)}`
      : "/api/tasks";
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(Array.isArray(data.data) ? data.data : []);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null); // Clear previous message
    const token = localStorage.getItem("token");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ title: "", description: "", status: "", updateuserby: "" });
      setMessage("Task created successfully!"); // <-- Success message
      fetchTasks();
    } else {
      setMessage("Failed to create task."); // <-- Error message
    }
  }

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
  });

  async function handleEdit(task: Task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      // updateuserby: task.updateuserby,
    });
    const token = localStorage.getItem("token");
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...editForm, id: editingId, userId: editingId }),
    });
  }

  async function handleUpdate() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...editForm, id: editingId, userId: editingId }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchTasks(search);
      setMessage("Task updated successfully!");
    } else {
      setMessage("Failed to update task.");
    }
  }

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  async function fetchTask(title = "", status: string | null = null) {
    const token = localStorage.getItem("token");
    let url = "/api/status";
    const params = [];
    if (title) params.push(`title=${encodeURIComponent(title)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (params.length) url += "?" + params.join("&");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(Array.isArray(data.data) ? data.data : []);
  }

  useEffect(() => {
    fetchTask();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      {/* Show message */}
      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.includes("success")
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {["title", "description", "status"].map((field) => (
          <input
            key={field}
            className="w-full p-2 border rounded"
            placeholder={field}
            value={form[field as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">All Tasks</h2>
        {currentTasks.map((task) => (
          <div
            key={task.id}
            className="border p-3 rounded shadow mb-2 flex items-start gap-4"
          >
            {editingId === task.id ? (
              <form
                className="flex flex-col gap-2 flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
              >
                <input
                  className="border rounded px-2 py-1"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-1 rounded"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Status: {task.status}</p>
                  {/* <p>Updated By: {task.updateuserby}</p> */}
                </div>
                <button
                  className="bg-yellow-500 text-white px-4 py-1 rounded h-fit"
                  onClick={() => handleEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded h-fit ml-2"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this task?")) {
                      const token = localStorage.getItem("token");
                      const res = await fetch("/api/tasks", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ id: task.id }),
                      });
                      if (res.ok) {
                        fetchTasks(search);
                        setMessage("Task deleted successfully!");
                      } else {
                        setMessage("Failed to delete task.");
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-8 mt-10">
            <button
              className="w-72 py-16 bg-blue-700 text-white font-extrabold rounded-2xl shadow-2xl hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-7xl mb-4"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="text-4xl font-bold mb-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="w-72 py-16 bg-blue-700 text-white font-extrabold rounded-2xl shadow-2xl hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-7xl"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold mb-4">Search Tasks</h1>
        </div>
        <div className="flex justify-center mt-6 gap-2">
          <input
            type="text"
            className="border rounded px-4 py-2 w-full max-w-md"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchTasks(search);
                setCurrentPage(1);
              }
            }}
          />
          <button
            className="bg-blue-700 text-white px-6 py-2 rounded font-bold hover:bg-blue-900 transition"
            onClick={() => {
              fetchTasks(search);
              setCurrentPage(1);
            }}
          >
            Search
          </button>
          <button
            className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-900 transition"
            onClick={async () => {
              setStatusFilter("1");
              const token = localStorage.getItem("token");
              const res = await fetch(`/api/status?status=1`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              setTasks(Array.isArray(data.data) ? data.data : []);
              setCurrentPage(1);
            }}
          >
            Status 1
          </button>
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-900 transition"
            onClick={async () => {
              setStatusFilter("2");
              const token = localStorage.getItem("token");
              const res = await fetch(`/api/status?status=2`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              setTasks(Array.isArray(data.data) ? data.data : []);
              setCurrentPage(1);
            }}
          >
            Status 2
          </button>
        </div>
      </div>
    </div>
  );
}
