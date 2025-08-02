import React from "react";
import { FaHandsHelping, FaUserGraduate, FaChartLine } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-indigo-700">
            About She Can Foundation Internship Program
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            Empowering students to grow, lead, and create a positive impact through practical fundraising experiences and community-driven projects.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid items-center grid-cols-1 gap-12 mb-20 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              Our Mission
            </h2>
            <p className="mb-6 leading-relaxed text-gray-600">
              She Can Foundation is committed to fostering a culture of leadership and social responsibility among students. Through our Fundraising Internship Program, we aim to equip future changemakers with hands-on experience in project management, communication, and social impact strategies.
            </p>
            <p className="leading-relaxed text-gray-600">
              Join us to develop essential professional skills while contributing to meaningful causes that drive community upliftment and women's empowerment.
            </p>
          </div>
          <div className="flex items-center justify-center w-full text-2xl font-semibold text-indigo-700 border-4 border-indigo-400 border-dashed bg-gradient-to-r from-indigo-100 to-indigo-300 rounded-xl h-96">
            Empower • Lead • Inspire
          </div>
        </div>

        {/* Why Join Us Section */}
        <div className="p-12 mb-16 shadow-xl bg-indigo-50 rounded-3xl">
          <h2 className="mb-10 text-3xl font-bold text-center text-gray-900">
            Why Join Us?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 text-center transition duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl">
              <div className="flex justify-center mb-4 text-4xl text-indigo-600">
                <FaHandsHelping />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Social Impact
              </h3>
              <p className="text-gray-600">
                Work on real projects that support underprivileged communities and promote gender equality.
              </p>
            </div>
            <div className="p-6 text-center transition duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl">
              <div className="flex justify-center mb-4 text-4xl text-indigo-600">
                <FaUserGraduate />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Skill Development
              </h3>
              <p className="text-gray-600">
                Gain practical experience in fundraising, communication, and project coordination.
              </p>
            </div>
            <div className="p-6 text-center transition duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl">
              <div className="flex justify-center mb-4 text-4xl text-indigo-600">
                <FaChartLine />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Career Boost
              </h3>
              <p className="text-gray-600">
                Strengthen your resume with internship certification, performance recognition, and potential leadership roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
