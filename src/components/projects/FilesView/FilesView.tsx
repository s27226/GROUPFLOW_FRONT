import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Download, Trash2, Upload, X } from "lucide-react";
import { useBlobUpload, useFetch } from "../../../hooks";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import styles from "./FilesView.module.css";

interface ProjectFileData {
    id: number;
    name: string;
    url: string;
    size?: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
    contentType?: string;
    uploadedBy?: {
        id: string;
        nickname: string;
    };
    uploadedAt?: string;
}

interface DeleteConfirmState {
    show: boolean;
    fileId: string | null;
    fileName: string;
    uploadedByUserId: string | null;
}

interface FilesViewProps {
    projectId: string;
    isOwner: boolean;
    isCollaborator: boolean;
}

const FilesView: React.FC<FilesViewProps> = ({ projectId, isOwner, isCollaborator }) => {
    const { t } = useTranslation();
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false, fileId: null, fileName: "", uploadedByUserId: null });
    const { getProjectFiles, uploadBlob, deleteBlob, uploading } = useBlobUpload();
    const { showToast } = useToast();
    const { user } = useAuth();

    const fetchFiles = useCallback(async (): Promise<ProjectFileData[]> => {
        if (!projectId) return [];
        const projectFiles = await getProjectFiles(parseInt(projectId));
        return projectFiles as ProjectFileData[];
    }, [projectId, getProjectFiles]);

    const { data: files, loading, refetch } = useFetch<ProjectFileData[]>(fetchFiles, {
        skip: !projectId,
        initialData: []
    });

    const canUpload = isOwner || isCollaborator;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadBlob(file, "project", parseInt(projectId));
            showToast(t('projects.fileUploaded'), "success");
            refetch();
            setShowUploadDialog(false);
        } catch (error) {
            console.error("Upload error:", error);
            showToast(error instanceof Error ? error.message : t('projects.fileUploadFailed'), "error");
        }
    };

    const handleFileDelete = async (fileId: string, fileName: string, uploadedByUserId: string): Promise<void> => {
        if (!isOwner && Number(uploadedByUserId) !== user?.id) {
            showToast(t('projects.canOnlyDeleteOwn'), "error");
            return;
        }

        setDeleteConfirm({ show: true, fileId, fileName, uploadedByUserId });
    };

    const confirmFileDelete = async () => {
        const { fileId } = deleteConfirm;
        setDeleteConfirm({ show: false, fileId: null, fileName: "", uploadedByUserId: null });

        if (fileId === null) return;

        try {
            await deleteBlob(parseInt(fileId));
            showToast(t('projects.fileDeleted'), "success");
            refetch();
        } catch (error) {
            console.error("Delete error:", error);
            showToast(t('projects.fileDeleteFailed'), "error");
        }
    };

    const handleFileDownload = async (file: ProjectFileData): Promise<void> => {
        if (file.url) {
            window.open(file.url, '_blank');
        } else {
            showToast(t('projects.fileUrlNotAvailable'), "error");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (contentType: string): string => {
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
                <h2>{t('projects.projectFiles')}</h2>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className={styles.filesView}>
            <div className={styles.filesHeader}>
                <h2>{t('projects.projectFiles')}</h2>
                {canUpload && (
                    <button 
                        className={styles.uploadFileBtn}
                        onClick={() => setShowUploadDialog(true)}
                    >
                        <Upload size={18} />
                        <span>{t('projects.uploadFile')}</span>
                    </button>
                )}
            </div>

            {showUploadDialog && (
                <div className={styles.uploadDialogOverlay} onClick={() => setShowUploadDialog(false)}>
                    <div className={styles.uploadDialog} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.uploadDialogHeader}>
                            <h3>{t('projects.uploadFile')}</h3>
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
                            <p className={styles.uploadHint}>{t('projects.maxFileSize')}</p>
                            {uploading && <p>{t('common.uploading')}</p>}
                        </div>
                    </div>
                </div>
            )}

            {(!files || files.length === 0) ? (
                <p className={styles.noFilesMessage}>
                    {t('projects.noFilesYet')}
                </p>
            ) : (
                <ul className={styles.filesList}>
                    {files.map((file) => (
                        <li key={file.id} className={styles.fileItem}>
                            <div className={styles.fileInfo}>
                                <span className={styles.fileIcon}>{getFileIcon(file.contentType || file.type || '')}</span>
                                <div className={styles.fileDetails}>
                                    <span className={styles.fileName}>{file.fileName || file.name}</span>
                                    <span className={styles.fileMeta}>
                                        {formatFileSize(file.fileSize ?? file.size ?? 0)} • 
                                        {t('projects.uploadedBy')} {file.uploadedBy?.nickname || t('common.unknown')} • 
                                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : t('common.unknown')}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.fileActions}>
                                <button
                                    className={styles.fileActionBtn}
                                    onClick={() => handleFileDownload(file)}
                                    title={t('common.download')}
                                >
                                    <Download size={18} />
                                </button>
                                {(isOwner || file.uploadedBy?.id === user?.id) && (
                                    <button
                                        className={`${styles.fileActionBtn} ${styles.delete}`}
                                        onClick={() => handleFileDelete(String(file.id), file.fileName || file.name, file.uploadedBy?.id || '')}
                                        title={t('common.delete')}
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
                title={t('projects.deleteFile')}
                message={t('projects.deleteFileConfirm', { name: deleteConfirm.fileName })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger={true}
                onConfirm={confirmFileDelete}
                onCancel={() => setDeleteConfirm({ show: false, fileId: null, fileName: "", uploadedByUserId: null })}
            />
        </div>
    );
};

export default FilesView;
