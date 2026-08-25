'use client';

import * as React from 'react';

// This replaces the ENTIRE root layout (including <html>/<body>) when the root layout itself
// throws — Providers/LocaleProvider won't be mounted, so this can't use useLocale() or any
// app context. Kept intentionally plain and dependency-free.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#f5f6f5',
          color: '#1a2421',
        }}
      >
        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Something went wrong</div>
        <p style={{ maxWidth: '24rem', fontSize: '0.875rem', color: '#6b7570' }}>
          An unexpected error occurred while loading the app. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            height: '2.25rem',
            padding: '0 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: '#0f3d33',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
