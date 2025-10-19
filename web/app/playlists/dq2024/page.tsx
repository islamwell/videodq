"use client";

import React, { useEffect, useState } from 'react';
import { playlistService } from '../../services/api';
import { VideoCard } from '../../components/VideoCard';

export default function DQ2024Page() {
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await playlistService.getPlaylistBySlug('dq2024');
        setPlaylist(res.data);
      } catch (e) {
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">DQ2024 — Dura Quran 2024 (30 days)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">A 30-day Quran listening series for Ramadan 2024</p>

        {loading ? (
          <div className="py-20 flex items-center justify-center">Loading...</div>
        ) : !playlist ? (
          <div className="text-center py-20">Playlist not found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlist.videoIds.map((video:any) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
