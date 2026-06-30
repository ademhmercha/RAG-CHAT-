import { useState, useEffect, useCallback } from "react";
import { admin } from "../../api/client";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await admin.getUsers(params);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleDisabled = async (userId, current) => {
    try {
      await admin.updateUser(userId, { disabled: !current });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, disabled: !current } : u)));
      toast.success(current ? "User enabled" : "User disabled");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleToggleRole = async (userId, current) => {
    const newRole = current === "admin" ? "user" : "admin";
    try {
      await admin.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await admin.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Users</h1>

      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by name or email..."
        className="w-full max-w-xs mb-4 px-3 py-2 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
      />

      {loading ? (
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs uppercase">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.role === "admin" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${u.disabled ? "text-red-400" : "text-green-400"}`}>
                        {u.disabled ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleDisabled(u._id, u.disabled)} className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg-card-hover)]">
                          {u.disabled ? "Enable" : "Disable"}
                        </button>
                        <button onClick={() => handleToggleRole(u._id, u.role)} className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg-card-hover)]">
                          Toggle Role
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-xs rounded border ${page === i + 1 ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
