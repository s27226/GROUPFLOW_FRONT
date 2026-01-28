import { useCallback } from "react";
import { useGraphQL } from "../core/useGraphQL";
import { GRAPHQL_MUTATIONS, GRAPHQL_QUERIES } from "../../queries/graphql";
import { useAsyncOperation } from "../core/useAsyncOperation";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

interface UploadedBlob {
    id: number;
    blobPath: string;
    fileName: string;
    contentType: string;
}

interface ProjectFile {
    id: number;
    name: string;
    url: string;
    size?: number;
    type?: string;
}

type BlobType = 'profile' | 'post' | 'project' | 'chat';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const useBlobUpload = () => {
    const { executeMutation, executeQuery } = useGraphQL();
    const { loading: uploading, error, execute, reset } = useAsyncOperation();

    const uploadBlob = useCallback(async (file: File, blobType: BlobType, projectId: number | null = null, postId: number | null = null): Promise<UploadedBlob | null> => {
        return execute(async () => {
            if (file.size > MAX_FILE_SIZE) {
                throw new Error("errors.FILE_SIZE_EXCEEDED");
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

            const response = await executeMutation(GRAPHQL_MUTATIONS.UPLOAD_BLOB, { input }) as { uploadBlob?: UploadedBlob } | null;

            if (!response?.uploadBlob) {
                throw new Error("errors.UPLOAD_FAILED");
            }

            return response.uploadBlob;
        });
    }, [executeMutation, execute]);

    const deleteBlob = useCallback(async (blobId: number): Promise<boolean | null> => {
        return execute(async () => {
            const input = { blobId };
            const response = await executeMutation(GRAPHQL_MUTATIONS.DELETE_BLOB, { input }) as { deleteBlob?: boolean } | null;
            return response?.deleteBlob || false;
        }, { showLoading: false });
    }, [executeMutation, execute]);

    const getProjectFiles = useCallback(async (projectId: number): Promise<ProjectFile[]> => {
        const response = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_FILES, { projectId }) as { projectFiles?: ProjectFile[] } | null;
        return response?.projectFiles || [];
    }, [executeQuery]);

    const getBlobUrl = useCallback(async (blobId: number): Promise<string | null> => {
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
