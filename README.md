# VidShort Frontend 🎬

A modern, mobile-first Angular 19 web application for generating AI-powered videos using Google Gemini Veo and Cloudflare R2 storage. Built with Tailwind CSS and standalone Angular architecture.

---

## 📱 Features

- **Mobile-First Responsive Design**:
  - Touch-friendly navigation (≥ 44px touch targets).
  - Bottom navigation bar on mobile viewports (`< md`), persistent sidebar on desktop (`≥ md`).
  - Adaptive grids (1-col mobile, 2-col tablet, 3-col desktop).
- **Runway / Sora-Style Studio Layout**:
  - **Storyboard Builder**: Add scenes, select camera movement (Pan, Zoom, Tilt, Orbit, Drone), lighting presets, and shot types (Wide, Close-up, Aerial).
  - **Character Consistency Studio**: Define facial features, outfits, traits, and upload reference images to Cloudflare R2.
  - **AI Video Generator**: Queue scene video generation via Gemini Veo with live polling status (PENDING -> PROCESSING -> COMPLETED).
  - **Sticky Responsive Video Player**: Direct streaming of generated MP4 scenes with custom controls and download options.
- **Real-Time Storage Bar**:
  - Visual tracking of Cloudflare R2 free tier storage (10 GB limit).
- **Security**:
  - HTTP interceptor injecting JWT Bearer tokens on all protected API calls.
  - Client-side AuthGuard for route protection.

---

## 🛠 Tech Stack

- **Framework**: Angular 19 (Standalone Components, Signals, RxJS 7.8)
- **Styling**: Tailwind CSS 3.4 & PostCSS
- **Routing**: Angular Router with AuthGuard
- **Language**: TypeScript 5.6

---

## 🏃 Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 🌐 Backend Configuration

By default, the application connects to the backend API at `http://localhost:8080/api`.  
To change this, edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```
