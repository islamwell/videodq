import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Playlist from '@/models/Playlist';
import { serializeDocuments, serializeDocument } from '@/lib/serialize';

export async function GET() {
  await connectDB();

  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 }).populate('videoIds');
    return NextResponse.json({ success: true, data: serializeDocuments(playlists) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch playlists' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const playlist = await Playlist.create(body);
    return NextResponse.json({ success: true, data: serializeDocument(playlist) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create playlist' },
      { status: 400 },
    );
  }
}
