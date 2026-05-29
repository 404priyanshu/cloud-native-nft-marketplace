"use client";

import { useState, useCallback } from "react";
import { requestPresignedUrl } from "@/lib/api-client";

interface UploadState {
  isUploading: boolean;
  error: Error | null;
  uploadedUrl: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    uploadedUrl: null,
  });

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setState({ isUploading: true, error: null, uploadedUrl: null });

    try {
      // Request presigned URL from the API
      const { url } = await requestPresignedUrl(
        file.name,
        file.type
      );

      // Upload directly to S3
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.statusText}`);
      }

      const publicUrl = url.split("?")[0]; // Remove query params from presigned URL
      setState({ isUploading: false, error: null, uploadedUrl: publicUrl });
      return publicUrl;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Upload failed");
      setState({ isUploading: false, error, uploadedUrl: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, error: null, uploadedUrl: null });
  }, []);

  return { ...state, upload, reset };
}
