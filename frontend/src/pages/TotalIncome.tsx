import { useEffect, useState } from "react";
<<<<<<< HEAD
import "../styles/totalIncome.css";
import { getAllPayments } from "../services/incomeService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Type for monthly income data
type MonthlyIncome = {
  month: string;
  income: number;
};

// Function to get short month name (Jan, Feb, etc.)
const getMonthName = (date: Date) => {
  return date.toLocaleString("default", { month: "short" });
};

const TotalIncome = () => {
  // Total income state
  const [total, setTotal] = useState<number>(0);

  // Monthly income data state
  const [monthly, setMonthly] = useState<MonthlyIncome[]>([]);

  // Toggle between table and chart view
  const [showChart, setShowChart] = useState(false);

  // Load income data when component mounts
  useEffect(() => {
    const loadIncome = async () => {
      const payments = await getAllPayments();

      let totalAmount = 0;

      // Store monthly income grouped by month
      const map: { [key: string]: number } = {};

      payments.forEach((p: any) => {
        const amount = Number(p.amount || 0);
        totalAmount += amount;

        // Convert Firestore timestamp or normal date
        const date = p.paidAt?.toDate
          ? p.paidAt.toDate()
          : new Date(p.paidAt);

        const month = getMonthName(date);

        // Add income to correct month
        map[month] = (map[month] || 0) + amount;
      });

      // Convert map into array for chart usage
      const monthlyData: MonthlyIncome[] = Object.keys(map).map((key) => ({
        month: key,
        income: map[key]
      }));

      setTotal(totalAmount);
      setMonthly(monthlyData);
    };

    loadIncome();
  }, []);

  return (
    <>
      {/* TOP HEADER */}
      <header className="topbar">
        <h2>Total Income Overview</h2>
      </header>

      {/* BUTTONS TO SWITCH VIEW */}
      <div className="income-button-wrapper">

        {/* Show breakdown table */}
        <button
          className={`income-btn ${!showChart ? "active" : ""}`}
          onClick={() => setShowChart(false)}
        >
          Earning Breakdown
        </button>

        {/* Show chart view */}
        <button
          className={`income-btn ${showChart ? "active" : ""}`}
          onClick={() => setShowChart(true)}
        >
          Earning Chart
        </button>

      </div>

      {/* MAIN CONTENT */}
      <main className="dashboard-container">

        {/* TOTAL INCOME CARD (only in table view) */}
        {!showChart && (
          <section className="card highlight">
            <h3>Total Earnings</h3>
            <p className="value">LKR {total.toLocaleString()}</p>
          </section>
        )}

        {/* TABLE VIEW */}
        {!showChart && (
          <section className="card">
            <h3>Earning Breakdown</h3>

            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                </tr>
              </thead>

              <tbody>
                {monthly.map((m, index) => (
                  <tr key={index}>
                    <td>{m.month}</td>
                    <td>LKR {m.income.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </section>
        )}

        {/* CHART VIEW */}
        {showChart && (
          <section className="card">
            <h3>Earning Chart</h3>

            {/* Responsive chart container */}
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  {/* Income line */}
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </section>
        )}

      </main>
    </>
=======
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/dashboard.css";

const TotalIncome = () => {
  const [data, setData] = useState({ total: 0, daily: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const ownerId = localStorage.getItem("ownerId");
      if (!ownerId) { 
        console.log("No ownerId in local storage");
        setLoading(false); 
        return; 
      }

      try {
        const q = query(
          collection(db, "payments"), 
          where("ownerId", "==", ownerId), 
          where("status", "==", "paid")
        );
        
        const snapshot = await getDocs(q);
        
        console.log("Searching for ownerId:", ownerId);
        console.log("Documents found:", snapshot.size);

        let total = 0, daily = 0;
        const today = new Date().toDateString();

        snapshot.forEach((doc) => {
          const d = doc.data();
          const amount = Number(d.amount) || 0;
          total += amount;

          const date = d.paidAt?.toDate ? d.paidAt.toDate() : new Date(d.paidAt);
          if (date.toDateString() === today) daily += amount;
        });

        setData({ total, daily });
      } catch (e) { console.error("Error:", e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '80vh', color: '#3B82F6', fontSize: '18px', fontWeight: '600',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div className="animate-pulse">Loading Income Analytics...</div>
      </div>
    );
  }

  return (
    <main style={{
      padding: '40px',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Top Welcome/Header Section */}
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '700', color: '#1E3A8A', margin: '0 0 8px 0',
          letterSpacing: '-0.5px'
        }}>
          Financial Analytics
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>
          Real-time tracking of your bus service revenue and daily statistics.
        </p>
      </header>

      {/* Grid Layout for Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '28px',
        maxWidth: '1200px'
      }}>
        
        {/* Card 1: Today's Income */}
        <section style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.05), 0 8px 10px -6px rgba(30, 58, 138, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease'
        }}>
          {/* Top Decorative Line with Accent Blue */}
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: '6px', 
            background: 'linear-gradient(90deg, #3B82F6 0%, #1E3A8A 100%)' 
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#64748b', fontSize: '15px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Income
            </h3>
            {/* Calendar Icon Indicator */}
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', 
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' 
            }}>
              Today
            </span>
          </div>
          
          <p style={{ 
            fontSize: '36px', fontWeight: '800', color: '#1E3A8A', margin: 0,
            display: 'flex', alignItems: 'baseline', gap: '6px'
          }}>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#3B82F6' }}>LKR</span>
            {data.daily.toLocaleString()}
          </p>
        </section>

        {/* Card 2: Total Earnings */}
        <section style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 35px -5px rgba(30, 58, 138, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glowing background accent */}
          <div style={{
            position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
            background: 'rgba(249, 115, 22, 0.15)', filter: 'blur(40px)', borderRadius: '50%'
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Earnings
            </h3>
            {/* Luxury Orange/Gold Badge */}
            <span style={{ 
              background: '#F97316', color: '#ffffff', 
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}>
              All-Time
            </span>
          </div>
          
          <p style={{ 
            fontSize: '36px', fontWeight: '800', color: '#ffffff', margin: 0,
            display: 'flex', alignItems: 'baseline', gap: '6px'
          }}>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#F97316' }}>LKR</span>
            {data.total.toLocaleString()}
          </p>
        </section>

      </div>
    </main>
>>>>>>> feature/owner
  );
};

export default TotalIncome;