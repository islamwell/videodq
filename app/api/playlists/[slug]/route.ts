import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Playlist from '@/models/Playlist';
import { serializeDocument } from '@/lib/serialize';

type PlaylistRouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: PlaylistRouteContext) {
  const { slug } = await context.params;
  await connectDB();

  try {
    const playlist = await Playlist.findOne({ slug }).populate('videoIds');

    if (!playlist) {
      return NextResponse.json({ success: false, message: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeDocument(playlist) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch playlist' },
      { status: 500 },
    );
  }
}
