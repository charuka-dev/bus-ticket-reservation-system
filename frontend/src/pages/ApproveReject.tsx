import { useEffect, useState } from "react";
import "../styles/approveReject.css";

import {
  subscribeOwners,
  approveOwnerService,
  rejectOwnerService
} from "../services/ApproveRejectService";

import type { Owner } from "../services/ApproveRejectService"; 

const ApproveReject = () => {
  // State to store list of owners
  const [owners, setOwners] = useState<Owner[]>([]);

  // Load owners in real-time when component mounts
  useEffect(() => {
    const unsubscribe = subscribeOwners((data: Owner[]) => {
      setOwners(data);
    });

    // Cleanup subscription when component unmounts
    return () => {
      if (unsubscribe) unsubscribe(); 
    };
  }, []);

  // Function to return CSS class based on owner status
  const getStatusClass = (status: string | undefined) => {
    if (!status) return "pending";
    if (status.toLowerCase() === "approved") return "approved";
    if (status.toLowerCase() === "rejected") return "rejected";
    return "pending";
  };

  return (
    <>
      {/* Top header */}
      <header className="topbar">
        <h2>Manage Owner Accounts</h2>
      </header>

      <main className="dashboard-container">

        {/* Main card section */}
        <section className="card">
          <h3>Registered Owners</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status & Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* If no owners found */}
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-data">
                    No owners found
                  </td>
                </tr>
              ) : (
                // Loop through owners list
                owners.map((o) => (
                  <tr key={o.id}>
                    <td>{o.name}</td>
                    <td>{o.email}</td>

                    <td>
                      <div className="action-container">

                        {/* Status badge */}
                        <span className={`status-badge ${getStatusClass(o.approved)}`}>
                          {o.approved ?? "pending"}
                        </span>

                        {/* Approve button */}
                        <button
                          className="approve-btn"
                          onClick={() => approveOwnerService(o.id)}
                        >
                          Approve
                        </button>

                        {/* Reject button */}
                        <button
                          className="reject-btn"
                          onClick={() => rejectOwnerService(o.id)}
                        >
                          Reject
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>

        </section>
      </main>
    </>
  );
};

export default ApproveReject;