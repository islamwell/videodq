import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Video from '@/models/Video';

export async function GET() {
  await connectDB();

  try {
    const categories = await Video.distinct('category');
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}
