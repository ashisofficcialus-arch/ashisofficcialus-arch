# YouTube Video Downloader API

This is a Flask-based Python API that uses pytubefix to download YouTube videos and get video information.

## Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On Mac/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the API:
```bash
python main.py
```

The API will run on `http://localhost:5000`

## API Endpoints

### Video Info
```bash
POST /video_info
{
  "url": "https://youtu.be/qEpbiHXDH5I"
}
```

### Download Video
```bash
POST /download
{
  "url": "https://youtu.be/qEpbiHXDH5I",
  "resolution": "1080p"
}
```

### Download Audio
```bash
POST /download_audio
{
  "url": "https://youtu.be/qEpbiHXDH5I"
}
```

## Environment Variables

If running the Next.js app separately, set:
```bash
PYTHON_API_URL=http://localhost:5000
```

## Deploy to Render/Railway

1. Create a new Web Service
2. Set root directory to `api`
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn main:app`
5. Add environment variable `PYTHON_API_URL` to your Next.js app