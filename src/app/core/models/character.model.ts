export interface CharacterImage {
  id: string;
  r2Url: string;
  r2ObjectKey: string;
  imageType: 'UPLOADED' | 'AI_GENERATED';
  isPrimary: boolean;
  originalFilename?: string;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  appearance?: string;
  clothing?: string;
  personality?: string;
  ageRange?: string;
  gender?: string;
  additionalNotes?: string;
  sortOrder: number;
  images: CharacterImage[];
  primaryImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRequest {
  name: string;
  appearance?: string;
  clothing?: string;
  personality?: string;
  ageRange?: string;
  gender?: string;
  additionalNotes?: string;
  sortOrder?: number;
}
