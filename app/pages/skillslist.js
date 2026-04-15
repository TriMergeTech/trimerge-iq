"use client";

import { Loader, Trash2 } from "lucide-react";
import TableShell from "../components/table_shell";
import ActionIconButton from "../components/action_icon_button";

const Skills_list = ({ data }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <TableShell headers={["Name", "Description", "Created", "Actions"]}>
        {!data ? (
          <tr>
            <td colSpan="6">
              <div className="flex items-center justify-center py-16">
                <Loader
                  className="h-16 w-16 animate-spin text-gray-500"
                  aria-label="Loading"
                />
              </div>
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={item._id} className="transition-colors hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e5ba8] to-[#174a8f] font-semibold text-white">
                    {item?.name
                      ?.split(" ")
                      ?.map((part) => part[0])
                      ?.join("")}
                  </div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {item.email}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={item.profile}
                  onChange={(event) =>
                    setUsers((current) =>
                      current.map((item) =>
                        item._id === item._id
                          ? { ...item, role: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    item.role === "admin"
                      ? "bg-[#d4af37] text-gray-900"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <option value="item">activeTab</option>
                </select>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {new Date(item.created).toLocaleDateString()}
              </td>
              {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {item.lastLogin.toLocaleDateString()}
                </td> */}
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <ActionIconButton
                    color="red"
                    onClick={() =>
                      setUsers((current) =>
                        current.filter((item) => item._id !== item._id),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </ActionIconButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </TableShell>
    </div>
  );
};

export default Skills_list;
