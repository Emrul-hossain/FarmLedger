import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";

const emptyForm = {
  username: "",
  email: "",
  phone: "",
  role: "STAFF",
  password: "",
  is_active: true,
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // --------------------------------------------------
  // Load users
  // --------------------------------------------------

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("auth/users/");

      const data = response.data;

      // Supports both paginated and normal array response
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers(data.results || []);
      }
    } catch (err) {
      console.error("User fetch error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to manage users.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load users."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --------------------------------------------------
  // Search + Filter
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.username?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.phone?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // --------------------------------------------------
  // Form
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // Open Add Modal
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "STAFF",
      password: "",
      is_active: user.is_active,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // Save User
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingUser) {
        const payload = {
          email: form.email,
          phone: form.phone,
          role: form.role,
          is_active: form.is_active,
        };

        // Password only if entered
        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api.patch(
          `auth/users/${editingUser.id}/`,
          payload
        );

        setSuccess("User updated successfully.");
      } else {
        const payload = {
          username: form.username,
          email: form.email,
          phone: form.phone,
          role: form.role,
          password: form.password,
          is_active: form.is_active,
        };

        await api.post("auth/users/", payload);

        setSuccess("User created successfully.");
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      console.error("User save error:", err);

      const data = err.response?.data;

      if (typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(", ")
              : message;

            return `${field}: ${text}`;
          })
          .join(" | ");

        setError(messages || "Failed to save user.");
      } else {
        setError("Failed to save user.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Toggle Active Status
  // --------------------------------------------------

  const toggleStatus = async (user) => {
    const action = user.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.username}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.patch(
        `auth/users/${user.id}/`,
        {
          is_active: !user.is_active,
        }
      );

      setSuccess(
        `User ${action}d successfully.`
      );

      await loadUsers();
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update user status."
      );
    }
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `auth/users/${user.id}/`
      );

      setSuccess("User deleted successfully.");

      await loadUsers();
    } catch (err) {
      console.error("Delete user error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete user."
      );
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "MANAGER":
        return "Manager";
      case "STAFF":
        return "Staff";
      default:
        return role;
    }
  };
  

  return (
    
    <div className="page">

      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">
            ACCESS & USERS
          </div>

          <h1>User Management</h1>

          <p>
            Manage system users, roles and account
            status.
          </p>
        </div>

       <button
  className="primary"
  onClick={() => {
    console.log("ADD USER CLICKED");

    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  }}
>
  + Add User
</button>
      </div>

      {/* Alerts */}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          {success}
        </div>
      )}

      {/* Toolbar */}

      <div className="panel">
        <div className="toolbar">

          <input
            type="text"
            className="search"
            placeholder="Search username, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            className="filter-btn"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Roles
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="STAFF">
              Staff
            </option>
          </select>

          <select
            className="filter-btn"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

          <button
            className="secondary"
            onClick={loadUsers}
          >
            Refresh
          </button>

        </div>
      </div>

      {/* User Table */}

      <div className="panel table-panel">

        <div className="table-wrap">

          {loading ? (
            <div className="empty">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty">
              No users found.
            </div>
          ) : (
            <table>

              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <strong>
                        {user.username}
                      </strong>
                    </td>

                    <td>
                      {user.email || "—"}
                    </td>

                    <td>
                      {user.phone || "—"}
                    </td>

                    <td>
                      <span className="role-badge">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="action-cell">

                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() =>
                            openEditModal(user)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="icon-btn"
                          title={
                            user.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() =>
                            toggleStatus(user)
                          }
                        >
                          {user.is_active
                            ? "⏸"
                            : "▶"}
                        </button>

                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() =>
                            deleteUser(user)
                          }
                        >
                          🗑
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* Add / Edit Modal */}

      <Modal
  open={showModal}
  onClose={() => {
    if (!saving) {
      setShowModal(false);
    }
  }}
  title={
    editingUser
      ? "Edit User"
      : "Add User"
  }
>

        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >

          {/* Username */}

          <div className="field">
            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!!editingUser}
              required={!editingUser}
              placeholder="Enter username"
            />
          </div>

          {/* Email */}

          <div className="field">
            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          {/* Phone */}

          <div className="field">
            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          {/* Role */}

          <div className="field">
            <label>
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="STAFF">
                Staff
              </option>

              <option value="MANAGER">
                Manager
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>
          </div>

          {/* Password */}

          <div className="field">
            <label>
              Password
              {editingUser && (
                <span>
                  {" "}
                  (leave blank to keep current)
                </span>
              )}
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!editingUser}
              minLength={6}
              placeholder={
                editingUser
                  ? "New password (optional)"
                  : "Minimum 6 characters"
              }
            />
          </div>

          {/* Status */}

          <div className="field checkbox-field">

            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />

              <span>
                Active account
              </span>
            </label>

          </div>

          {/* Buttons */}

          <div className="modal-actions">

            <button
              type="button"
              className="secondary"
              onClick={() =>
                setShowModal(True)
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingUser
                ? "Update User"
                : "Create User"}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
}

export default UserManagementPage;