import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, User } from '../models/auth.model';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ai_video_token';
  private readonly USER_KEY = 'ai_video_user';

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { email: string; password: string; displayName: string; geminiApiKey?: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res.data))
    );
  }

  login(data: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap(res => this.handleAuthSuccess(res.data))
    );
  }

  saveApiKey(apiKey: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${environment.apiUrl}/auth/api-key`, { apiKey, provider: 'GEMINI' });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  private handleAuthSuccess(auth: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, auth.token);
    const user: User = {
      id: auth.userId,
      email: auth.email,
      displayName: auth.displayName,
      role: auth.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.token.set(auth.token);
    this.currentUser.set(user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
