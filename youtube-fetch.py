import feedparser
import json

CHANNEL_ID = "UC-kwgB_vfZlCtI_eXijNhMw"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"

feed = feedparser.parse(FEED_URL)

videos = []
for entry in feed.entries[:4]:  # latest 4
    video_id = entry['yt_videoid']
    videos.append({
        'title': entry['title'],
        'videoId': video_id,
        'link': entry['link'],
        'thumbnail': f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg",
        'pubDate': entry['published'],
    })

with open("src/services/youtube/card.json", "w", encoding="utf-8") as f:
    json.dump(videos, f, indent=2, ensure_ascii=False)

print("✅ YouTube JSON updated.")
