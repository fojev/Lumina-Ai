import os
from googleapiclient.discovery import build

def get_youtube_videos(query, max_results=5):
    api_key = os.environ.get('YOUTUBE_API_KEY')
    if not api_key:
        return [{"error": "YouTube API Key not configured"}]
        
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    try:
        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            maxResults=max_results
        )
        response = request.execute()
        
        videos = []
        for item in response.get('items', []):
            videos.append({
                'title': item['snippet']['title'],
                'thumbnail': item['snippet']['thumbnails']['high']['url'],
                'link': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'channel': item['snippet']['channelTitle']
            })
        return videos
    except Exception as e:
        return [{"error": str(e)}]
