"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { useState } from 'react';
import Framework7 from 'framework7/lite-bundle';
import Framework7React from 'framework7-react';
import { App as Framework7App, Views, View } from 'framework7-react';

// Ensure Framework7 React components register themselves with the core library
Framework7.use(Framework7React);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head>
        <title>NurulQuran Video - Islamic Educational Videos</title>
        <meta name="description" content="Islamic educational video platform for lectures and Islamic content" />
        <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#2563eb" />
  <link rel="stylesheet" href="https://unpkg.com/framework7/framework7-bundle.min.css" />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Framework7App>
              <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Views>
                    <View main>
                      {children}
                    </View>
                  </Views>
                </main>
              </div>
            </Framework7App>
          </ThemeProvider>
        </QueryClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').then(function(reg) { console.log('Service worker registered.', reg); }).catch(function(err) { console.log('Service worker registration failed:', err); }); }); }`
          }}
        />
      </body>
    </html>
  );
}
