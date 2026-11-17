import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Character, CharacterImage, CharacterRequest } from '../models/character.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  constructor(private http: HttpClient) {}

  getCharacters(projectId: string): Observable<ApiResponse<Character[]>> {
    return this.http.get<ApiResponse<Character[]>>(`${environment.apiUrl}/projects/${projectId}/characters`);
  }

  getCharacterById(projectId: string, id: string): Observable<ApiResponse<Character>> {
    return this.http.get<ApiResponse<Character>>(`${environment.apiUrl}/projects/${projectId}/characters/${id}`);
  }

  createCharacter(projectId: string, request: CharacterRequest): Observable<ApiResponse<Character>> {
    return this.http.post<ApiResponse<Character>>(`${environment.apiUrl}/projects/${projectId}/characters`, request);
  }

  updateCharacter(projectId: string, id: string, request: CharacterRequest): Observable<ApiResponse<Character>> {
    return this.http.put<ApiResponse<Character>>(`${environment.apiUrl}/projects/${projectId}/characters/${id}`, request);
  }

  deleteCharacter(projectId: string, id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/projects/${projectId}/characters/${id}`);
  }
}
