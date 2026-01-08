import { useState, useRef } from "react";
import { Image, X, Link as LinkIcon } from "lucide-react";
import "./ImageUploadButton.css";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Reusable image upload component
 * @param {Object} props
 * @param {string} props.label - Label for the upload section
 * @param {string} props.preview - Current image preview URL
 * @param {Function} props.onImageSelect - Callback when image is selected (receives { file, preview })
 * @param {Function} props.onImageRemove - Callback when image is removed
 * @param {Function} props.onUrlChange - Callback when URL is changed (receives url string)
 * @param {string} props.urlValue - Current URL value
 * @param {'banner'|'profile'|'project-logo'} props.type - Type of image for styling
 * @param {boolean} props.showUrlInput - Whether to show URL input option
 * @param {string} props.acceptedTypes - Accepted file types (default: image/*)
 */
export default function ImageUploadButton({
    label,
    preview,
    onImageSelect,
    onImageRemove,
    onUrlChange,
    urlValue = "",
    type = "profile",
    showUrlInput = true,
    acceptedTypes = "image/*"
}) {
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
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
            onImageSelect?.({
                file,
                preview: reader.result,
                base64: reader.result.split(',')[1] // Remove data:image/xxx;base64, prefix
            });
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemove = () => {
        setError("");
        onImageRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUrlInputChange = (e) => {
        setError("");
        onUrlChange?.(e.target.value);
    };

    return (
        <div className="image-upload-container">
            {label && <div className="image-upload-label">{label}</div>}

            {preview && (
                <div className={`image-upload-preview ${type}`}>
                    <img src={preview} alt="Preview" />
                    <button
                        type="button"
                        className="image-upload-remove-btn"
                        onClick={handleRemove}
                        title="Remove image"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="image-upload-buttons">
                <label htmlFor={`file-input-${type}`} className="image-upload-btn">
                    <Image size={20} />
                    <span>Upload Image</span>
                </label>
                <input
                    ref={fileInputRef}
                    id={`file-input-${type}`}
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileSelect}
                    className="image-upload-hidden-input"
                />

                {showUrlInput && (
                    <div className="image-upload-url-group">
                        <input
                            type="text"
                            value={urlValue}
                            onChange={handleUrlInputChange}
                            placeholder="Or enter image URL"
                            className="image-upload-url-input"
                        />
                        <LinkIcon size={18} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                )}
            </div>

            <div className="image-upload-size-warning">
                Maximum file size: 25 MB
            </div>

            {error && (
                <div className="image-upload-error">
                    {error}
                </div>
            )}

            {uploading && (
                <div className="image-upload-loading">
                    <div className="image-upload-spinner"></div>
                    <span>Uploading...</span>
                </div>
            )}
        </div>
    );
}
