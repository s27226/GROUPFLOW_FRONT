import { useCallback } from "react";
import { useGraphQL } from "../core/useGraphQL";
import { GRAPHQL_MUTATIONS, GRAPHQL_QUERIES } from "../../queries/graphql";
import { useAsyncOperation } from "../core/useAsyncOperation";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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

export const useBlobUpload = () => {
    const { executeMutation, executeQuery } = useGraphQL();
    const { loading: uploading, error, execute, reset } = useAsyncOperation();

    const uploadBlob = useCallback(async (file, blobType, projectId = null, postId = null) => {
        return execute(async () => {
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

            const response = await executeMutation(GRAPHQL_MUTATIONS.UPLOAD_BLOB, { input });

            if (!response?.uploadBlob) {
                throw new Error("Failed to upload file");
            }

            return response.uploadBlob;
        });
    }, [executeMutation, execute]);

    const deleteBlob = useCallback(async (blobId) => {
        return execute(async () => {
            const input = { blobId };
            const response = await executeMutation(GRAPHQL_MUTATIONS.DELETE_BLOB, { input });
            return response?.deleteBlob || false;
        }, { showLoading: false });
    }, [executeMutation, execute]);

    const getProjectFiles = useCallback(async (projectId) => {
        const response = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_FILES, { projectId });
        return response?.projectFiles || [];
    }, [executeQuery]);

    const getBlobUrl = useCallback(async (blobId) => {
        // For AWS S3, the blobPath is already a full URL
        // We can use it directly or query for it if needed
        // For now, returning null to indicate we should use blobPath directly
        return null;
    }, []);

    return {
        uploadBlob,
        deleteBlob,
        getProjectFiles,
        getBlobUrl,
        uploading,
        error,
        setError: reset
    };
};
