import { useState } from "react";
import { useAuthenticatedRequest } from "./useAuthenticatedRequest";
import { GRAPHQL_MUTATIONS, GRAPHQL_QUERIES } from "../queries/graphql";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const useBlobUpload = () => {
    const { makeRequest } = useAuthenticatedRequest();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const uploadBlob = async (file, blobType, projectId = null, postId = null) => {
        setError(null);
        setUploading(true);

        try {
            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File size exceeds 25 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
            }

            const base64Data = await fileToBase64(file);

            const input = {
                fileName: file.name,
                base64Data,
                contentType: file.type,
                blobType,
                projectId,
                postId
            };

            const response = await makeRequest(GRAPHQL_MUTATIONS.UPLOAD_BLOB, { input });

            if (!response?.data?.uploadBlob) {
                throw new Error("Failed to upload file");
            }

            return response.data.uploadBlob;
        } catch (err) {
            console.error("Blob upload error:", err);
            setError(err.message || "Failed to upload file");
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const deleteBlob = async (blobId) => {
        setError(null);

        try {
            const input = { blobId };
            const response = await makeRequest(GRAPHQL_MUTATIONS.DELETE_BLOB, { input });
            return response?.data?.deleteBlob || false;
        } catch (err) {
            console.error("Blob delete error:", err);
            setError(err.message || "Failed to delete file");
            throw err;
        }
    };

    const getProjectFiles = async (projectId) => {
        try {
            const response = await makeRequest(GRAPHQL_QUERIES.GET_PROJECT_FILES, { projectId });
            return response?.data?.projectFiles || [];
        } catch (err) {
            console.error("Get project files error:", err);
            return [];
        }
    };

    return {
        uploadBlob,
        deleteBlob,
        getProjectFiles,
        uploading,
        error,
        setError
    };
};
