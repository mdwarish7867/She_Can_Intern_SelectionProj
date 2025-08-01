import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/interns/leaderboard"
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Top Fundraisers
          </h1>
          <p className="text-xl text-gray-600">
            Our most dedicated interns making a difference
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-indigo-600 text-white font-semibold py-4 px-6">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Amount Raised</div>
            <div className="col-span-3">Referral Code</div>
          </div>

          {leaderboard.map((intern, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 py-4 px-6 border-b border-gray-200 hover:bg-indigo-50 transition-colors ${
                index === 0
                  ? "bg-yellow-50"
                  : index === 1
                  ? "bg-gray-50"
                  : index === 2
                  ? "bg-amber-50"
                  : ""
              }`}
            >
              <div className="col-span-1 font-bold">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : index + 1}
              </div>
              <div className="col-span-5 font-medium">{intern.name}</div>
              <div className="col-span-3 text-green-600 font-bold">
                ₹{intern.amountRaised}
              </div>
              <div className="col-span-3 font-mono text-indigo-600">
                {intern.referralCode}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            The leaderboard updates every 24 hours. Keep fundraising to climb
            the ranks!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
