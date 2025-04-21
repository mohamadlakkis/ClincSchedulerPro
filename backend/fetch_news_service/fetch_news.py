from newsapi import NewsApiClient
import os
from fastapi import HTTPException


NEWS_API_KEY = os.getenv("NEWSAPI_KEY")
newsapi = NewsApiClient(api_key=NEWS_API_KEY) 

def fetch_articles(query: str, page_size: int = 10):
    """Helper to fetch articles matching `query`."""
    response = newsapi.get_everything(
        q=query,
        language="en",
        sort_by="publishedAt",
        page_size=page_size
    )
    if response.get("status") != "ok":
        raise HTTPException(status_code=502, detail="Failed to fetch news")
    return [
        {
            "title": art["title"],
            "url": art["url"],
            "description": art.get("description") # snippet of the arctilce 
        }
        for art in response.get("articles", [])
    ]
