export interface PresignedUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface StorageStats {
  totalBytesUsed: number;
  totalMegabytesUsed: number;
  totalGigabytesUsed: number;
  freeTierLimitGigabytes: number;
  percentageUsed: number;
  totalVideosCount: number;
  totalImagesCount: number;
}

export interface GalleryAsset {
  id: string;
  r2ObjectKey: string;
  assetCategory: 'VIDEO' | 'CHARACTER_IMAGE' | 'THUMBNAIL' | 'LAST_FRAME';
  originalFilename?: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  downloadUrl?: string;
}
