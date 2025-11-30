import React from "react";
import { FaUserTie, FaTools } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-center mb-2">Welcome to Skill Link</h1>
      <p className="text-lg text-center mb-10">Choose how you want to continue</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl justify-center">

        {/* Customer Card */}
        <Link to="/customer-signup" className="block">
          <div className="cursor-pointer bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <FaUserTie size={60} />
            </div>
            <h2 className="text-2xl font-bold text-center">I'm Customer</h2>
            <p className="text-center mt-2 mb-4 text-gray-600">
              Choose how you want to continue
            </p>

            <ul className="text-gray-700 space-y-2">
              <li>✔ Browse skilled workers(electricians, plumbers, etc.)</li>
              <li>✔ Book services quickly and easily</li>
              <li>✔ Secure and reliable process</li>
              <li>✔ Track your service history</li>
            </ul>
          </div>
        </Link>

        {/* Worker Card */}
        <Link to="/provider-signup" className="block">
          <div className="cursor-pointer bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <FaTools size={60} />
            </div>
            <h2 className="text-2xl font-bold text-center">I'm Worker</h2>
            <p className="text-center mt-2 mb-4 text-gray-600">
              Choose how you want to continue
            </p>

            <ul className="text-gray-700 space-y-2">
              <li>✔ Showcase your skills (electrician, plumber, etc.)</li>
              <li>✔ Get more job opportunities</li>
              <li>✔ Manage bookings with ease</li>
              <li>✔ Grow your professional profile</li>
            </ul>
          </div>
        </Link>

      </div>
   
    </div>
    
  );
}
