import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/interns/leaderboard/top`
        );
        setLeaderboard(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">
            Top Fundraisers
          </h1>
          <p className="text-xl text-gray-600">
            Our most dedicated interns making a difference
          </p>
        </div>

        <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
          <div className="grid grid-cols-12 px-6 py-4 font-semibold text-white bg-indigo-600">
            <div className="col-span-1 md:col-span-1">Rank</div>
            <div className="col-span-5 md:col-span-4">Name</div>
            <div className="col-span-3 md:col-span-3">Raised</div>
            <div className="col-span-3 md:col-span-4">Referrals</div>
          </div>

          {leaderboard.map((intern, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 py-4 px-6 border-b border-gray-200 hover:bg-indigo-50 transition-colors ${
                user?._id === intern._id
                  ? "bg-blue-50"
                  : index === 0
                  ? "bg-yellow-50"
                  : index === 1
                  ? "bg-gray-50"
                  : index === 2
                  ? "bg-amber-50"
                  : ""
              }`}
            >
              <div className="col-span-1 font-bold md:col-span-1">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : index + 1}
              </div>
              <div className="col-span-5 font-medium md:col-span-4">
                {intern.name}
                {user?._id === intern._id && (
                  <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded">
                    You
                  </span>
                )}
              </div>
              <div className="col-span-3 font-bold text-green-600 md:col-span-3">
                ₹{intern.amountRaised}
              </div>
              <div className="col-span-3 md:col-span-4">
                <span className="px-2 py-1 text-sm text-indigo-800 bg-indigo-100 rounded-full">
                  {intern.referralsCount} referrals
                </span>
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="p-6 mt-8 bg-white shadow-md rounded-xl">
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Your Position
                </h3>
                <p className="text-gray-600">
                  {leaderboard.findIndex((i) => i._id === user._id) === -1
                    ? "Not in top 10 yet"
                    : `Rank #${
                        leaderboard.findIndex((i) => i._id === user._id) + 1
                      }`}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-lg font-bold text-indigo-600">
                  ₹
                  {leaderboard.find((i) => i._id === user._id)?.amountRaised ||
                    0}{" "}
                  raised
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Leaderboard updates in real-time. Keep fundraising to climb the
            ranks!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;