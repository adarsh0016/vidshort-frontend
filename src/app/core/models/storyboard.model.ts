import { Character } from './character.model';

export interface Scene {
  id: string;
  storyboardId: string;
  orderIndex: number;
  prompt: string;
  shotType: 'CLOSE_UP' | 'MEDIUM' | 'WIDE' | 'EXTREME_WIDE' | 'POV';
  cameraMovement: 'STATIC' | 'DOLLY' | 'PAN' | 'TILT' | 'TRACKING' | 'DRONE' | 'HANDHELD';
  dialogue?: string;
  sfx?: string;
  ambientAudio?: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  thumbnailR2Key?: string;
  transitionNote?: string;
  directorNotes?: string;
  characters?: Character[];
  createdAt: string;
  updatedAt: string;
}

export interface Storyboard {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  totalDurationSeconds: number;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface SceneRequest {
  prompt: string;
  shotType?: string;
  cameraMovement?: string;
  dialogue?: string;
  sfx?: string;
  ambientAudio?: string;
  durationSeconds?: number;
  transitionNote?: string;
  directorNotes?: string;
  characterIds?: string[];
}
