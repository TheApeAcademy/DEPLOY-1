import type { FileInfo } from '@/types';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

// ── Upload a single file to Cloudinary ──────────────────────
// Uses unsigned uploads with an upload preset (no secret key needed on frontend)
// In Cloudinary dashboard: Settings → Upload → Add upload preset → Mode: Unsigned
export const uploadFile = async (
  file: File,
  assignmentId: string,
  onProgress?: (pct: number) => void
): Promise<{ url: string; publicId: string; error?: never } | { url?: never; publicId?: never; error: string }> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return { error: 'Cloudinary not configured — add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to env' };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `apeacademy/assignments/${assignmentId}`);
  formData.append('resource_type', 'auto');

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, publicId: res.public_id });
      } else {
        const err = JSON.parse(xhr.responseText);
        resolve({ error: err.error?.message || 'Upload failed' });
      }
    };

    xhr.onerror = () => resolve({ error: 'Network error during upload' });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
    xhr.send(formData);
  });
};

// ── Upload multiple files ─────────────────────────────────────
export const uploadFiles = async (
  files: File[],
  assignmentId: string,
  onProgress?: (pct: number) => void
): Promise<FileInfo[]> => {
  const results: FileInfo[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile(file, assignmentId, (pct) => {
      // Overall progress across all files
      const overall = Math.round(((i + pct / 100) / files.length) * 100);
      onProgress?.(overall);
    });

    if ('url' in result && result.url) {
      results.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url,
        publicId: result.publicId,
      });
    } else {
      console.error(`Failed to upload ${file.name}:`, result.error);
      // Still include the file info but without URL so admin knows it failed
      results.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadError: result.error,
      });
    }
  }

  onProgress?.(100);
  return results;
};
