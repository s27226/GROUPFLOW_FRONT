import { useState, useCallback } from "react";
import { FileText, Download, Trash2, Upload, X } from "lucide-react";
import { useBlobUpload, useFetch } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import styles from "./FilesView.module.css";

const FilesView = ({ projectId, isOwner, isCollaborator }) => {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, fileId: null, fileName: "", uploadedByUserId: null });
    const { getProjectFiles, uploadBlob, deleteBlob, uploading } = useBlobUpload();
    const { showToast } = useToast();
    const { user } = useAuth();

    const fetchFiles = useCallback(async () => {
        if (!projectId) return [];
        return getProjectFiles(parseInt(projectId));
    }, [projectId, getProjectFiles]);

    const { data: files, loading, refetch } = useFetch(fetchFiles, {
        skip: !projectId,
        initialData: []
    });

    const canUpload = isOwner || isCollaborator;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await uploadBlob(file, "ProjectFile", parseInt(projectId));
            showToast("File uploaded successfully", "success");
            refetch();
            setShowUploadDialog(false);
        } catch (error) {
            console.error("Upload error:", error);
            showToast(error.message || "Failed to upload file", "error");
        }
    };

    const handleFileDelete = async (fileId, fileName, uploadedByUserId) => {
        if (!isOwner && uploadedByUserId !== user?.id) {
            showToast("You can only delete your own files", "error");
            return;
        }

        setDeleteConfirm({ show: true, fileId, fileName, uploadedByUserId });
    };

    const confirmFileDelete = async () => {
        const { fileId } = deleteConfirm;
        setDeleteConfirm({ show: false, fileId: null, fileName: "", uploadedByUserId: null });

        try {
            await deleteBlob(fileId);
            showToast("File deleted successfully", "success");
            refetch();
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete file", "error");
        }
    };

    const handleFileDownload = async (file) => {
        if (file.url) {
            window.open(file.url, '_blank');
        } else {
            showToast("File URL not available", "error");
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (contentType) => {
        if (contentType.startsWith('image/')) return '🖼️';
        if (contentType.includes('pdf')) return '📄';
        if (contentType.includes('word') || contentType.includes('document')) return '📝';
        if (contentType.includes('sheet') || contentType.includes('excel')) return '📊';
        if (contentType.includes('zip') || contentType.includes('rar')) return '📦';
        return '📁';
    };

    if (loading) {
        return (
            <div className={styles.filesView}>
                <h2>Project Files</h2>
                <p>Loading files...</p>
            </div>
        );
    }

    return (
        <div className={styles.filesView}>
            <div className={styles.filesHeader}>
                <h2>Project Files</h2>
                {canUpload && (
                    <button 
                        className={styles.uploadFileBtn}
                        onClick={() => setShowUploadDialog(true)}
                    >
                        <Upload size={18} />
                        <span>Upload File</span>
                    </button>
                )}
            </div>

            {showUploadDialog && (
                <div className={styles.uploadDialogOverlay} onClick={() => setShowUploadDialog(false)}>
                    <div className={styles.uploadDialog} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.uploadDialogHeader}>
                            <h3>Upload File</h3>
                            <button 
                                className={styles.closeDialogBtn}
                                onClick={() => setShowUploadDialog(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.uploadDialogBody}>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className={styles.fileInput}
                            />
                            <p className={styles.uploadHint}>Maximum file size: 25 MB</p>
                            {uploading && <p>Uploading...</p>}
                        </div>
                    </div>
                </div>
            )}

            {files.length === 0 ? (
                <p className={styles.noFilesMessage}>
                    No files uploaded yet. 
                    {canUpload && " Click 'Upload File' to add files to this project."}
                </p>
            ) : (
                <ul className={styles.filesList}>
                    {files.map((file) => (
                        <li key={file.id} className={styles.fileItem}>
                            <div className={styles.fileInfo}>
                                <span className={styles.fileIcon}>{getFileIcon(file.contentType)}</span>
                                <div className={styles.fileDetails}>
                                    <span className={styles.fileName}>{file.fileName}</span>
                                    <span className={styles.fileMeta}>
                                        {formatFileSize(file.fileSize)} • 
                                        Uploaded by {file.uploadedBy.nickname} • 
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.fileActions}>
                                <button
                                    className={styles.fileActionBtn}
                                    onClick={() => handleFileDownload(file)}
                                    title="Download"
                                >
                                    <Download size={18} />
                                </button>
                                {(isOwner || file.uploadedBy.id === user?.id) && (
                                    <button
                                        className={`${styles.fileActionBtn} ${styles.delete}`}
                                        onClick={() => handleFileDelete(file.id, file.fileName, file.uploadedBy.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                title="Delete File"
                message={`Are you sure you want to delete "${deleteConfirm.fileName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                danger={true}
                onConfirm={confirmFileDelete}
                onCancel={() => setDeleteConfirm({ show: false, fileId: null, fileName: "", uploadedByUserId: null })}
            />
        </div>
    );
};

export default FilesView;
