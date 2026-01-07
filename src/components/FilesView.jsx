import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Trash2, Upload, X } from "lucide-react";
import { useBlobUpload } from "../hooks/useBlobUpload";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ui/ConfirmDialog";
import "../styles/FilesView.css";

const FilesView = ({ projectId, isOwner, isCollaborator }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, fileId: null, fileName: "", uploadedByUserId: null });
    const { getProjectFiles, uploadBlob, deleteBlob } = useBlobUpload();
    const { showToast } = useToast();
    const { user } = useAuth();

    const canUpload = isOwner || isCollaborator;

    const fetchFiles = useCallback(async () => {
        if (!projectId) return;
        
        setLoading(true);
        try {
            const projectFiles = await getProjectFiles(parseInt(projectId));
            setFiles(projectFiles);
        } catch (error) {
            console.error("Failed to fetch files:", error);
            showToast("Failed to load project files", "error");
        } finally {
            setLoading(false);
        }
    }, [projectId, getProjectFiles]); // Removed showToast from dependencies

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const blobData = await uploadBlob(file, "ProjectFile", parseInt(projectId));
            showToast("File uploaded successfully", "success");
            fetchFiles(); // Refresh file list
            setShowUploadDialog(false);
        } catch (error) {
            console.error("Upload error:", error);
            showToast(error.message || "Failed to upload file", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleFileDelete = async (fileId, fileName, uploadedByUserId) => {
        // Check permissions: owner can delete any file, collaborators can only delete their own
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
            fetchFiles(); // Refresh file list
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete file", "error");
        }
    };

    const handleFileDownload = async (file) => {
        try {
            // Use the presigned URL from the backend
            if (file.url) {
                window.open(file.url, '_blank');
            } else {
                showToast("File URL not available", "error");
            }
        } catch (error) {
            console.error("Download error:", error);
            showToast("Failed to download file", "error");
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
            <div className="files-view">
                <h2>Project Files</h2>
                <p>Loading files...</p>
            </div>
        );
    }

    return (
        <div className="files-view">
            <div className="files-header">
                <h2>Project Files</h2>
                {canUpload && (
                    <button 
                        className="upload-file-btn"
                        onClick={() => setShowUploadDialog(true)}
                    >
                        <Upload size={18} />
                        <span>Upload File</span>
                    </button>
                )}
            </div>

            {showUploadDialog && (
                <div className="upload-dialog-overlay" onClick={() => setShowUploadDialog(false)}>
                    <div className="upload-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-dialog-header">
                            <h3>Upload File</h3>
                            <button 
                                className="close-dialog-btn"
                                onClick={() => setShowUploadDialog(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="upload-dialog-body">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="file-input"
                            />
                            <p className="upload-hint">Maximum file size: 25 MB</p>
                            {uploading && <p>Uploading...</p>}
                        </div>
                    </div>
                </div>
            )}

            {files.length === 0 ? (
                <p className="no-files-message">
                    No files uploaded yet. 
                    {canUpload && " Click 'Upload File' to add files to this project."}
                </p>
            ) : (
                <ul className="files-list">
                    {files.map((file) => (
                        <li key={file.id} className="file-item">
                            <div className="file-info">
                                <span className="file-icon">{getFileIcon(file.contentType)}</span>
                                <div className="file-details">
                                    <span className="file-name">{file.fileName}</span>
                                    <span className="file-meta">
                                        {formatFileSize(file.fileSize)} • 
                                        Uploaded by {file.uploadedBy.nickname} • 
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="file-actions">
                                <button
                                    className="file-action-btn"
                                    onClick={() => handleFileDownload(file)}
                                    title="Download"
                                >
                                    <Download size={18} />
                                </button>
                                {(isOwner || file.uploadedBy.id === user?.id) && (
                                    <button
                                        className="file-action-btn delete"
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

