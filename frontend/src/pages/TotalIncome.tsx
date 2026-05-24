import { useEffect, useState } from "react";
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
  );
};

export default TotalIncome;