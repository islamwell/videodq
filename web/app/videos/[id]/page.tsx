'use client';

import { useVideo } from '../../hooks/useVideos';
import { VideoPlayer } from '../../components/VideoPlayer';
import { useParams } from 'next/navigation';

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const { data, isLoading, error } = useVideo(videoId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Video
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Video not found or failed to load
          </p>
        </div>
      </div>
    );
  }

  const video = data.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <VideoPlayer videoUrl={video.url} thumbnailUrl={video.thumbnail} />
        
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {video.title}
          </h1>
          
          {video.speaker && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Speaker: {video.speaker}
            </p>
          )}
          
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{video.views || 0} views</span>
            {video.category && <span>• {video.category}</span>}
          </div>
          
          {video.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
          
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
