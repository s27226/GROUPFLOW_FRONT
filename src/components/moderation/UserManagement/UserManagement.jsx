import { useState } from 'react';
import { BAN_USER, UNBAN_USER, SUSPEND_USER, UNSUSPEND_USER, RESET_PASSWORD, MANAGE_USER_ROLE } from '../../../queries/moderationQueries';
import { useGraphQL } from '../../../hooks';
import styles from './UserManagement.module.css';

const UserManagement = ({ users, onRefresh }) => {
  const { executeQuery } = useGraphQL();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  const openModal = (type, user) => {
    setModalType(type);
    setSelectedUser(user);
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedUser(null);
    setFormData({});
  };

  const handleBanUser = async () => {
    try {
      const variables = {
        input: {
          userId: selectedUser.id,
          reason: formData.reason || 'No reason provided',
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        },
      };
      await executeQuery(BAN_USER, variables);
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async () => {
    try {
      await executeQuery(UNBAN_USER, { userId: selectedUser.id });
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleSuspendUser = async () => {
    try {
      const variables = {
        input: {
          userId: selectedUser.id,
          suspendedUntil: new Date(formData.suspendedUntil).toISOString(),
        },
      };
      await executeQuery(SUSPEND_USER, variables);
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleUnsuspendUser = async () => {
    try {
      await executeQuery(UNSUSPEND_USER, { userId: selectedUser.id });
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      const variables = {
        input: {
          userId: selectedUser.id,
          newPassword: formData.newPassword,
        },
      };
      await executeQuery(RESET_PASSWORD, variables);
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleManageRole = async (isModerator) => {
    try {
      const variables = {
        input: {
          userId: selectedUser.id,
          isModerator,
        },
      };
      await executeQuery(MANAGE_USER_ROLE, variables);
      closeModal();
      onRefresh();
    } catch (error) {
      console.error('Error managing user role:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.userManagement}>
      <div className={styles.usersGrid}>
        {users.map((user) => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.userHeader}>
              <img
                src={user.profilePic || '/default-avatar.png'}
                alt={user.nickname}
                className={styles.userAvatar}
              />
              <div className={styles.userInfo}>
                <div className={styles.userNameRow}>
                  <h3>{user.nickname}</h3>
                  {user.isModerator && <span className={styles.badge}>Moderator</span>}
                  {user.isBanned && <span className={`${styles.badge} ${styles.banned}`}>Banned</span>}
                  {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
                    <span className={`${styles.badge} ${styles.suspended}`}>Suspended</span>
                  )}
                </div>
                <p className={styles.userEmail}>{user.email}</p>
                <p className={styles.userJoined}>Joined: {formatDate(user.joined)}</p>
              </div>
            </div>

            {user.isBanned && (
              <div className={styles.banInfo}>
                <p><strong>Reason:</strong> {user.banReason}</p>
                {user.banExpiresAt && <p><strong>Expires:</strong> {formatDate(user.banExpiresAt)}</p>}
                {user.bannedBy && <p><strong>Banned by:</strong> {user.bannedBy.nickname}</p>}
              </div>
            )}

            {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
              <div className={styles.suspendInfo}>
                <p><strong>Suspended until:</strong> {formatDate(user.suspendedUntil)}</p>
              </div>
            )}

            <div className={styles.actions}>
              {!user.isBanned ? (
                <button onClick={() => openModal('ban', user)} className={`${styles.btn} ${styles.btnDanger}`}>
                  Ban User
                </button>
              ) : (
                <button onClick={() => openModal('unban', user)} className={`${styles.btn} ${styles.btnSuccess}`}>
                  Unban User
                </button>
              )}
              {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
                <button onClick={() => openModal('unsuspend', user)} className={`${styles.btn} ${styles.btnSuccess}`}>
                  Unsuspend User
                </button>
              ) : (
                <button onClick={() => openModal('suspend', user)} className={`${styles.btn} ${styles.btnWarning}`}>
                  Suspend User
                </button>
              )}
              <button onClick={() => openModal('resetPassword', user)} className={`${styles.btn} ${styles.btnSecondary}`}>
                Reset Password
              </button>
              {!user.isModerator ? (
                <button onClick={() => openModal('makeModerator', user)} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Make Moderator
                </button>
              ) : (
                <button onClick={() => openModal('removeModerator', user)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Remove Moderator
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalType === 'ban' ? 'Ban User' : 
                   modalType === 'unban' ? 'Unban User' :
                   modalType === 'suspend' ? 'Suspend User' :
                   modalType === 'unsuspend' ? 'Unsuspend User' :
                   modalType === 'resetPassword' ? 'Reset Password' :
                   modalType === 'makeModerator' ? 'Make Moderator' :
                   'Remove Moderator'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'ban' && (
                <>
                  <p>Ban user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.formGroup}>
                    <label>Reason:</label>
                    <textarea
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Enter ban reason"
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Expires At (optional):</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt || ''}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button onClick={handleBanUser} className={`${styles.btn} ${styles.btnDanger}`}>Ban User</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'unban' && (
                <>
                  <p>Unban user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.modalActions}>
                    <button onClick={handleUnbanUser} className={`${styles.btn} ${styles.btnSuccess}`}>Unban User</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'suspend' && (
                <>
                  <p>Suspend user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.formGroup}>
                    <label>Suspended Until:</label>
                    <input
                      type="datetime-local"
                      value={formData.suspendedUntil || ''}
                      onChange={(e) => setFormData({ ...formData, suspendedUntil: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button onClick={handleSuspendUser} className={`${styles.btn} ${styles.btnWarning}`}>Suspend User</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'unsuspend' && (
                <>
                  <p>Unsuspend user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.modalActions}>
                    <button onClick={handleUnsuspendUser} className={`${styles.btn} ${styles.btnSuccess}`}>Unsuspend User</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'resetPassword' && (
                <>
                  <p>Reset password for <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.formGroup}>
                    <label>New Password:</label>
                    <input
                      type="password"
                      value={formData.newPassword || ''}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button onClick={handleResetPassword} className={`${styles.btn} ${styles.btnPrimary}`}>Reset Password</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'makeModerator' && (
                <>
                  <p>Make <strong>{selectedUser.nickname}</strong> a moderator?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => handleManageRole(true)} className={`${styles.btn} ${styles.btnPrimary}`}>Make Moderator</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'removeModerator' && (
                <>
                  <p>Remove moderator role from <strong>{selectedUser.nickname}</strong>?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => handleManageRole(false)} className={`${styles.btn} ${styles.btnWarning}`}>Remove Moderator</button>
                    <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
