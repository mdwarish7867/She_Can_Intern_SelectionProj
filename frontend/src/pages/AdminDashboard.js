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

  // Fetch referral tree
  const fetchReferralTree = async () => {
    try {
      const users = await fetchUsers();
      buildReferralTree(users);
    } catch (err) {
      toast.error("Failed to fetch referral tree");
    }
  };

  // Build referral tree structure - FIXED VERSION
  const buildReferralTree = (users) => {
    const userMap = {};
    const tree = [];

    // Create a map of users by their ID
    users.forEach((user) => {
      userMap[user._id] = {
        ...user,
        children: [],
      };
    });

    // Build the tree structure - FIXED REFERRER HANDLING
    users.forEach((user) => {
      // Handle both string IDs and populated referrer objects
      const referrerId = user.referrer?._id || user.referrer;

      if (referrerId && userMap[referrerId]) {
        userMap[referrerId].children.push(userMap[user._id]);
      } else {
        tree.push(userMap[user._id]);
      }
    });

    setReferralTree(tree);
    console.log("Fixed referral tree:", tree);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users first for the referral tree
        const users = await fetchUsers();
        console.log("Fetched users for tree:", users);
        buildReferralTree(users);

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
    if (!node) return null;

    return (
      <div key={node._id} className="relative pl-6 mt-3">
        {/* Vertical line */}
        {depth > 0 && (
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300"></div>
        )}

        {/* Node */}
        <div className={`flex items-start ${depth > 0 ? "ml-4" : ""}`}>
          {/* Horizontal line */}
          {depth > 0 && (
            <div className="absolute left-0 w-4 h-px bg-gray-300 top-1/2"></div>
          )}

          {/* User card */}
          <div className="relative z-10 w-48 p-3 bg-white border rounded-lg shadow-sm">
            <div className="text-sm font-medium">{node.name}</div>
            <div className="mb-1 text-xs text-gray-500 truncate">
              {node.email}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                ₹{node.amountRaised}
              </span>
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
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

      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === "referralTree" && (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
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
                    {referralTree.length > 0 ? (
                      <div className="flex flex-wrap">
                        {referralTree.map((root) => renderTree(root))}
                      </div>
                    ) : users.length > 0 ? (
                      <div className="w-full py-8 text-center">
                        <div className="mb-4">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-gray-900">
                          Connected Users
                        </h3>
                        <p className="mb-3 text-gray-500">
                          {users.length} users found but no referral
                          relationships detected
                        </p>
                        <p className="text-sm text-gray-600">
                          This could be because:
                        </p>
                        <ul className="max-w-md mx-auto mt-1 text-sm text-left text-gray-500 list-disc list-inside">
                          <li>No users have been referred yet</li>
                          <li>Users haven't entered referral codes</li>
                          <li>
                            The referral relationships haven't been established
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="w-full py-8 text-center">
                        <div className="mb-4">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-gray-900">
                          No Users Found
                        </h3>
                        <p className="text-gray-500">
                          There are no users in the system yet
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 mr-2 bg-blue-100 border border-blue-300 rounded"></div>
                      <span>User node with amount raised and referrals</span>
                    </div>
                    <div className="flex items-center">
                      <div className="relative w-4 h-px mr-2 bg-gray-300">
                        <div className="absolute top-0 w-2 h-px transform rotate-90 bg-gray-300 -left-1"></div>
                      </div>
                      <span>Connection line showing referral relationship</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
