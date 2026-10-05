import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import { api } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users.filter(user => user.is_active).length;
  const inactiveUsers = users.filter(user => !user.is_active).length;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">TEAM</p>
          <h1>User management</h1>
          <p>Manage the people who have access to FarmLedger.</p>
        </div>
      </div>

      <div className="stats-grid user-stats">

        <div className="stat-card">
          <div className="stat-icon green">
            <UsersIcon />
          </div>

          <div className="stat-info">
            <span>Total users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <UserCheck />
          </div>

          <div className="stat-info">
            <span>Active</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <UserX />
          </div>

          <div className="stat-info">
            <span>Inactive</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

      </div>

      <div className="panel table-panel">
        <div className="table-wrap">

          {loading ? (
            <p style={{ padding: '20px' }}>Loading users...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.id}>

                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          {(user.username || 'U')[0].toUpperCase()}
                        </div>

                        <b>{user.username}</b>
                      </div>
                    </td>

                    <td>{user.phone || '-'}</td>

                    <td>
                      <span className="role">
                        <ShieldCheck size={14} />
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className="status">
                        <i />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <button className="secondary small">
                        Manage
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </>
  );
}



