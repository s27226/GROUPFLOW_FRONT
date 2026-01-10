import React from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  danger = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.confirmDialogOverlay} onClick={onCancel}>
      <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmDialogHeader}>
          <h3>{title}</h3>
        </div>
        <div className={styles.confirmDialogBody}>
          <p>{message}</p>
        </div>
        <div className={styles.confirmDialogFooter}>
          <button 
            className={`${styles.confirmDialogBtn} ${styles.cancelBtn}`} 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmDialogBtn} ${danger ? styles.dangerBtn : styles.confirmBtn}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
