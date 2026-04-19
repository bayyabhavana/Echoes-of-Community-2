import { useState } from 'react';
import { toast } from 'sonner';

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export function useFileUpload() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
    });

    const uploadFile = async (file: File): Promise<string> => {
        setUploadState({ isUploading: true, progress: 0, error: null });

        try {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB');
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
            }

            const reader = new FileReader();
            const promise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
            });
            reader.readAsDataURL(file);
            const base64Url = await promise;
            
            setUploadState({ isUploading: false, progress: 100, error: null });

            // Return the base64 URL directly instead of attempting to save to disk on Vercel
            return base64Url;
        } catch (error: any) {
            setUploadState({ isUploading: false, progress: 0, error: error.message });
            toast.error(error.message || 'Failed to upload file');
            throw error;
        }
    };

    const reset = () => {
        setUploadState({ isUploading: false, progress: 0, error: null });
    };

    return {
        uploadFile,
        isUploading: uploadState.isUploading,
        progress: uploadState.progress,
        error: uploadState.error,
        reset,
    };
}
