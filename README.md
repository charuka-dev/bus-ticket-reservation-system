# 🚌 Bus Ticket Reservation System

A full-stack bus ticket reservation web application built with **React, TypeScript, and Firebase**. The platform is designed to simplify online bus bookings, provide convenient seat reservations, and enable real-time bus location tracking.

The system supports multiple user roles, providing dedicated functionality for customers, conductors, owners, and administrators.

## ✨ Key Features

- 🎫 **Online Ticket Booking** – Browse buses and make ticket reservations.
- 💺 **Seat Selection** – Select preferred seats when booking tickets.
- 🔐 **Authentication** – Secure user authentication using Firebase Authentication.
- 📍 **Live Bus Tracking** – Track conductor locations in real time.
- 👤 **Role-Based Access** – Dedicated functionality for customers, conductors, owners, and administrators.
- 🚌 **Bus Management** – Manage bus-related information and services.
- 🔄 **Real-Time Updates** – Synchronize application data using Firebase services.

## 🛠️ Tech Stack

| Category           | Technologies               |
| ------------------ | -------------------------- |
| Frontend           | React, TypeScript          |
| Styling            | CSS                        |
| Authentication     | Firebase Authentication    |
| Database           | Cloud Firestore            |
| Real-Time Services | Firebase Realtime Database |
| Development Tools  | VS Code                    |
| Version Control    | Git, GitHub                |

## 👥 User Roles

| Role      | Description                                                 |
| --------- | ----------------------------------------------------------- |
| Customer  | Search for buses and reserve tickets                        |
| Conductor | Manage conductor-related activities and share live location |
| Owner     | Manage bus services and related operations                  |
| Admin     | Manage and oversee the platform                             |

## 📂 Project Structure

```text
bus-ticket-reservation-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── README.md
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Git
- Firebase account

### 1. Clone the Repository

```bash
git clone https://github.com/charuka-dev/bus-ticket-reservation-system.git
```

### 2. Navigate to the Frontend

```bash
cd bus-ticket-reservation-system/frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).

Configure the required Firebase services:

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

Add your Firebase configuration to the frontend project using the configuration method expected by the application.

### 5. Run the Application

```bash
npm run dev
```

Open the local development URL displayed in your terminal.

## 📸 Application Screenshots

Screenshots of the application will be added here.

\<!-- Add actual application screenshots here -->

## 🏗️ Project Architecture

```text
React + TypeScript
        |
        v
     Firebase
        |
   +----+----------------+
   |         |           |
   v         v           v
Authentication Firestore Realtime
              Database  Database
                        |
                        v
                 Live Location
                   Tracking
```

## 📌 Project Status

**Development in Progress**

This project is part of our software engineering development journey, focusing on modern frontend development, cloud-based backend services, real-time database integration, and collaborative software development.

## 👥 Team Members

This project was developed collaboratively by a team of four members.

| Name | Role | GitHub |
|---|---|---|
| **Charuka Lakshan** | Team Leader & Developer | [@charuka-dev](https://github.com/charuka-dev) |
| **Nethmi** | Team Member & Developer | [@Nethmi32](https://github.com/Nethmi32) |
| **Shehan Oshadha** | Team Member & Developer | [@Oshadha11](https://github.com/Oshadha11) |
| **Dinitha** | Team Member & Developer | [@Dinitha32](https://github.com/Dinitha32) |

### Team Leadership

**Charuka Lakshan** – Team Leader

Responsible for leading the development team, coordinating project activities, and contributing to the design and implementation of the system.

### Connect with the Team Leader

- GitHub: [@charuka-dev](https://github.com/charuka-dev)
- LinkedIn: [Charuka Lakshan](https://www.linkedin.com/in/charuka-lakshan-4a574839/)
  
⭐ If you find this project interesting, consider giving the repository a star!
