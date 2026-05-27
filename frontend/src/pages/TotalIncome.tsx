import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TotalIncomeProps {
  currentOwnerId?: string;
}

const TotalIncome = ({ currentOwnerId }: TotalIncomeProps) => {
  const [tab, setTab] = useState<"breakdown" | "chart">("breakdown");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string, income: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const ownerId = currentOwnerId || localStorage.getItem("ownerId");
      
      try {
        let q;
        if (ownerId) {
          q = query(
            collection(db, "payments"),
            where("ownerId", "==", ownerId),
            where("status", "==", "paid")
          );
        } else {
          // If no ownerId, fetch all paid payments (Admin mode)
          q = query(
            collection(db, "payments"),
            where("status", "==", "paid")
          );
        }

        const snapshot = await getDocs(q);

        let total = 0;
        const monthMap: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const d = doc.data();
          const amount = Number(d.amount) || 0;
          total += amount;

          let dateStr = "Invalid Date";
          if (d.paidAt) {
            const date = d.paidAt?.toDate ? d.paidAt.toDate() : new Date(d.paidAt);
            if (!isNaN(date.getTime())) {
              dateStr = date.toLocaleString('default', { month: 'short' });
            }
          } else if (d.createdAt) {
             const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
             if (!isNaN(date.getTime())) {
              dateStr = date.toLocaleString('default', { month: 'short' });
            }
          }
          
          monthMap[dateStr] = (monthMap[dateStr] || 0) + amount;
        });

        setTotalEarnings(total);
        
        // If no data, provide a default empty chart just to look good
        if (Object.keys(monthMap).length === 0) {
            setMonthlyData([
                { month: "May", income: 0 }
            ]);
        } else {
            const chartData = Object.keys(monthMap).map(key => ({
                month: key,
                income: monthMap[key]
            }));
            setMonthlyData(chartData);
        }

      } catch (e) {
        console.error("Error fetching payments:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentOwnerId]);

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>
      
      {/* Blue Header Banner */}
      <div style={{
        background: "linear-gradient(90deg, #3b6fd4 0%, #4a80f5 100%)",
        padding: "18px 28px",
        marginBottom: "8px",
      }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          Total Income Overview
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", width: "100%", marginBottom: 24 }}>
        <button
          onClick={() => setTab("breakdown")}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: tab === "breakdown" ? "#2563eb" : "#4b5e78",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          Earning Breakdown
        </button>
        <button
          onClick={() => setTab("chart")}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: tab === "chart" ? "#2563eb" : "#4b5e78",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          Earning Chart
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading Income Data...
        </div>
      ) : (
        <>
          {/* Earning Breakdown Tab */}
          {tab === "breakdown" && (
            <div>
              {/* Total Earnings Card */}
              <div style={{
                backgroundColor: "#e0f2fe",
                padding: "24px 28px",
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #bae6fd"
              }}>
                <h3 style={{ color: "#1e3a8a", margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 600 }}>
                  Total Earnings
                </h3>
                <div style={{ color: "#0284c7", fontSize: "1.75rem", fontWeight: 700 }}>
                  LKR {totalEarnings.toLocaleString()}
                </div>
              </div>

              {/* Breakdown Table */}
              <div style={{
                background: "white",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: "24px 28px"
              }}>
                <h3 style={{ color: "#1e3a8a", margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 600 }}>
                  Earning Breakdown
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#334155", borderBottom: "1px solid #e2e8f0" }}>Month</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#334155", borderBottom: "1px solid #e2e8f0" }}>Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((data, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "12px", fontSize: "0.85rem", color: "#475569" }}>{data.month}</td>
                        <td style={{ padding: "12px", fontSize: "0.85rem", color: "#475569" }}>LKR {data.income.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Earning Chart Tab */}
          {tab === "chart" && (
            <div style={{
              background: "white",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              padding: "24px 28px",
              height: "450px"
            }}>
              <h3 style={{ color: "#1e3a8a", margin: "0 0 24px 0", fontSize: "0.95rem", fontWeight: 600 }}>
                Earning Chart
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} tickLine={{stroke: '#cbd5e1'}} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} tickLine={{stroke: '#cbd5e1'}} />
                  <Tooltip 
                    formatter={(value: any) => [`LKR ${Number(value || 0).toLocaleString()}`, 'Income']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }} 
                    dot={{ r: 4, fill: 'white', stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TotalIncome;