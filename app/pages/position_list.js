"use client";

import { Loader, Trash2 } from "lucide-react";
import TableShell from "../components/table_shell";
import { useEffect, useState } from "react";
import { post_request } from "../utils/services";
import Listempty from "../components/list_empty";

const Position_list = ({ data }) => {
  let [skills, set_skills] = useState(null);

  useEffect(() => {
    const fetch_skills = async () => {
      if (!data || !Array.isArray(data)) return;
      if (skills) return; // already have skills, no need to fetch again

      // derive unique skill ids from the data array
      const idsSet = data.reduce((set, item) => {
        if (item?.skills && Array.isArray(item.skills)) {
          item.skills.forEach((s) => {
            if (s != null) set.add(s);
          });
        }
        return set;
      }, new Set());

      const ids = Array.from(idsSet);
      if (ids.length === 0) {
        set_skills([]);
        return;
      }

      try {
        const res = await post_request("get_skills_by_id", { ids });

        console.log(res);
        if (res?.ok) set_skills(res?.data);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    fetch_skills();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <TableShell headers={["Name", "Description", "Skills", "Actions"]}>
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
        ) : data?.length === 0 ? (
          <Listempty
            title="No positions found"
            description="There are no positions to display. Add a new position to get started."
          />
        ) : (
          data.map((item, idx) => (
            <tr key={item.title ?? idx}>
              <td className="px-4 py-3 align-top">
                <div className="text-sm font-medium text-gray-900">
                  {item.title}
                </div>
                {item.responsibilities?.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                    {item.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-gray-700 align-top">
                {item.description}
              </td>

              <td className="px-4 py-3 align-top">
                <div className="flex items-center justify-start gap-2">
                  <div className="flex flex-wrap gap-1">
                    {item.skills?.map((s) => {
                      let label =
                        skills?.find((sk) => sk._id === s)?.title || s;
                      return (
                        <span
                          key={s}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </td>
              <td>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))
        )}
      </TableShell>
    </div>
  );
};

export default Position_list;
