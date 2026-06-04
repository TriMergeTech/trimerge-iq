"use client";

import { useEffect, useState } from "react";
import { DeleteButton } from "./buttons";
import ManagementTable from "./management_table";
import { API_BASE_URL } from "@/app/components/adminAuth";
import styles from "../../components/AdminPage.module.css";

const Services = () => {
  let [services, setServices] = useState([]);
  let [serviceError, setServiceError] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        setServiceError("");

        let response = await fetch(`${API_BASE_URL}/get_services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-version": "v1",
            Authorization: `Bearer ${window.localStorage.getItem("trimerge_admin_access_token")}`,
          },
        });

        response = await response.json();
        if (!response.ok) {
          throw new Error(
            `Unable to load services (${response.message || response.statusText})`,
          );
        }

        setServices(response.data || []);
      } catch (error) {
        setServiceError(
          error instanceof Error ? error.message : "Unable to load services.",
        );
      } finally {
        setIsLoadingServices(false);
      }
    };

    void loadServices();

    return () => {};
  }, []);

  return (
    <ManagementTable
      headers={[
        "Name",
        "Description",
        "Skills",
        "Positions",
        "Created",
        "Actions",
      ]}
      emptyMessage={
        isLoadingServices ? "Loading services..." : "No services found."
      }
    >
      {services.map((service) => (
        <tr key={service._id}>
          <td className={`${styles.td} ${styles.tdName}`}>{service.title}</td>
          <td className={`${styles.td} ${styles.tdMuted}`}>
            {service.description}
          </td>
          <td className={styles.td}>
            <div className={styles.pillsWrap}>
              {service.skills?.length > 0 ? (
                service.skills.map((skillId) => {
                  const skill = skills.find((s) => s._id === skillId);
                  if (!skill) return null;
                  return (
                    <span key={skillId} className={styles.pill}>
                      {skill.name}
                    </span>
                  );
                })
              ) : (
                <span className={styles.tdMuted}>None</span>
              )}
            </div>
          </td>
          <td className={styles.td}>
            <div className={styles.pillsWrap}>
              {service.positions?.length > 0 ? (
                service.positions.map((positionId) => {
                  const position = positions.find((p) => p._id === positionId);
                  if (!position) return null;
                  return (
                    <span key={positionId} className={styles.pill}>
                      {position.title}
                    </span>
                  );
                })
              ) : (
                <span className={styles.tdMuted}>None</span>
              )}
            </div>
          </td>
          <td className={`${styles.td} ${styles.tdMuted}`}>
            {new Date(service.created).toLocaleDateString()}
          </td>
          <td className={`${styles.td} ${styles.tdActions}`}>
            <DeleteButton
              onClick={() => {
                // void removeService(service.id);
              }}
            />
          </td>
        </tr>
      ))}
    </ManagementTable>
  );
};

export default Services;
