import { useState } from 'react';
import { BAN_USER, UNBAN_USER, SUSPEND_USER, UNSUSPEND_USER, RESET_PASSWORD, MANAGE_USER_ROLE } from '../queries/moderationQueries';
import { useGraphQL } from '../hooks/useGraphQL';
import '../styles/UserManagement.css';

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
    <div className="mod-user-management">
      <div className="mod-users-grid">
        {users.map((user) => (
          <div key={user.id} className="mod-user-card">
            <div className="mod-user-header">
              <img
                src={user.profilePic || '/default-avatar.png'}
                alt={user.nickname}
                className="mod-user-avatar"
              />
              <div className="mod-user-info">
                <div className="mod-user-name-row">
                  <h3>{user.nickname}</h3>
                  {user.isModerator && <span className="mod-badge">Moderator</span>}
                  {user.isBanned && <span className="mod-badge mod-banned">Banned</span>}
                  {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
                    <span className="mod-badge mod-suspended">Suspended</span>
                  )}
                </div>
                <p className="mod-user-email">{user.email}</p>
                <p className="mod-user-joined">Joined: {formatDate(user.joined)}</p>
              </div>
            </div>

            {user.isBanned && (
              <div className="mod-ban-info">
                <p><strong>Reason:</strong> {user.banReason}</p>
                {user.banExpiresAt && <p><strong>Expires:</strong> {formatDate(user.banExpiresAt)}</p>}
                {user.bannedBy && <p><strong>Banned by:</strong> {user.bannedBy.nickname}</p>}
              </div>
            )}

            {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && (
              <div className="mod-suspend-info">
                <p><strong>Suspended until:</strong> {formatDate(user.suspendedUntil)}</p>
              </div>
            )}

            <div className="mod-actions">
              {!user.isBanned ? (
                <button onClick={() => openModal('ban', user)} className="mod-btn mod-btn-danger">
                  Ban User
                </button>
              ) : (
                <button onClick={() => openModal('unban', user)} className="mod-btn mod-btn-success">
                  Unban User
                </button>
              )}
              {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
                <button onClick={() => openModal('unsuspend', user)} className="mod-btn mod-btn-success">
                  Unsuspend User
                </button>
              ) : (
                <button onClick={() => openModal('suspend', user)} className="mod-btn mod-btn-warning">
                  Suspend User
                </button>
              )}
              <button onClick={() => openModal('resetPassword', user)} className="mod-btn mod-btn-secondary">
                Reset Password
              </button>
              {!user.isModerator ? (
                <button onClick={() => openModal('makeModerator', user)} className="mod-btn mod-btn-primary">
                  Make Moderator
                </button>
              ) : (
                <button onClick={() => openModal('removeModerator', user)} className="mod-btn mod-btn-secondary">
                  Remove Moderator
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="mod-modal-overlay" onClick={closeModal}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mod-modal-header">
              <h2>{modalType === 'ban' ? 'Ban User' : 
                   modalType === 'unban' ? 'Unban User' :
                   modalType === 'suspend' ? 'Suspend User' :
                   modalType === 'unsuspend' ? 'Unsuspend User' :
                   modalType === 'resetPassword' ? 'Reset Password' :
                   modalType === 'makeModerator' ? 'Make Moderator' :
                   'Remove Moderator'}</h2>
              <button className="mod-close-btn" onClick={closeModal}>&times;</button>
            </div>

            <div className="mod-modal-body">
              {modalType === 'ban' && (
                <>
                  <p>Ban user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-form-group">
                    <label>Reason:</label>
                    <textarea
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Enter ban reason"
                      rows={3}
                    />
                  </div>
                  <div className="mod-form-group">
                    <label>Expires At (optional):</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt || ''}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="mod-modal-actions">
                    <button onClick={handleBanUser} className="mod-btn mod-btn-danger">Ban User</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'unban' && (
                <>
                  <p>Unban user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-modal-actions">
                    <button onClick={handleUnbanUser} className="mod-btn mod-btn-success">Unban User</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'suspend' && (
                <>
                  <p>Suspend user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-form-group">
                    <label>Suspended Until:</label>
                    <input
                      type="datetime-local"
                      value={formData.suspendedUntil || ''}
                      onChange={(e) => setFormData({ ...formData, suspendedUntil: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mod-modal-actions">
                    <button onClick={handleSuspendUser} className="mod-btn mod-btn-warning">Suspend User</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'unsuspend' && (
                <>
                  <p>Unsuspend user <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-modal-actions">
                    <button onClick={handleUnsuspendUser} className="mod-btn mod-btn-success">Unsuspend User</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'resetPassword' && (
                <>
                  <p>Reset password for <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-form-group">
                    <label>New Password:</label>
                    <input
                      type="password"
                      value={formData.newPassword || ''}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="mod-modal-actions">
                    <button onClick={handleResetPassword} className="mod-btn mod-btn-primary">Reset Password</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'makeModerator' && (
                <>
                  <p>Make <strong>{selectedUser.nickname}</strong> a moderator?</p>
                  <div className="mod-modal-actions">
                    <button onClick={() => handleManageRole(true)} className="mod-btn mod-btn-primary">Make Moderator</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
                  </div>
                </>
              )}

              {modalType === 'removeModerator' && (
                <>
                  <p>Remove moderator role from <strong>{selectedUser.nickname}</strong>?</p>
                  <div className="mod-modal-actions">
                    <button onClick={() => handleManageRole(false)} className="mod-btn mod-btn-warning">Remove Moderator</button>
                    <button onClick={closeModal} className="mod-btn mod-btn-secondary">Cancel</button>
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
