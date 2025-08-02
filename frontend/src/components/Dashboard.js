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
          `${process.env.REACT_APP_BACKEND_URL}/api/interns/${user._id}`
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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!internData) {
    return (
      <div className="py-12 text-center">
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
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />

      {/* Animated Welcome Header */}
      <div className="p-6 mb-8 bg-white shadow-xl rounded-2xl animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, <span className="text-indigo-600">{user.name}</span>!
              <span className="inline-block ml-3 animate-bounce">🎉</span>
            </h1>
            {internData.referredBy && (
              <p className="mt-2 text-gray-600">
                Referred by:{" "}
                <span className="font-medium">{internData.referredBy}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
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
            <Link
              to="/update-password"
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors hover:scale-[1.03]"
            >
              Change Password
            </Link>
          </div>
        </div>

        <div className="p-4 mt-4 rounded-lg bg-gray-50">
          <p className="p-2 font-mono font-bold text-center text-indigo-600 bg-white rounded">
            {internData.referralCode}
          </p>
          <p className="mt-2 text-sm text-center text-gray-600">
            Share this code with friends to earn ₹500 per successful referral
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 text-center bg-white shadow-xl rounded-2xl">
          <div className="text-3xl font-bold text-indigo-600">
            ₹{internData.amountRaised}
          </div>
          <p className="text-gray-600">Total Raised</p>
        </div>

        <div className="p-6 text-center bg-white shadow-xl rounded-2xl">
          <div className="text-3xl font-bold text-green-600">
            {internData.referralsCount}
          </div>
          <p className="text-gray-600">Successful Referrals</p>
        </div>

        <div className="p-6 text-center bg-white shadow-xl rounded-2xl">
          <div className="text-3xl font-bold text-blue-600">
            ₹{internData.goal - internData.amountRaised}
          </div>
          <p className="text-gray-600">To Reach Goal</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 mb-8 bg-white shadow-xl rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Fundraising Progress
          </h2>
          <div className="text-xl font-bold text-green-600">
            {progressPercentage}% Complete
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
            <span>₹0</span>
            <span>₹{internData.goal} Goal</span>
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full">
            <div
              className="flex items-center justify-end h-6 rounded-full bg-gradient-to-r from-green-400 to-teal-500"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="mr-2 text-xs font-bold text-white">
                ₹{internData.amountRaised}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 gap-2 text-center md:grid-cols-3">
            <div className="p-4 transition-shadow rounded-lg bg-gray-50 hover:shadow-md">
              <p className="text-sm text-gray-600">Bronze Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 1000 ? "✅" : "🔒"}
              </p>
            </div>
            <div className="p-4 transition-shadow rounded-lg bg-gray-50 hover:shadow-md">
              <p className="text-sm text-gray-600">Silver Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 3000 ? "✅" : "🔒"}
              </p>
            </div>
            <div className="p-4 transition-shadow rounded-lg bg-gray-50 hover:shadow-md">
              <p className="text-sm text-gray-600">Gold Badge</p>
              <p className="text-xl font-bold">
                {internData.amountRaised >= 5000 ? "✅" : "🔒"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Your Rewards & Badges
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <div className="mb-4 text-5xl">
                  {index === 0 ? "🥉" : index === 1 ? "🥈" : "🥇"}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {reward.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
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

        <div className="p-4 mt-8 border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
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
