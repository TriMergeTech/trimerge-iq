"use client";

import { Loader, Trash2 } from "lucide-react";
import TableShell from "../components/table_shell";
import ActionIconButton from "../components/action_icon_button";
import { useEffect, useState } from "react";
import { post_request } from "../utils/services";
import Listempty from "../components/list_empty";

const Stafflist = ({ data }) => {
  let [staffs, set_staffs] = useState(data);
  let [positions, setPositions] = useState(null);

  console.log(data);

  useEffect(() => {
    set_staffs(data);
  }, [data]);

  useEffect(() => {
    const fetch_positions = async () => {
      if (positions) return; // already have positions, no need to fetch again

      try {
        const res = await post_request("get_positions");
        console.log("Positions response:", res);
        res.ok && setPositions(res.data);
      } catch (err) {
        console.error("Failed to fetch positions", err);
      }
    };

    fetch_positions();
  }, []);

  const update_position = async (user_id, position_id) => {
    if (!position_id) return;

    try {
      const res = await post_request("$PROFILE/update_profile", {
        profile: user_id,
        updates: { position: position_id },
      });

      if (!res.ok) {
      } else {
        set_staffs((prev) => {
          return prev.map((p) => {
            if (p._id === user_id) p.position = position_id;
            return [];
          });
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while updating position");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <TableShell
        headers={[
          "User",
          "Email",
          "Position",
          "Created",
          // "Last Login",
          "Actions",
        ]}
      >
        {!staffs ? (
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
        ) : staffs?.length === 0 ? (
          <Listempty
            title="No staffs found"
            description="There are no staffs to display. Add a new position to get started."
          />
        ) : (
          staffs.map((user) => (
            <tr key={user._id} className="transition-colors hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e5ba8] to-[#174a8f] font-semibold text-white">
                    {user?.fullname
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="font-medium text-gray-900">
                    {user.fullname}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {user.email}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={user.position}
                  onChange={(event) => {
                    update_position(user._id, event.target.value);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${"bg-gray-200 text-gray-800"}`}
                >
                  <option disabled selected value="">
                    -- Select Position --{" "}
                  </option>

                  {positions?.map((pos) => (
                    <option key={pos._id} value={pos._id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {new Date(user.created).toLocaleDateString()}
              </td>
              {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {user.lastLogin.toLocaleDateString()}
                </td> */}
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  {/* <ActionIconButton
                      color="blue"
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </ActionIconButton> */}
                  <ActionIconButton
                    color="red"
                    onClick={() =>
                      setUsers((current) =>
                        current.filter((item) => item._id !== user._id),
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

export default Stafflist;
