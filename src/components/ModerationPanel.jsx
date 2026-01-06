import { useState, useEffect, useCallback, useMemo } from 'react';
import { GET_ALL_USERS, GET_BANNED_USERS, GET_SUSPENDED_USERS } from '../queries/moderationQueries';
import { useGraphQL } from '../hooks/useGraphQL';
import UserManagement from './UserManagement';
import '../styles/ModerationPanel.css';

const ModerationPanel = () => {
  const { executeQuery } = useGraphQL();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query;
      switch (activeTab) {
        case 'banned':
          query = GET_BANNED_USERS;
          break;
        case 'suspended':
          query = GET_SUSPENDED_USERS;
          break;
        default:
          query = GET_ALL_USERS;
      }

      const response = await executeQuery(query);
      let userData = [];

      if (activeTab === 'all' && response?.moderation?.allUsers) {
        userData = response.moderation.allUsers;
      } else if (activeTab === 'banned' && response?.moderation?.bannedUsers) {
        userData = response.moderation.bannedUsers;
      } else if (activeTab === 'suspended' && response?.moderation?.suspendedUsers) {
        userData = response.moderation.suspendedUsers;
      }

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, executeQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (searchTerm === '') {
      return users;
    }
    
    return users.filter(
      (user) =>
        user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="modpanel-container">
      <div className="modpanel-header">
        <div className="modpanel-title-section">
          <h1>User Moderation</h1>
          <p className="modpanel-subtitle">Manage users, bans, suspensions, and roles</p>
        </div>
        <button onClick={handleRefresh} className="modpanel-refresh-btn">
          Refresh
        </button>
      </div>

      <div className="modpanel-controls">
        <div className="modpanel-tabs">
          <button
            className={`modpanel-tab ${activeTab === 'all' ? 'modpanel-tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Users
          </button>
          <button
            className={`modpanel-tab ${activeTab === 'banned' ? 'modpanel-tab-active' : ''}`}
            onClick={() => setActiveTab('banned')}
          >
            Banned
          </button>
          <button
            className={`modpanel-tab ${activeTab === 'suspended' ? 'modpanel-tab-active' : ''}`}
            onClick={() => setActiveTab('suspended')}
          >
            Suspended
          </button>
        </div>

        <div className="modpanel-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modpanel-search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="modpanel-loading">
          <div className="modpanel-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="modpanel-empty">
          <div className="modpanel-empty-icon">👥</div>
          <h2>No users found</h2>
          <p>{searchTerm ? 'Try adjusting your search' : 'No users match the current filter'}</p>
        </div>
      ) : (
        <>
          <div className="modpanel-count">
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </div>
          <UserManagement users={filteredUsers} onRefresh={handleRefresh} />
        </>
      )}
    </div>
  );
};

export default ModerationPanel;
