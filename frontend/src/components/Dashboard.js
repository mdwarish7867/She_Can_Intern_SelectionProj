import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/interns");
        setInternData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {internData.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Referral Code:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600">
                {internData.referralCode}
              </span>
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-center">
              <p className="text-sm text-indigo-100">Total Raised</p>
              <p className="text-4xl font-bold text-white">
                ₹{internData.amountRaised}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Fundraising Progress
        </h2>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
            <span>₹0</span>
            <span>₹5000 Goal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-6 rounded-full flex items-center justify-end"
              style={{ width: `${(internData.amountRaised / 5000) * 100}%` }}
            >
              <span className="text-xs font-bold text-white mr-2">
                ₹{internData.amountRaised}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-xl font-bold">₹250</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold">₹1250</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-bold">₹2500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Rewards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internData.rewards.map((reward, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                reward.unlocked
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {index === 0 ? "🥉" : index === 1 ? "🥈" : "🥇"}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {reward.title}
                </h3>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reward.unlocked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {reward.unlocked ? "Unlocked!" : "Locked"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800">Pro Tip</h3>
          <p className="mt-2 text-blue-700">
            Share your referral code with 5 friends to unlock the Silver Badge!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
