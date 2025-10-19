import { Schema, model, models, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';

export interface VideoDocument extends Document {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  speaker: string;
  category: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<VideoDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0,
    },
    speaker: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    tags: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

VideoSchema.pre<VideoDocument>('save', function save(next: CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

export default models.Video || model<VideoDocument>('Video', VideoSchema);
