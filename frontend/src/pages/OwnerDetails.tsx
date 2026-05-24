import "../styles/ownerDetails.css";
import { useEffect, useState } from "react";
import { deleteOwnerById } from "../services/ownerService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type Owner = {
  id: string;
  name: string;
  email: string;
};

const OwnerDetails = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [search, setSearch] = useState("");

  const [popupMsg, setPopupMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // 🔥 load owners from Firebase
  useEffect(() => {
    const loadOwners = async () => {
      const snap = await getDocs(collection(db, "owners"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Owner[];

      setOwners(data);
    };

    loadOwners();
  }, []);

  // 🔥 delete owner
  const deleteOwner = async (id: string) => {
    try {
      await deleteOwnerById(id);

      setOwners((prev) => prev.filter((o) => o.id !== id));

      setPopupMsg("Owner deleted successfully!");
      setShowPopup(true);
    } catch (error) {
      setPopupMsg("Delete failed!");
      setShowPopup(true);
    }
  };

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="topbar">
        <h2>View Owner Details</h2>
      </header>

      {/* Search */}
      <div className="search-panel">
        <input
          type="text"
          placeholder="Search owners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
      </div>

      <main className="dashboard-container">
        <section className="card">
          <h3>Registered Owners</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOwners.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>{o.email}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteOwner(o.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{popupMsg}</h3>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerDetails;