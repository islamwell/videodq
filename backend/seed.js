require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

const sampleVideos = [
  {
    title: 'Introduction to Islamic Studies',
    description: 'A comprehensive introduction to the fundamental concepts of Islamic studies and theology.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 596,
    speaker: 'Dr. Ahmed Hassan',
    category: 'Islamic Studies',
    tags: ['introduction', 'fundamentals', 'theology'],
    views: 1250
  },
  {
    title: 'The Life of Prophet Muhammad (PBUH)',
    description: 'An in-depth exploration of the life and teachings of Prophet Muhammad (peace be upon him).',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 654,
    speaker: 'Sheikh Ibrahim Ali',
    category: 'Seerah',
    tags: ['prophet', 'biography', 'history'],
    views: 3400
  },
  {
    title: 'Understanding the Quran',
    description: 'Learn about the structure, themes, and guidance found in the Holy Quran.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 15,
    speaker: 'Dr. Fatima Rahman',
    category: 'Quran',
    tags: ['quran', 'tafsir', 'understanding'],
    views: 2100
  },
  {
    title: 'Islamic Ethics and Morality',
    description: 'Exploring the ethical principles and moral values taught in Islam.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 15,
    speaker: 'Imam Yusuf Ahmad',
    category: 'Ethics',
    tags: ['ethics', 'morality', 'character'],
    views: 890
  },
  {
    title: 'The Five Pillars of Islam',
    description: 'A detailed explanation of the five fundamental practices of Islam.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 15,
    speaker: 'Sheikh Omar Suleiman',
    category: 'Fiqh',
    tags: ['pillars', 'prayer', 'zakah', 'fasting', 'hajj'],
    views: 4560
  },
  {
    title: 'Islamic History and Civilization',
    description: 'Journey through the rich history of Islamic civilization and its contributions to humanity.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1200px-HD_transparent_picture.png',
    duration: 15,
    speaker: 'Dr. Hassan Mahmoud',
    category: 'History',
    tags: ['history', 'civilization', 'culture'],
    views: 1670
  }
];

const Playlist = require('./src/models/Playlist');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videodq');
    console.log('Connected to MongoDB');

    // Clear existing videos
    await Video.deleteMany({});
    console.log('Cleared existing videos');

    // Insert sample videos
    await Video.insertMany(sampleVideos);
    console.log(`Inserted ${sampleVideos.length} sample videos`);

    // Create or update Ramadan playlist (dq2024) referencing quran videos
    const quranVideos = await Video.find({ $or: [{ tags: 'quran' }, { title: /quran/i }] });
    const videoIds = quranVideos.map(v => v._id);

    await Playlist.findOneAndUpdate(
      { slug: 'dq2024' },
      {
        title: 'DQ2024 — Dura Quran 2024 (30 days)',
        description: 'A 30-day Quran listening series for Ramadan 2024',
        videoIds,
        slug: 'dq2024'
      },
      { upsert: true, new: true }
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
