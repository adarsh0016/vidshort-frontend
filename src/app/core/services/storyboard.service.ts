import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Scene, SceneRequest, Storyboard } from '../models/storyboard.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoryboardService {
  constructor(private http: HttpClient) {}

  getStoryboard(projectId: string): Observable<ApiResponse<Storyboard>> {
    return this.http.get<ApiResponse<Storyboard>>(`${environment.apiUrl}/projects/${projectId}/storyboard`);
  }

  addScene(projectId: string, request: SceneRequest): Observable<ApiResponse<Scene>> {
    return this.http.post<ApiResponse<Scene>>(`${environment.apiUrl}/projects/${projectId}/storyboard/scenes`, request);
  }

  updateScene(projectId: string, sceneId: string, request: SceneRequest): Observable<ApiResponse<Scene>> {
    return this.http.put<ApiResponse<Scene>>(`${environment.apiUrl}/projects/${projectId}/storyboard/scenes/${sceneId}`, request);
  }

  deleteScene(projectId: string, sceneId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/projects/${projectId}/storyboard/scenes/${sceneId}`);
  }

  reorderScenes(projectId: string, storyboardId: string, sceneIds: string[]): Observable<ApiResponse<Scene[]>> {
    return this.http.put<ApiResponse<Scene[]>>(`${environment.apiUrl}/projects/${projectId}/storyboard/${storyboardId}/reorder`, { sceneIds });
  }
}
