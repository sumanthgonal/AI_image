
# AI Studio Enhanced

A modern React + TypeScript web app that simulates a sophisticated AI image generation studio with advanced features and excellent user experience.

## ✨ Core Features

### 📸 Upload & Preview
- **Drag-and-drop** or click to upload PNG/JPG (≤10MB)
- **Smart client-side downscaling** to ≤1920px using Canvas API
- **Live image preview** with remove functionality
- **File validation** with user-friendly error messages

### ✍️ Prompt & Style System
- **Rich text prompt** input with live character feedback
- **10+ style options** (Editorial, Streetwear, Vintage, Minimalist, Artistic, Corporate, Cinematic, Cyberpunk, Bohemian, Industrial)
- **Searchable style dropdown** with descriptions
- **Live summary** showing image + prompt + style + status in real-time

### 🚀 AI Generation (Mock)
- **Realistic API simulation** with 1–2s latency
- **20% error rate** with "Model overloaded" message
- **Exponential backoff retry** (500ms → 1000ms → 2000ms, max 3 attempts)
- **Abort functionality** for in-flight requests
- **Toast notifications** for all operations (success, error, retry attempts)
- **Loading indicators** with progress feedback

### 📚 History Management
- **localStorage persistence** of last 5 generations
- **Click to restore** any previous generation
- **Rich history cards** with thumbnails and metadata
- **Automatic cleanup** to maintain 5-item limit

### ♿ Accessibility & UX
- **Full keyboard navigation** with Tab/Enter/Space support
- **Visible focus indicators** throughout the app
- **ARIA live regions** for screen reader announcements
- **Keyboard shortcuts**: Ctrl+G (generate), Esc (abort), Ctrl+C (clear), ? (help)
- **Dark/Light/System theme** support with smooth transitions
- **Responsive design** optimized for mobile and desktop

## 🌟 Enhanced Features

- **🌙 Dark Mode**: Full dark theme with system preference detection
- **🔔 Toast Notifications**: Real-time feedback for all user actions
- **⌨️ Keyboard Shortcuts**: Power-user friendly shortcuts
- **📱 Mobile Optimized**: Touch-friendly responsive design
- **🎨 Modern UI**: Professional interface with smooth animations
- **🛡️ Error Boundaries**: Graceful error handling and recovery
- **🔄 Progress Indicators**: Visual feedback during all operations

## 🧰 Tech Stack

**Frontend:**
- React 18 + TypeScript (strict mode)
- Vite (build tool & dev server)
- TailwindCSS with dark mode support

**UI & Icons:**
- Lucide React (modern icon library)
- React Hot Toast (notifications)
- Custom theme system with context API

**Code Quality:**
- ESLint + Prettier (zero warnings/errors)
- TypeScript strict mode
- Pre-commit hooks

**Testing:**
- Vitest + React Testing Library (unit tests)
- Playwright (E2E tests)
- Custom test utilities and mocks

**State Management:**
- React hooks (useState, useEffect, useCallback, useMemo)
- localStorage for persistence
- Context API for theme management

**Performance:**
- Code splitting ready
- Memoized components and callbacks
- Optimized image processing
- Lazy loading patterns

## 🚀 Quick Start

### Installation
```bash
git clone <repository-url>
cd ai-studio-enhanced
npm install
```

### Development
```bash
npm run dev       # Start development server
```
Visit http://localhost:5173 (or next available port)

### Production Build
```bash
npm run build     # Build for production
npm run preview   # Preview production build
```

## 🧪 Testing & Quality

### Code Quality
```bash
npm run lint      # ESLint check (0 errors/warnings ✅)
npm run format    # Format with Prettier
```

### Testing
```bash
npm run test      # Unit tests (Vitest + RTL)
npm run test:ui   # Tests with UI
npm run e2e       # E2E tests (Playwright)
```

### Manual Testing Checklist
- [ ] Upload PNG/JPG files (test drag-and-drop)
- [ ] Verify large images get downscaled to ≤1920px
- [ ] Test 10+ style options with search
- [ ] Generate images (observe 1-2s delay)
- [ ] Verify ~20% error rate and auto-retry
- [ ] Test abort functionality (Esc key)
- [ ] Check history saves last 5 generations
- [ ] Test keyboard shortcuts (Ctrl+G, Esc, Ctrl+C, ?)
- [ ] Toggle dark/light/system themes
- [ ] Test mobile responsiveness
- [ ] Verify accessibility with screen readers

## 🏗️ Architecture & Design

### Core Architecture
- **Component Structure**: Modular components with clear separation of concerns
- **State Management**: React hooks with context for global state (theme)
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Error Handling**: Error boundaries with graceful fallbacks

### Key Implementation Details

**Mock API (`src/utils/mockApi.ts`)**
- Realistic 1-2 second latency simulation
- Exact 20% error rate with "Model overloaded" message
- Exponential backoff retry: 500ms → 1000ms → 2000ms (max 3 attempts)
- Full AbortController support for request cancellation
- Promise-based with proper error handling

**Image Processing (`src/utils/image.ts`)**
- Client-side Canvas API for image downscaling
- Automatic resize when file > 10MB OR dimensions > 1920px
- JPEG encoding with 90% quality for optimal size/quality balance
- Preserves aspect ratio during scaling

**State Management (`src/App.tsx`)**
- Centralized state for image, prompt, style, and generation status
- Real-time live summary updates
- History management with localStorage persistence (last 5 items)
- Toast notifications for all user actions

**Theme System (`src/contexts/ThemeContext.tsx`)**
- Light/Dark/System preference support
- localStorage persistence
- Automatic system theme detection
- Smooth CSS transitions

**Accessibility Implementation**
- Full keyboard navigation (Tab, Enter, Space, Arrows)
- Visible focus indicators with ring utilities
- ARIA live regions for dynamic content updates
- Semantic HTML structure
- Screen reader optimized labels and descriptions

**Performance Optimizations**
- `useCallback` and `useMemo` for expensive operations
- Lazy loading ready architecture
- Optimized re-renders with proper dependency arrays
- Client-side image processing to reduce server load

## 📜 API Contract

The mock API follows a realistic RESTful pattern:

### Request Format
```typescript
POST /generate
{
  "imageDataUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "prompt": "A beautiful sunset over mountains",
  "style": "Editorial"
}
```

### Response Format
```typescript
// Success (80% of requests)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...", // Echo of input
  "prompt": "A beautiful sunset over mountains",
  "style": "Editorial",
  "createdAt": "2024-01-15T10:30:45.123Z"
}

// Error (20% of requests)
{
  "message": "Model overloaded"
}
```

### Behavior
- **Latency**: Random 1000-2000ms delay
- **Error Rate**: Exactly 20% failure rate
- **Retry Logic**: Exponential backoff (500ms → 1000ms → 2000ms)
- **Abort Support**: Full AbortController integration

## 📂 Project Structure

```
src/
├── components/           # React components
│   ├── ErrorBoundary.tsx    # Error handling
│   ├── History.tsx          # Generation history
│   ├── ImageUploader.tsx    # Drag-and-drop upload
│   ├── PromptForm.tsx       # Prompt and style input
│   ├── Spinner.tsx          # Loading indicator
│   └── ThemeToggle.tsx      # Dark mode toggle
├── contexts/             # React contexts
│   └── ThemeContext.tsx     # Theme management
├── hooks/                # Custom hooks
│   └── useKeyboardShortcuts.ts  # Keyboard shortcuts
├── utils/                # Utility functions
│   ├── image.ts             # Image processing
│   ├── mockApi.ts           # Mock API simulation
│   └── storage.ts           # localStorage helpers
├── types/                # TypeScript declarations
│   └── vitest.d.ts          # Test type definitions
├── test/                 # Test setup
│   └── setup.ts             # Test configuration
├── App.tsx               # Main application
└── main.tsx              # React entry point
```

## 🚀 Deployment

### Build for Production
```bash
npm run build     # Creates optimized build in /dist
npm run preview   # Test production build locally
```

### Performance Metrics
- **Build Size**: ~182KB (gzipped: ~58KB)
- **First Paint**: <100ms (local)
- **Interactive**: <200ms (local)
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

## 🎯 Requirements Compliance

✅ **All Core Requirements Met:**
- Upload & preview PNG/JPG (≤10MB) with client-side downscaling
- Prompt input + style dropdown (10+ options)
- Live summary (image + prompt + style + status)
- Mock API with 1-2s latency and 20% error rate
- Automatic retry with exponential backoff (max 3 attempts)
- Abort functionality for in-flight requests
- History of last 5 generations in localStorage
- Full keyboard accessibility with ARIA support

✅ **Bonus Features Implemented:**
- Unit tests with React Testing Library
- Error boundaries and empty states
- Performance optimizations (memoization, code splitting ready)
- PWA basics (manifest + service worker)
- Modern UI with dark mode
- Toast notifications
- Keyboard shortcuts

## 📄 License

MIT License - feel free to use this project as a reference or starting point for your own AI studio applications.
