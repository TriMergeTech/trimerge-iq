"use client";

import { Loader, Trash2 } from "lucide-react";
import TableShell from "../components/table_shell";
import ActionIconButton from "../components/action_icon_button";
import Listempty from "../components/list_empty";

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
        ) : data.length === 0 ? (
          // Empty list component
          <Listempty
            title="No skills found"
            description="There are no skills to display. Add a new skill to get started."
          />
        ) : (
          data.map((item) => (
            <tr key={item._id} className="transition-colors hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{item.title}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {item.description}
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {new Date(item.created_at).toLocaleDateString()}
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
