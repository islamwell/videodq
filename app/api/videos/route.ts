import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Video from '@/models/Video';
import { serializeDocuments, serializeDocument } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = Number.parseInt(searchParams.get('limit') ?? '50', 10);
  const skip = Number.parseInt(searchParams.get('skip') ?? '0', 10);

  const query: Record<string, unknown> = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .limit(Number.isNaN(limit) ? 50 : limit)
        .skip(Number.isNaN(skip) ? 0 : skip),
      Video.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: serializeDocuments(videos),
      total,
      limit: Number.isNaN(limit) ? 50 : limit,
      skip: Number.isNaN(skip) ? 0 : skip,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch videos' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const video = await Video.create(body);
    return NextResponse.json({ success: true, data: serializeDocument(video) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create video' },
      { status: 400 },
    );
  }
}
