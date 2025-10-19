import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Video from '@/models/Video';
import { serializeDocument } from '@/lib/serialize';

type VideoRouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: VideoRouteContext) {
  const { id } = await context.params;
  await connectDB();

  try {
    const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeDocument(video) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch video' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: VideoRouteContext) {
  const { id } = await context.params;
  await connectDB();

  try {
    const body = await req.json();
    const video = await Video.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeDocument(video) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update video' },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: NextRequest, context: VideoRouteContext) {
  const { id } = await context.params;
  await connectDB();

  try {
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 },
    );
  }
}
