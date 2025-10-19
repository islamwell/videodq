'use client';

import React from 'react';
import Link from 'next/link';
import { Video } from '../services/api';

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/videos/${video._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          {video.thumbnail ? (
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              No Thumbnail
            </div>
          )}
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.title}
          </h3>
          {video.speaker && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {video.speaker}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {video.views || 0} views
          </p>
        </div>
      </div>
    </Link>
  );
};
