'use client';

import { useVideos } from './hooks/useVideos';
import { VideoCard } from './components/VideoCard';

export default function Home() {
  const { data, isLoading, error } = useVideos();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Videos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please check if the API server is running
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Islamic Lectures
        </h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              No videos available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
