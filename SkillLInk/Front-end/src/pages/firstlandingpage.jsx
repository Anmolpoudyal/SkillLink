// Folder Structure:
// src/
// ├── components/
// │   └── LandingCard.jsx
// ├── pages/
// │   └── LandingPage.jsx
// ├── assets/
// │   └── workers.png (skilled workers image)
// └── App.jsx

import React from "react";
import { FaUserTie, FaTools } from "react-icons/fa";

export default function LandingPage() {
  return (
   
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-center mb-2">Welcome to Skill Link</h1>
      <p className="text-lg text-center mb-10">Choose how you want to continue</p>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl justify-center">
        {/* Customer Card */}
        <div className="cursor-pointer bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
          <div className="flex justify-center mb-4">
            <FaUserTie size={60} onclick={() => window.location.href = "/login"}/>
          </div>
          <h2 className="text-2xl font-bold text-center">I'm Customer</h2>
          <p className="text-center mt-2 mb-4 text-gray-600">Choose how you want to continue</p>

          <ul className="text-gray-700 space-y-2">
            <li>✔ Browse skilled workers like electricians, plumbers, etc.</li>
            <li>✔ Book services quickly and easily</li>
            <li>✔ Secure and reliable process</li>
            <li>✔ Track your service history</li>
          </ul>
        </div>

        {/* Worker Card */}
        <div className="cursor-pointer bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
          <div className="flex justify-center mb-4">
            <FaTools size={60} />
          </div>
          <h2 className="text-2xl font-bold text-center">I'm Worker</h2>
          <p className="text-center mt-2 mb-4 text-gray-600">Choose how you want to continue</p>

          <ul className="text-gray-700 space-y-2">
            <li>✔ Showcase your skills (electrician, plumber, etc.)</li>
            <li>✔ Get more job opportunities</li>
            <li>✔ Manage bookings with ease</li>
            <li>✔ Grow your professional profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
