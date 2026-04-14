"use client";

import { Loader, Trash2 } from "lucide-react";
import TableShell from "../components/table_shell";

const Position_list = ({ data }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <TableShell headers={["Name", "Description"]}>
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
          data.map((user) => null)
        )}
      </TableShell>
    </div>
  );
};

export default Position_list;
