import React, { useState, useRef } from "react";
import { Image, X, Link as LinkIcon } from "lucide-react";
import styles from "./ImageUploadButton.module.css";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export interface ImageSelectData {
    file: File;
    preview: string | ArrayBuffer | null;
    base64: string;
}

interface ImageUploadButtonProps {
    /** Label for the upload section */
    label?: string;
    /** Current image preview URL */
    preview?: string;
    /** Callback when image is selected (receives { file, preview, base64 }) */
    onImageSelect?: (data: ImageSelectData) => void;
    /** Callback when image is removed */
    onImageRemove?: () => void;
    /** Callback when URL is changed (receives url string) */
    onUrlChange?: (url: string) => void;
    /** Current URL value */
    urlValue?: string;
    /** Type of image for styling */
    type?: 'banner' | 'profile' | 'project-logo' | 'project-banner';
    /** Whether to show URL input option */
    showUrlInput?: boolean;
    /** Accepted file types (default: image/*) */
    acceptedTypes?: string;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
    label,
    preview,
    onImageSelect,
    onImageRemove,
    onUrlChange,
    urlValue = "",
    type = "profile",
    showUrlInput = true,
    acceptedTypes = "image/*"
}) => {
    const [error, setError] = useState<string>("");
    const [uploading, setUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File size exceeds maximum allowed size of 25 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Please select a valid image file.");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            onImageSelect?.({
                file,
                preview: result,
                base64: result.split(',')[1] // Remove data:image/xxx;base64, prefix
            });
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemove = (): void => {
        setError("");
        onImageRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setError("");
        onUrlChange?.(e.target.value);
    };

    return (
        <div className={styles.container}>
            {label && <div className={styles.label}>{label}</div>}

            {preview && (
                <div className={`${styles.preview} ${type === 'banner' ? styles.previewBanner : type === 'profile' ? styles.previewProfile : styles.previewProjectLogo}`}>
                    <img src={preview} alt="Preview" />
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={handleRemove}
                        title="Remove image"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className={styles.buttons}>
                <label htmlFor={`file-input-${type}`} className={styles.btn}>
                    <Image size={20} />
                    <span>Upload Image</span>
                </label>
                <input
                    ref={fileInputRef}
                    id={`file-input-${type}`}
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileSelect}
                    className={styles.hiddenInput}
                />

                {showUrlInput && (
                    <div className={styles.urlGroup}>
                        <input
                            type="text"
                            value={urlValue}
                            onChange={handleUrlInputChange}
                            placeholder="Or enter image URL"
                            className={styles.urlInput}
                        />
                        <LinkIcon size={18} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                )}
            </div>

            <div className={styles.sizeWarning}>
                Maximum file size: 25 MB
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {uploading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Uploading...</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploadButton;
