import { useState, useMemo } from 'react';
import { useModerationUsers } from '../../../hooks';
import UserManagement from '../UserManagement';
import styles from './ModerationPanel.module.css';

const ModerationPanel = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use unified moderation hook
  const { users, loading, refetch } = useModerationUsers(activeTab, { autoFetch: true });

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
    refetch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>User Moderation</h1>
          <p className={styles.subtitle}>Manage users, bans, suspensions, and roles</p>
        </div>
        <button onClick={handleRefresh} className={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Users
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'banned' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('banned')}
          >
            Banned
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'suspended' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('suspended')}
          >
            Suspended
          </button>
        </div>

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👥</div>
          <h2>No users found</h2>
          <p>{searchTerm ? 'Try adjusting your search' : 'No users match the current filter'}</p>
        </div>
      ) : (
        <>
          <div className={styles.count}>
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </div>
          <UserManagement users={filteredUsers} onRefresh={handleRefresh} />
        </>
      )}
    </div>
  );
};

export default ModerationPanel;
