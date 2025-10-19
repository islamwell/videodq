# VideoDQ API Documentation

Base URL: `http://localhost:5000/api` (development)

## Endpoints

### Health Check

#### GET `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "VideoDQ API is running"
}
```

---

### Videos

#### GET `/videos`

Get all videos with optional filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in title, description, and speaker name
- `limit` (optional): Number of results per page (default: 50, max: 100)
- `skip` (optional): Number of results to skip for pagination (default: 0)

**Example Request:**
```bash
GET /api/videos?category=Quran&limit=10&skip=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Understanding the Quran",
      "description": "Learn about the structure, themes...",
      "url": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "duration": 1800,
      "speaker": "Dr. Fatima Rahman",
      "category": "Quran",
      "tags": ["quran", "tafsir", "understanding"],
      "views": 2100,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "skip": 0
}
```

#### GET `/videos/:id`

Get a specific video by ID. Automatically increments view count.

**Parameters:**
- `id`: Video ID (MongoDB ObjectId)

**Example Request:**
```bash
GET /api/videos/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Understanding the Quran",
    "description": "Learn about the structure, themes...",
    "url": "https://example.com/video.mp4",
    "thumbnail": "https://example.com/thumb.jpg",
    "duration": 1800,
    "speaker": "Dr. Fatima Rahman",
    "category": "Quran",
    "tags": ["quran", "tafsir", "understanding"],
    "views": 2101,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

#### POST `/videos`

Create a new video.

**Request Body:**
```json
{
  "title": "New Islamic Lecture",
  "description": "Description of the lecture",
  "url": "https://example.com/video.mp4",
  "thumbnail": "https://example.com/thumb.jpg",
  "duration": 1800,
  "speaker": "Sheikh Name",
  "category": "Islamic Studies",
  "tags": ["islam", "lecture", "education"]
}
```

**Required Fields:**
- `title` (String): Video title
- `url` (String): Video URL

**Optional Fields:**
- `description` (String): Video description
- `thumbnail` (String): Thumbnail image URL
- `duration` (Number): Video duration in seconds
- `speaker` (String): Speaker/lecturer name
- `category` (String): Video category
- `tags` (Array of Strings): Video tags

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "New Islamic Lecture",
    "description": "Description of the lecture",
    "url": "https://example.com/video.mp4",
    "thumbnail": "https://example.com/thumb.jpg",
    "duration": 1800,
    "speaker": "Sheikh Name",
    "category": "Islamic Studies",
    "tags": ["islam", "lecture", "education"],
    "views": 0,
    "createdAt": "2024-01-20T14:30:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Video validation failed: title: Path `title` is required."
}
```

#### PUT `/videos/:id`

Update an existing video.

**Parameters:**
- `id`: Video ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Updated Category"
}
```

Note: Include only the fields you want to update.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description",
    "url": "https://example.com/video.mp4",
    "thumbnail": "https://example.com/thumb.jpg",
    "duration": 1800,
    "speaker": "Dr. Fatima Rahman",
    "category": "Updated Category",
    "tags": ["quran", "tafsir", "understanding"],
    "views": 2101,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

#### DELETE `/videos/:id`

Delete a video.

**Parameters:**
- `id`: Video ID (MongoDB ObjectId)

**Example Request:**
```bash
DELETE /api/videos/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video not found"
}
```

#### GET `/videos/meta/categories`

Get list of all unique categories.

**Example Request:**
```bash
GET /api/videos/meta/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Islamic Studies",
    "Quran",
    "Seerah",
    "Fiqh",
    "Ethics",
    "History"
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error or invalid request data"
}
```

---

## Data Models

### Video Schema

```javascript
{
  _id: ObjectId,           // Auto-generated
  title: String,           // Required
  description: String,     // Default: ""
  url: String,             // Required
  thumbnail: String,       // Default: ""
  duration: Number,        // Default: 0 (in seconds)
  speaker: String,         // Default: ""
  category: String,        // Default: "General"
  tags: [String],          // Array of tags
  views: Number,           // Default: 0, auto-incremented on view
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-updated
}
```

---

## Rate Limiting

Currently not implemented. Consider implementing rate limiting in production to prevent abuse.

Recommended limits:
- 100 requests per minute per IP for GET requests
- 20 requests per minute per IP for POST/PUT/DELETE requests

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production:

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
};
```

---

## Authentication

Currently not implemented. For production, consider implementing:
- JWT-based authentication
- API key authentication
- OAuth 2.0

---

## Examples Using cURL

**Create a video:**
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "url": "https://example.com/video.mp4",
    "speaker": "Test Speaker",
    "category": "Test"
  }'
```

**Get all videos:**
```bash
curl http://localhost:5000/api/videos
```

**Search videos:**
```bash
curl "http://localhost:5000/api/videos?search=quran"
```

**Update a video:**
```bash
curl -X PUT http://localhost:5000/api/videos/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Delete a video:**
```bash
curl -X DELETE http://localhost:5000/api/videos/507f1f77bcf86cd799439011
```

---

## Future Enhancements

Potential API improvements:
- User authentication and authorization
- Video upload endpoint with file handling
- Video transcoding support
- Subtitle/caption management
- User playlists
- Comments and ratings
- Analytics and reporting
- Webhook notifications
- GraphQL API option
