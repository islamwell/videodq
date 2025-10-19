import { Schema, model, models, Document, Types } from 'mongoose';

export interface PlaylistDocument extends Document {
  title: string;
  description: string;
  videoIds: Types.ObjectId[];
  slug: string;
  createdAt: Date;
}

const PlaylistSchema = new Schema<PlaylistDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoIds: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default models.Playlist || model<PlaylistDocument>('Playlist', PlaylistSchema);
