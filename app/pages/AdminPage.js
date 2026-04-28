"use client";

import { act, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { post_request } from "../utils/services";
import Stafflist from "./stafflist";
import Adminlist from "./adminlist";
import Positionlist from "./position_list";
import Skillslist from "./skillslist";
import Serviceslist from "./serviceslist";
import PositionModal from "./position_modal";
import SkillModal from "./skills_modal";
import Service_form from "./service_form";
import Clients_list from "./clientslist";
import ClientModal from "./client_modal";

export default function AdminPage({ searchParam, onLogout, profile }) {
  const [activeTab, setActiveTab] = useState(searchParam.tab || "staff");
  const [admin, set_admin] = useState(profile || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [data, setData] = useState(null);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, searchQuery]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // sync active tab to URL (replace so tab switches don't fill history)
      try {
        const params = new URLSearchParams(searchParam?.toString() || "");
        params.set("tab", activeTab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.replace(newUrl);
      } catch (err) {
        console.warn("Failed to update tab query param", err);
      }

      try {
        let url =
          activeTab === "position"
            ? "get_positions"
            : activeTab === "skills"
              ? "get_skills"
              : activeTab === "services"
                ? "get_services"
                : activeTab === "clients"
                  ? "get_clients"
                  : null;

        let res =
          url &&
          (await post_request(url, {
            ...pagination,
            search: debouncedSearch,
          }));

        console.log(res, "HI");
        if (res?.ok) {
          setData(res.data);
          setTotalPages(res.pagination?.pages);
        }
        if (res) return;

        res = await post_request(`$PROFILE/get_profiles`, {
          profile:
            activeTab === "staff"
              ? "98260a6c-e1d5-46f1-8ab3-4f30a062b52a"
              : activeTab === "admin"
                ? "52a1d68b-87d6-4adf-8d38-777656a427d6"
                : "",
          ...pagination,
        });

        if (res.ok) {
          setData(res.data);
          setTotalPages(res.pagination?.pages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, pagination.page, pagination.limit, debouncedSearch]);

  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  let router = useRouter();

  const nextPage = () => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  const set_active_tab = (tab) => {
    if (tab === activeTab) return;
    setData(null);
    setActiveTab(tab);
  };

  const handleSave = (datum) => {
    setShowUserModal(false);
    setData((prev) => [...prev, datum]);
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
              <h2 className="text-lg font-bold">{admin?.fullname}</h2>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {[
            {
              key: "staff",
              icon: Users,
              label: "Staff Management",
              tab: "staff",
            },
            {
              key: "admin",
              icon: Users,
              label: "Admin Management",
              tab: "admin",
            },
            {
              key: "position",
              icon: Users,
              label: "Position Management",
              tab: "position",
            },
            {
              key: "skills",
              icon: Users,
              label: "Skills Management",
              tab: "skills",
            },
            {
              key: "services",
              icon: Users,
              label: "Services Management",
              tab: "services",
            },
            {
              key: "clients",
              icon: Users,
              label: "Clients Management",
              tab: "clients",
            },
          ].map(({ key, icon, label, tab }) => (
            <SidebarButton
              key={key}
              active={activeTab === tab}
              icon={icon}
              label={label}
              onClick={() => set_active_tab(tab)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-white/20 p-4">
          <div className="mb-3">
            <p className="text-xs text-blue-200">Logged in as:</p>
            <p className="text-sm font-semibold text-white">{admin?.email}</p>
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
                  {`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {`Manage ${data?.length || "-"} registry`}
                </p>
              </div>

              {
                <button
                  type="button"
                  onClick={() => {
                    ["staff", "admin"].includes(activeTab)
                      ? router.push(`/signup?redirect=${activeTab.slice(0)}`)
                      : setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#1e5ba8] px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-[#174a8f]"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </button>
              }
            </div>

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
              {/* <select
                value={filterRole}
                onChange={(event) => setFilterRole(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select> */}
            </div>
          </div>
        </div>

        {activeTab === "staff" ? (
          <Stafflist data={data} />
        ) : activeTab === "admin" ? (
          <Adminlist data={data} />
        ) : activeTab === "position" ? (
          <Positionlist data={data} />
        ) : activeTab === "clients" ? (
          <Clients_list data={data} />
        ) : activeTab === "skills" ? (
          <Skillslist data={data} />
        ) : activeTab === "services" ? (
          <Serviceslist data={data} />
        ) : null}

        <div className="flex items-center gap-3 mt-4">
          <button onClick={prevPage} disabled={pagination.page === 1}>
            Prev
          </button>

          <span>
            Page {pagination.page} of {totalPages}
          </span>

          <button onClick={nextPage} disabled={pagination.page === totalPages}>
            Next
          </button>
        </div>
      </div>

      {showUserModal && (
        <Modal
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        >
          {activeTab === "services" ? (
            <Service_form
              onClose={() => setShowUserModal(false)}
              onSave={handleSave}
            />
          ) : activeTab === "position" ? (
            <PositionModal
              onClose={() => setShowUserModal(false)}
              onSave={handleSave}
            />
          ) : activeTab === "clients" ? (
            <ClientModal
              onClose={() => setShowUserModal(false)}
              onSave={handleSave}
            />
          ) : activeTab === "skills" ? (
            <SkillModal
              skill={
                editingUser || {
                  title: "",
                  description: "",
                  responsibilities: "",
                }
              }
              onClose={() => setShowUserModal(false)}
              onSave={handleSave}
            />
          ) : null}
        </Modal>
      )}
    </div>
  );
}

function SidebarButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all ${
        active
          ? "bg-[#d4af37] text-gray-900 shadow-lg"
          : "text-white hover:bg-white/10"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, accent, value, label, trend, dark = false }) {
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

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-end rounded-t-xl p-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
}

function UserModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-[#1e5ba8] to-[#174a8f] p-6">
          <h3 className="text-xl font-bold text-white">
            {user._id ? "Edit User" : "Add New User"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/20"
          >
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
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e5ba8]"
              required
            />
          </FormField>
          <FormField label="Role">
            <select
              value={formData.role}
              onChange={(event) =>
                setFormData({ ...formData, role: event.target.value })
              }
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

function ModalActions({ onClose }) {
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
