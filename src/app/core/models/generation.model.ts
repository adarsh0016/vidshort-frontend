export interface Generation {
  id: string;
  sceneId: string;
  sceneOrderIndex: number;
  status: 'QUEUED' | 'PROCESSING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  composedPrompt: string;
  modelUsed: string;
  resolution?: string;
  durationSeconds?: number;
  attemptNumber: number;
  videoUrl?: string;
  fileSizeBytes?: number;
  apiLatencyMs?: number;
  errorMessage?: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
}
