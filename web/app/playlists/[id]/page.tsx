import React from 'react';
import Link from 'next/link';

export default function PlaylistRedirect() {
  // Simple fallback page for dynamic playlist route – link to the DQ2024 static playlist
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Playlists</h2>
      <p className="mb-4">Open the Ramadan playlist:</p>
      <Link href="/playlists/dq2024" className="px-4 py-2 rounded bg-blue-600 text-white">Open DQ2024</Link>
    </div>
  );
}

// For static export: this dynamic route doesn't pre-render any params.
export async function generateStaticParams() {
  // Pre-render the known static playlist used as a fallback / canonical Ramadan playlist
  return [
    {
      id: 'dq2024',
    },
  ];
}
