import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            <span className="text-indigo-600">SHE Can Foundation</span>{" "}
            Internship Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Join our mission to empower women through education. Become a
            fundraising intern and make a real impact!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition duration-300 transform hover:-translate-y-1"
            >
              Apply Now
            </Link>
            <a
              href="#how-it-works"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition duration-300 transform hover:-translate-y-1"
            >
              Learn How
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              How Our Program Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Empower change through our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-indigo-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mx-auto bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Refer Friends
              </h3>
              <p className="text-gray-600">
                Share your unique referral code. Each friend who joins through
                your code boosts your impact!
              </p>
            </div>

            <div className="text-center p-8 bg-indigo-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mx-auto bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Earn Rewards
              </h3>
              <p className="text-gray-600">
                Unlock badges and achievements as you reach fundraising
                milestones.
              </p>
            </div>

            <div className="text-center p-8 bg-indigo-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="mx-auto bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">💖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Create Impact
              </h3>
              <p className="text-gray-600">
                Every rupee raised helps provide education opportunities for
                underprivileged women.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Program Features
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed in your fundraising journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Referral System",
                description:
                  "Track invites and see your network grow with our referral dashboard",
                icon: "🔗",
              },
              {
                title: "Earn Badges",
                description:
                  "Unlock achievements as you reach fundraising milestones",
                icon: "🛡️",
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your fundraising progress in real-time with visual metrics",
                icon: "📈",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
