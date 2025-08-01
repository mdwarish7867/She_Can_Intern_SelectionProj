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
    baseURL: "http://localhost:5000/api/admin",
    headers: {
      Authorization: `Basic ${adminAuth}`,
    },
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await adminApi.get("/users");
      console.log("Users data:", response.data); // For debugging
      setUsers(response.data);
      return response.data;
    } catch (err) {
      toast.error("Failed to fetch users");
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

  // Fetch referral tree
  const fetchReferralTree = async () => {
    try {
      const users = await fetchUsers();
      buildReferralTree(users);
    } catch (err) {
      toast.error("Failed to fetch referral tree");
    }
  };

  // Build referral tree structure
  const buildReferralTree = (users) => {
    const userMap = {};
    const tree = [];

    // Create a map of users by their ID
    users.forEach((user) => {
      userMap[user._id] = {
        ...user.toObject(), // Convert mongoose document to plain object
        children: [],
      };
    });

    // Build the tree structure
    users.forEach((user) => {
      if (user.referrer && userMap[user.referrer._id]) {
        userMap[user.referrer._id].children.push(userMap[user._id]);
      } else {
        tree.push(userMap[user._id]);
      }
    });

    setReferralTree(tree);
    console.log("Referral tree built:", tree); // For debugging
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchReferralTree();
        await fetchContacts();
        await fetchLeaderboard();
      } catch (err) {
        toast.error("Failed to load data");
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
        fetchReferralTree();
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
      fetchReferralTree();
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

  // Render referral tree recursively
  const renderTree = (node, depth = 0) => {
    return (
      <div key={node._id} className="relative pl-6 mt-3">
        {/* Vertical line */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
        )}

        {/* Node */}
        <div className={`flex items-start ${depth > 0 ? "ml-4" : ""}`}>
          {/* Horizontal line */}
          {depth > 0 && (
            <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-300"></div>
          )}

          {/* User card */}
          <div className="bg-white border rounded-lg shadow-sm p-3 w-48 z-10 relative">
            <div className="font-medium text-sm">{node.name}</div>
            <div className="text-xs text-gray-500 truncate mb-1">
              {node.email}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                ₹{node.amountRaised}
              </span>
              <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                {node.referralsCount || 0} refs
              </span>
            </div>
          </div>
        </div>

        {/* Children */}
        {node.children && node.children.length > 0 && (
          <div className="mt-3">
            {node.children.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium mb-2">
              Message from {selectedMessage.name}
              {selectedMessage.userId && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Registered User
                </span>
              )}
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>Email:</strong> {selectedMessage.email}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Date:</strong>{" "}
              {new Date(selectedMessage.date).toLocaleString()}
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  deleteContact(selectedMessage._id);
                  setSelectedMessage(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("referralTree")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "referralTree"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Referral Tree
            </button>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* Referral Tree Tab */}
            {activeTab === "referralTree" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Referral Network
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Visual representation of referral relationships
                  </p>
                </div>

                <div className="p-4">
                  <div
                    className="bg-gray-50 rounded-lg p-4 overflow-auto min-h-[300px]"
                    ref={treeContainerRef}
                  >
                    <div className="flex flex-wrap">
                      {referralTree.length > 0 ? (
                        referralTree.map((root) => renderTree(root))
                      ) : (
                        <div className="text-center py-8 w-full">
                          <p className="text-gray-500">
                            No referral data available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                      <span>User node with amount raised and referrals</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-px bg-gray-300 mr-2 relative">
                        <div className="absolute -left-1 top-0 w-2 h-px bg-gray-300 transform rotate-90"></div>
                      </div>
                      <span>Connection line showing referral relationship</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount Raised
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referrals
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              className="border rounded px-2 py-1 w-24 text-sm font-bold"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {user.referralsCount || 0} referrals
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Registered User
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="truncate max-w-xs">
                              {contact.message}
                            </div>
                            <button
                              onClick={() => setSelectedMessage(contact)}
                              className="mt-1 text-indigo-600 hover:text-indigo-900 text-xs"
                            >
                              View Full Message
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contact.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
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
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>

                      {passwordError && (
                        <div className="text-red-600 text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
