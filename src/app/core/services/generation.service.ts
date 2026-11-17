import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Generation } from '../models/generation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerationService {
  constructor(private http: HttpClient) {}

  generateSceneVideo(sceneId: string): Observable<ApiResponse<Generation>> {
    return this.http.post<ApiResponse<Generation>>(`${environment.apiUrl}/generations/scenes/${sceneId}`, {});
  }

  generateThumbnail(sceneId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/generations/scenes/${sceneId}/thumbnail`, {});
  }

  getGenerationStatus(generationId: string): Observable<ApiResponse<Generation>> {
    return this.http.get<ApiResponse<Generation>>(`${environment.apiUrl}/generations/${generationId}/status`);
  }

  getProjectGenerations(projectId: string): Observable<ApiResponse<Generation[]>> {
    return this.http.get<ApiResponse<Generation[]>>(`${environment.apiUrl}/generations/project/${projectId}`);
  }
}
