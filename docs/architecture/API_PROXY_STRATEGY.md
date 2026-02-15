# Architecture: API Proxy Strategy

## 1. Problem Statement
In the GreenCity development environment:
- **Frontend** (Next.js) runs on `http://localhost:3000`.
- **Backend** (Express) runs on `http://localhost:5000`.

When the frontend attempts to make API calls using relative paths (e.g., `fetch('/api/onboarding/me')`), Next.js defaults to sending these requests to its own server (`localhost:3000`). Since the API routes exist on the Backend (`localhost:5000`), these requests result in **404 Not Found** errors.

## 2. Root Cause
Next.js App Router treats `/api/*` routes as internal API routes by default. It does not automatically know that a separate backend server exists on a different port. Without a proxy configuration, the browser resolves relative URLs against the current origin (`window.location.origin`), which is the frontend server.

## 3. Chosen Solution: Next.js Rewrite (Proxy)
We have implemented a **Next.js Rewrite** in `next.config.ts` to transparently proxy all `/api/*` requests to the backend.

### Configuration (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_BACKEND_API_URL || "http://localhost:5000"}/api/:path*`,
      },
    ];
  },
};
```

### How It Works
1.  Frontend code calls `fetch('/api/users')`.
2.  Request hits Next.js server (`localhost:3000`).
3.  Next.js matches the path `/api/users` against the rewrite rule.
4.  Next.js forwards the request to `http://localhost:5000/api/users`.
5.  Backend responds to Next.js.
6.  Next.js relays the response back to the browser.
7.  To the browser, it looks like the request was served by `localhost:3000`.

## 4. Why This Is Future-Proof
*   **Separation of Concerns**: The frontend code remains agnostic of the backend's actual location. It simply calls "its own" API.
*   **Production Parity**: In a production environment (e.g., Vercel, Nginx, Docker), we typically use a reverse proxy to route `/` to the frontend and `/api` to the backend. This rewrite mimics that behavior locally.
*   **CORS Avoidance**: Since the browser sees requests going to the same origin (`localhost:3000`), we generally avoid complex Cross-Origin Resource Sharing (CORS) configuration issues during development.

## 5. What NOT to Do (Anti-Patterns)
*   ❌ **Do NOT hardcode backend URLs**: Never use `fetch('http://localhost:5000/api/...')`. This breaks production builds.
*   ❌ **Do NOT use env vars for base URLs**: Avoid `fetch(${process.env.API_URL}/api/...)` in components. It makes the code brittle and dependent on client-side env var injection.
*   ❌ **Do NOT create duplicate routes**: Do not create Next.js API Routes (`app/api/route.ts`) that just manually fetch from the backend. Use the rewrite.

## 6. Developer Contract
> **Rule**: Frontend components must ALWAYS use relative paths for API calls.
>
> ✅ **Correct**: `fetch('/api/onboarding/data')`
>
> ❌ **Incorrect**: `fetch('http://localhost:5000/api/onboarding/data')`

**Routing to the correct backend service is the responsibility of the platform/infrastructure layer (Next.js config or Nginx), NOT the individual React component.**
