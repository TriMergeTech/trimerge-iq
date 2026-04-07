"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Edit,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  lastLogin: Date;
}

interface AdminPageProps {
  onLogout: () => void;
}

const MOCK_USERS: User[] = [
  { id: "1", name: "John Smith", email: "john.smith@trimerge.com", role: "admin", createdAt: new Date("2024-01-15"), lastLogin: new Date("2025-03-24") },
  { id: "2", name: "Sarah Johnson", email: "sarah.j@trimerge.com", role: "user", createdAt: new Date("2024-02-20"), lastLogin: new Date("2025-03-23") },
  { id: "3", name: "Michael Chen", email: "m.chen@trimerge.com", role: "user", createdAt: new Date("2024-03-10"), lastLogin: new Date("2025-03-22") },
  { id: "4", name: "Emily Davis", email: "emily.d@trimerge.com", role: "user", createdAt: new Date("2024-03-15"), lastLogin: new Date("2025-03-20") },
];

const RECENT_ACTIVITY = [
  { user: "John Smith", action: "Created new user account", time: "2 minutes ago", type: "success" },
  { user: "Sarah Johnson", action: "Updated role permissions", time: "15 minutes ago", type: "info" },
  { user: "Michael Chen", action: "Deleted user account", time: "1 hour ago", type: "warning" },
  { user: "System", action: "Automated backup completed", time: "3 hours ago", type: "success" },
] as const;

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<"users" | "monitoring">("users");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("admin@trimerge.com");

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    if (storedEmail) {
      setLoggedInEmail(storedEmail);
    }
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
      }),
    [filterRole, searchQuery, users],
  );

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users],
  );

  const handleSaveUser = (user: User) => {
    if (user.id) {
      setUsers((current) => current.map((item) => (item.id === user.id ? user : item)));
    } else {
      setUsers((current) => [
        ...current,
        {
          ...user,
          id: Date.now().toString(),
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      ]);
    }

    setShowUserModal(false);
    setEditingUser(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-100">
      <aside className="relative w-64 bg-gradient-to-b from-[#1e5ba8] to-[#174a8f] text-white shadow-2xl">
        <div className="border-b border-white/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]">
              <Shield className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel</h2>
              <p className="text-xs text-blue-200">TriMerge Consulting</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          <SidebarButton active={activeTab === "users"} icon={Users} label="User Management" onClick={() => setActiveTab("users")} />
          <SidebarButton active={activeTab === "monitoring"} icon={Activity} label="System Monitoring" onClick={() => setActiveTab("monitoring")} />
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-white/20 p-4">
          <div className="mb-3">
            <p className="text-xs text-blue-200">Logged in as:</p>
            <p className="text-sm font-semibold text-white">{loggedInEmail}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 font-medium text-white transition-all hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {activeTab === "users" ? "User Management" : "System Monitoring"}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {activeTab === "users"
                    ? `Manage ${users.length} registered users`
                    : "View system logs and activity"}
                </p>
              </div>

              {activeTab === "users" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser({
                      id: "",
                      name: "",
                      email: "",
                      role: "user",
                      createdAt: new Date(),
                      lastLogin: new Date(),
                    });
                    setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#1e5ba8] px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-[#174a8f]"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </button>
              )}
            </div>

            {activeTab === "users" && (
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(event) => setFilterRole(event.target.value as "all" | "admin" | "user")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {activeTab === "users" && (
            <TableShell headers={["User", "Email", "Role", "Created", "Last Login", "Actions"]}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e5ba8] to-[#174a8f] font-semibold text-white">
                        {user.name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        setUsers((current) =>
                          current.map((item) =>
                            item.id === user.id ? { ...item, role: event.target.value as "admin" | "user" } : item,
                          ),
                        )
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        user.role === "admin" ? "bg-[#d4af37] text-gray-900" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.createdAt.toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.lastLogin.toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        color="blue"
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        color="red"
                        onClick={() =>
                          setUsers((current) => current.filter((item) => item.id !== user.id))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </TableShell>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={Users} accent="from-[#1e5ba8] to-[#174a8f]" value={users.length.toString()} label="Total Users" trend="+12%" />
                <StatCard icon={Shield} accent="from-[#d4af37] to-[#c19a2e]" value={adminCount.toString()} label="Admin Accounts" trend="+2%" dark />
                <StatCard icon={Check} accent="from-green-500 to-green-600" value="Online" label="System Status" trend="99.9%" />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Activity className="h-5 w-5 text-[#1e5ba8]" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((activity) => (
                    <div
                      key={`${activity.user}-${activity.time}`}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          activity.type === "success"
                            ? "bg-green-500"
                            : activity.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserModal && editingUser && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function SidebarButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all ${
        active ? "bg-[#d4af37] text-gray-900 shadow-lg" : "text-white hover:bg-white/10"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function TableShell({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function ActionIconButton({
  color,
  onClick,
  children,
}: {
  color: "blue" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
        color === "blue" ? "text-[#1e5ba8] hover:bg-blue-50" : "text-red-600 hover:bg-red-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  accent,
  value,
  label,
  trend,
  dark = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  value: string;
  label: string;
  trend: string;
  dark?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${accent} ${
            dark ? "text-gray-900" : "text-white"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-green-600">{trend}</span>
      </div>
      <h3 className="mb-1 text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function UserModal({
  user,
  onSave,
  onClose,
}: {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<User>(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-[#1e5ba8] to-[#174a8f] p-6">
          <h3 className="text-xl font-bold text-white">
            {user.id ? "Edit User" : "Add New User"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(formData);
          }}
          className="space-y-4 p-6"
        >
          <FormField label="Name">
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
              required
            />
          </FormField>
          <FormField label="Role">
            <select
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value as "admin" | "user" })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
          <ModalActions onClose={onClose} />
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function ModalActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 rounded-lg bg-[#1e5ba8] px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#174a8f]"
      >
        Save
      </button>
    </div>
  );
}
