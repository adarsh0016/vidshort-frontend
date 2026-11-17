export interface Project {
  id: string;
  title: string;
  description?: string;
  masterPrompt?: string;
  resolution: '720p' | '1080p' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  genre?: string;
  tags?: string[];
  characterCount?: number;
  sceneCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  title: string;
  description?: string;
  masterPrompt?: string;
  resolution?: string;
  aspectRatio?: string;
  genre?: string;
  tags?: string[];
}
