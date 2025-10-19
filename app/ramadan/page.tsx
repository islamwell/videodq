"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { playlistService } from '../services/api';

export default function RamadanPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await playlistService.getPlaylists();
        setPlaylists(res.data || []);
      } catch (e) {
        // fallback to static playlist if API fails
        setPlaylists([{ slug: 'dq2024', title: 'DQ2024 — Dura Quran 2024 (30 days)', description: 'A 30-day Quran listening series for Ramadan 2024', cover: '/ramadan-cover.jpg' }]);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ramadan</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Special Ramadan playlists and collections. Enjoy curated recitations and lectures for the month.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {playlists.map(pl => (
            <div key={pl.slug} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <img src={pl.cover || '/ramadan-cover.jpg'} alt={pl.title} className="w-full h-full object-cover"/>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{pl.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pl.description}</p>
                <Link href={`/playlists/${pl.slug}`} className="inline-block px-4 py-2 rounded bg-blue-600 text-white">Open Playlist</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
