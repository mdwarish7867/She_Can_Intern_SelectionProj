import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


const Dashboard = () => {
  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(internData?.referralCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateReferral = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interns/referral",
        {
          userId: user?.id,
        }
      );
      setInternData(response.data);
    } catch (error) {
      console.error("Error simulating referral:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Animated Welcome Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, <span className="text-indigo-600">{user?.name}</span>!
              <span className="ml-3 inline-block animate-bounce">🎉</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Referral Code:
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600 ml-2">
                {internData.referralCode}
              </span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg flex items-center hover:bg-indigo-200 transition-colors"
            >
              <span>{copied ? "Copied!" : "Share Referral"}</span>
              {copied ? "✅" : "📋"}
            </button>
            <Link to="/leaderboard"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Fundraising Progress
          </h2>
          <button
            onClick={simulateReferral}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Simulate Referral (+₹500)
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
            <span>₹0</span>
            <span>₹{internData.goal || 5000} Goal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-6 rounded-full flex items-center justify-end"
              style={{
                width: `${
                  (internData.amountRaised / (internData.goal || 5000)) * 100
                }%`,
              }}
            >
              <span className="text-xs font-bold text-white mr-2">
                ₹{internData.amountRaised}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-xl font-bold">₹250</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold">₹1250</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-bold">₹2500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Rewards & Badges
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
                <p className="text-sm text-gray-500 mt-2">
                  {reward.description}
                </p>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reward.unlocked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {reward.unlocked
                      ? "Unlocked!"
                      : `Unlock at ₹${reward.threshold}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;