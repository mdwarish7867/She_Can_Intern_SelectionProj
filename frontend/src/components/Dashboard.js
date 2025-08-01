import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/interns/${user._id}`
        );
        setInternData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(internData?.referralCode || "");
    setCopied(true);
    toast.success("Referral code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!internData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data found for your account</p>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((internData.amountRaised / internData.goal) * 100),
    100
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-right" />

      {/* Animated Welcome Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, <span className="text-indigo-600">{user.name}</span>!
              <span className="ml-3 inline-block animate-bounce">🎉</span>
            </h1>
            {internData.referredBy && (
              <p className="mt-2 text-gray-600">
                Referred by:{" "}
                <span className="font-medium">{internData.referredBy}</span>
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button
              onClick={copyToClipboard}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors hover:scale-[1.03]"
            >
              <span>Share Referral Code</span>
              <span className="ml-2">📋</span>
            </button>
            <Link
              to="/leaderboard"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors hover:scale-[1.03]"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <p className="font-mono bg-white p-2 rounded text-center text-indigo-600 font-bold">
            {internData.referralCode}
          </p>
          <p className="text-center text-sm text-gray-600 mt-2">
            Share this code with friends to earn ₹500 per successful referral
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600">
            ₹{internData.amountRaised}
          </div>
          <p className="text-gray-600">Total Raised</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {internData.referralsCount}
          </div>
          <p className="text-gray-600">Successful Referrals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            ₹{internData.goal - internData.amountRaised}
          </div>
          <p className="text-gray-600">To Reach Goal</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Fundraising Progress
          </h2>
          <div className="text-xl font-bold text-green-600">
            {progressPercentage}% Complete
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
            <span>₹0</span>
            <span>₹{internData.goal} Goal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-6 rounded-full flex items-center justify-end"
              style={{ width: `${progressPercentage}%` }}
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
              <p className="text-sm text-gray-600">Bronze Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 1000 ? "✅" : "🔒"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600">Silver Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 3000 ? "✅" : "🔒"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600">Gold Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 5000 ? "✅" : "🔒"}
              </p>
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
              className={`border-2 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.03] ${
                reward.unlocked
                  ? "border-green-300 bg-green-50 shadow-md"
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

        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-lg font-medium text-indigo-800">
            How Referrals Work
          </h3>
          <p className="mt-2 text-indigo-700">
            1. Share your unique referral code with friends
            <br />
            2. When they sign up using your code, you earn ₹500
            <br />
            3. Each referral brings you closer to unlocking badges
            <br />
            4. Reach ₹5000 to complete your goal and earn the Gold Badge!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
