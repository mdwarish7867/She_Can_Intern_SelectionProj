import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [referralTree, setReferralTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const treeContainerRef = useRef(null);

  // Get admin auth from session storage
  const adminAuth = sessionStorage.getItem("adminAuth");

  // Axios instance with auth header
  const adminApi = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api/admin`,
    headers: {
      Authorization: `Basic ${adminAuth}`,
    },
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await adminApi.get("/users");
      console.log("Users data:", response.data);
      setUsers(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch users:", err);
      return [];
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const response = await adminApi.get("/contacts");
      setContacts(response.data);
    } catch (err) {
      toast.error("Failed to fetch messages");
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await adminApi.get("/leaderboard");
      setLeaderboard(response.data);
    } catch (err) {
      toast.error("Failed to fetch leaderboard");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users first for the referral tree
        const users = await fetchUsers();
        console.log("Fetched users for tree:", users);

        // Then fetch other data
        await fetchContacts();
        await fetchLeaderboard();
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.delete(`/users/${userId}`);
        toast.success("User deleted successfully");
        fetchLeaderboard();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await adminApi.delete(`/contacts/${contactId}`);
        toast.success("Message deleted successfully");
        fetchContacts();
      } catch (err) {
        toast.error("Failed to delete message");
      }
    }
  };

  // Update user amount
  const updateAmount = async (userId, amount) => {
    try {
      await adminApi.put(`/users/${userId}/amount`, { amount });
      toast.success("Amount updated successfully");
      fetchLeaderboard();
    } catch (err) {
      toast.error("Failed to update amount");
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const response = await adminApi.post("/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordError("");
      } else {
        setPasswordError(response.data.message || "Failed to change password");
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <h3 className="mb-2 text-lg font-medium">
              Message from {selectedMessage.name}
              {selectedMessage.userId && (
                <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded">
                  Registered User
                </span>
              )}
            </h3>
            <p className="mb-2 text-gray-600">
              <strong>Email:</strong> {selectedMessage.email}
            </p>
            <p className="mb-2 text-gray-600">
              <strong>Date:</strong>{" "}
              {new Date(selectedMessage.date).toLocaleString()}
            </p>
            <div className="p-4 mt-4 rounded-lg bg-gray-50">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  deleteContact(selectedMessage._id);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 text-white bg-red-600 rounded"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem("adminAuth");
              window.location.href = "/admin/login";
            }}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "leaderboard"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab("contacts")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contacts"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contact Messages
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Admin Settings
            </button>
          </nav>
        </div>
      </div>

      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Fundraiser Leaderboard
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit fundraiser amounts and positions
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Amount Raised
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Referrals
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboard.map((user, index) => (
                        <tr
                          key={user._id}
                          className={
                            index < 3
                              ? index === 0
                                ? "bg-yellow-50"
                                : index === 1
                                ? "bg-gray-50"
                                : "bg-amber-50"
                              : ""
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {index === 0 ? (
                                <span className="text-yellow-600">🥇</span>
                              ) : index === 1 ? (
                                <span className="text-gray-600">🥈</span>
                              ) : index === 2 ? (
                                <span className="text-amber-600">🥉</span>
                              ) : (
                                index + 1
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              defaultValue={user.amountRaised}
                              onBlur={(e) =>
                                updateAmount(user._id, e.target.value)
                              }
                              className="w-24 px-2 py-1 text-sm font-bold border rounded"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            <span className="px-2 py-1 text-green-800 bg-green-100 rounded-full">
                              {user.referralsCount || 0} referrals
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contact Messages
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage all submitted contact forms.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Message
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.name}
                              {contact.userId && (
                                <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded">
                                  Registered User
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {contact.email}
                          </td>
                          <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">
                              {contact.message}
                            </div>
                            <button
                              onClick={() => setSelectedMessage(contact)}
                              className="mt-1 text-xs text-indigo-600 hover:text-indigo-900"
                            >
                              View Full Message
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(contact.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => deleteContact(contact._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Admin Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Change your admin password or manage account settings.
                  </p>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-6">
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          minLength="8"
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          minLength="8"
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>

                      {passwordError && (
                        <div className="text-sm text-red-600">
                          {passwordError}
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;
