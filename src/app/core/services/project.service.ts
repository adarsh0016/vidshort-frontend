import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Project, ProjectRequest } from '../models/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  getProjects(): Observable<ApiResponse<{ content: Project[]; totalElements: number }>> {
    return this.http.get<ApiResponse<{ content: Project[]; totalElements: number }>>(`${environment.apiUrl}/projects`);
  }

  getProjectById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${environment.apiUrl}/projects/${id}`);
  }

  createProject(request: ProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${environment.apiUrl}/projects`, request);
  }

  updateProject(id: string, request: ProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${environment.apiUrl}/projects/${id}`, request);
  }

  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/projects/${id}`);
  }
}
