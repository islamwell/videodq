import { VideoPlayer } from '../../components/VideoPlayer';
import connectDB from '@/lib/mongoose';
import Video from '@/models/Video';
import type { VideoDocument } from '@/models/Video';
import { serializeDocument } from '@/lib/serialize';

type Props = { params: Promise<{ id: string }> };

type VideoData = {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  speaker: string;
  category: string;
  tags: string[];
  views: number;
  createdAt?: string;
  updatedAt?: string;
};

async function fetchVideo(id: string): Promise<VideoData | null> {
  await connectDB();
  const video = await Video.findById(id);
  if (!video) return null;
  const serialized = serializeDocument(video as VideoDocument) as Record<string, unknown>;
  return {
    _id: serialized._id as string,
    title: (serialized.title as string) ?? '',
    description: (serialized.description as string) ?? '',
    url: (serialized.url as string) ?? '',
    thumbnail: (serialized.thumbnail as string) ?? '',
    duration: Number(serialized.duration ?? 0),
    speaker: (serialized.speaker as string) ?? '',
    category: (serialized.category as string) ?? '',
    tags: (serialized.tags as string[]) ?? [],
    views: Number(serialized.views ?? 0),
    createdAt: serialized.createdAt as string | undefined,
    updatedAt: serialized.updatedAt as string | undefined,
  };
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const video = await fetchVideo(id);

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Video not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        {/* VideoPlayer is a client component */}
        <VideoPlayer videoUrl={video.url} thumbnailUrl={video.thumbnail} />

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{video.title}</h1>
          {video.speaker && <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Speaker: {video.speaker}</p>}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{video.views || 0} views</span>
            {video.category && <span>• {video.category}</span>}
          </div>

          {video.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{video.description}</p>
            </div>
          )}

          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
