import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { GalleryAsset, PresignedUrlResponse, StorageStats } from '../models/storage.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private http: HttpClient) {}

  getPresignedUploadUrl(filename: string, category: string, mimeType: string): Observable<ApiResponse<PresignedUrlResponse>> {
    return this.http.get<ApiResponse<PresignedUrlResponse>>(
      `${environment.apiUrl}/storage/presigned-upload?filename=${encodeURIComponent(filename)}&category=${category}&mimeType=${encodeURIComponent(mimeType)}`
    );
  }

  uploadFileToR2(uploadUrl: string, file: File): Observable<any> {
    return this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type }
    });
  }

  getStorageStats(): Observable<ApiResponse<StorageStats>> {
    return this.http.get<ApiResponse<StorageStats>>(`${environment.apiUrl}/storage/stats`);
  }

  getGalleryAssets(): Observable<ApiResponse<{ content: GalleryAsset[] }>> {
    return this.http.get<ApiResponse<{ content: GalleryAsset[] }>>(`${environment.apiUrl}/gallery`);
  }
}
