import "../styles/adminHome.css";

// Admin Home page component
const AdminHome = () => {
  return (
    <div className="admin-home">

      {/* Header section */}
      <div className="admin-header">
        <h1>Welcome, Admin</h1>
        <p>Manage system activities and monitor platform performance.</p>
      </div>

      {/* Cards section */}
      <div className="admin-cards">

        {/* Card 1: Manage Owner Profile */}
        <div className="admin-card">
          <h3>Manage Owner Profile</h3>
          <p>Edit and control owner accounts</p>
        </div>

        {/* Card 2: Total Income */}
        <div className="admin-card">
          <h3>Total Income</h3>
          <p>View earnings and reports</p>
        </div>

        {/* Card 3: View Owner Details */}
        <div className="admin-card">
          <h3>View Owner Details</h3>
          <p>Check registered owners</p>
        </div>

        {/* Card 4: View Booking Details */}
        <div className="admin-card">
          <h3>View Booking Details</h3>
          <p>Monitor booking activities</p>
        </div>

      </div>

    </div>
  );
};

export default AdminHome;