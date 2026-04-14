import os
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import pytubefix
from pytubefix import Playlist, YouTube
import re

app = Flask(__name__)
CORS(app)

def extract_video_id(url):
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)',
        r'^([a-zA-Z0-9_-]{11})$',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            if len(video_id) == 11:
                return video_id
    return None

def get_video_info(yt):
    video_details = {
        'id': yt.video_id,
        'title': yt.title,
        'author': yt.author,
        'channel_url': yt.channel_url,
        'length': yt.length,
        'views': yt.views,
        'description': yt.description,
        'publish_date': str(yt.publish_date) if yt.publish_date else None,
        'thumbnail_url': yt.thumbnail_url,
        'rating': yt.rating,
    }
    return video_details

def get_available_resolutions(yt):
    streams = yt.streams.filter(progressive=True)
    resolutions = []
    for stream in streams:
        res = stream.resolution
        if res and res not in resolutions:
            resolutions.append(res)
    return sorted(resolutions, key=lambda x: int(x.replace('p', '')) if x else 0, reverse=True)

def get_available_formats(yt):
    streams = yt.streams.all()
    formats = []
    for stream in streams:
        fmt = {
            'itag': stream.itag,
            'mime_type': stream.mime_type,
            'resolution': stream.resolution,
            'fps': stream.fps,
            'vcodec': stream.codecs[0] if stream.codecs else None,
            'acodec': stream.codecs[1] if len(stream.codecs) > 1 else None,
            'filesize': stream.filesize,
            'filesize_mb': round(stream.filesize / (1024 * 1024), 2) if stream.filesize else None,
        }
        formats.append(fmt)
    return formats[:20]

@app.route('/video_info', methods=['POST'])
def video_info():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({'error': 'Invalid YouTube URL'}), 400
    
    try:
        yt = YouTube(url)
        info = get_video_info(yt)
        info['available_resolutions'] = get_available_resolutions(yt)
        info['available_formats'] = get_available_formats(yt)
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/available_resolutions', methods=['POST'])
def available_resolutions():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        yt = YouTube(url)
        resolutions = get_available_resolutions(yt)
        return jsonify({'resolutions': resolutions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def download_video():
    data = request.get_json()
    url = data.get('url')
    resolution = data.get('resolution', '1080p')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        yt = YouTube(url)
        
        streams = yt.streams.filter(progressive=True)
        stream = streams.filter(resolution=resolution).first()
        
        if not stream:
            stream = streams.filter(resolution='720p').first()
        
        if not stream:
            stream = streams.first()
        
        if not stream:
            return jsonify({'error': 'No suitable format found'}), 400
        
        title = yt.title.replace('/', '_').replace('\\', '_')
        filename = f"{title}.{stream.subtype}"
        
        temp_path = stream.download(filename=filename)
        
        def generate():
            with open(temp_path, 'rb') as f:
                while True:
                    chunk = f.read(8192)
                    if not chunk:
                        break
                    yield chunk
            os.remove(temp_path)
        
        return Response(
            generate(),
            mimetype=stream.mime_type,
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Type': stream.mime_type,
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download_audio', methods=['POST'])
def download_audio():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        yt = YouTube(url)
        
        audio_stream = yt.streams.filter(only_audio=True).first()
        
        if not audio_stream:
            return jsonify({'error': 'No audio format found'}), 400
        
        title = yt.title.replace('/', '_').replace('\\', '_')
        filename = f"{title}.mp3"
        
        temp_path = audio_stream.download(filename=filename)
        
        def generate():
            with open(temp_path, 'rb') as f:
                while True:
                    chunk = f.read(8192)
                    if not chunk:
                        break
                    yield chunk
            os.remove(temp_path)
        
        return Response(
            generate(),
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return jsonify({
        'name': 'YouTube Video Downloader API',
        'endpoints': {
            '/video_info': 'POST - Get video information',
            '/available_resolutions': 'POST - Get available resolutions',
            '/download': 'POST - Download video',
            '/download_audio': 'POST - Download audio',
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)