#!/usr/bin/env python3
"""Check Reddit threads for replies to our comments. Shows FULL content (no truncation)."""

import xml.etree.ElementTree as ET
import re
import html
import sys
import subprocess
from pathlib import Path

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
USERNAME = "Dear_Potato8535"
STATE_FILE = Path(__file__).resolve().parents[1] / "docs/agent-context/project_backlinks_session_state.md"

def fetch_and_parse_comments():
    """Fetch our recent comments via RSS."""
    rss_file = "/tmp/potato_comments_full.rss"
    subprocess.run(
        ["curl", "-sSL", "-A", UA, "-o", rss_file,
         f"https://www.reddit.com/user/{USERNAME}/comments/.rss"],
        check=True
    )
    
    ns = {"a": "http://www.w3.org/2005/Atom"}
    tree = ET.parse(rss_file)
    root = tree.getroot()
    
    comments = []
    for entry in root.findall("a:entry", ns):
        title = entry.find("a:title", ns).text if entry.find("a:title", ns) is not None else ""
        link = entry.find("a:link", ns).get("href") if entry.find("a:link", ns) is not None else ""
        updated = entry.find("a:updated", ns).text if entry.find("a:updated", ns) is not None else ""
        content_el = entry.find("a:content", ns)
        content_text = ""
        if content_el is not None and content_el.text:
            content_text = re.sub(r"<[^>]+>", "", html.unescape(content_el.text))
        comments.append({
            "title": title,
            "link": link,
            "updated": updated,
            "content": content_text
        })
    return comments


def extract_thread_id(comment_link):
    """Extract thread ID from comment URL like .../comments/1tej6fb/..."""
    match = re.search(r"/comments/([a-z0-9]+)/", comment_link)
    return match.group(1) if match else None


def tracked_thread_ids():
    """Load thread IDs archived in session state so older replies are not missed."""
    if not STATE_FILE.exists():
        return set()
    return set(re.findall(r"reddit\.com/r/[^/\s]+/comments/([a-z0-9]+)/", STATE_FILE.read_text()))


def fetch_thread_replies(thread_id):
    """Fetch all comments in a thread, return full content."""
    rss_file = f"/tmp/thread_{thread_id}_full.rss"
    subprocess.run(
        ["curl", "-sSL", "-A", UA, "-o", rss_file,
         f"https://www.reddit.com/comments/{thread_id}.rss"],
        check=True
    )
    
    ns = {"a": "http://www.w3.org/2005/Atom"}
    tree = ET.parse(rss_file)
    root = tree.getroot()
    
    entries = []
    for entry in root.findall("a:entry", ns):
        author_el = entry.find("a:author", ns)
        author_name = author_el.find("a:name", ns).text if author_el is not None and author_el.find("a:name", ns) is not None else ""
        content_el = entry.find("a:content", ns)
        content_text = ""
        if content_el is not None and content_el.text:
            content_text = re.sub(r"<[^>]+>", "", html.unescape(content_el.text))
        link = entry.find("a:link", ns).get("href") if entry.find("a:link", ns) is not None else ""
        updated = entry.find("a:updated", ns).text if entry.find("a:updated", ns) is not None else ""
        entries.append({
            "author": author_name,
            "content": content_text,
            "link": link,
            "updated": updated
        })
    return entries


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "replies"
    
    if mode == "comments":
        # Just list our recent comments with full content
        comments = fetch_and_parse_comments()
        for c in comments[:15]:
            print(f"DATE: {c['updated'][:16]}")
            print(f"TITLE: {c['title']}")
            print(f"URL: {c['link']}")
            print(f"CONTENT: {c['content']}")
            print()
    elif mode == "replies":
        # Check for replies in threads we commented on
        comments = fetch_and_parse_comments()
        
        # Combine recent RSS comments with archived published-thread tracking.
        thread_ids = tracked_thread_ids()
        for c in comments[:15]:
            tid = extract_thread_id(c["link"])
            if tid:
                thread_ids.add(tid)
        
        print(f"Checking {len(thread_ids)} tracked threads for replies...\n")
        
        for tid in sorted(thread_ids):
            entries = fetch_thread_replies(tid)
            if not any(USERNAME in e["author"] for e in entries):
                continue
            print(f"{'='*60}")
            print(f"THREAD: {tid}")
            print(f"{'='*60}")

            for e in entries:
                is_ours = USERNAME in e["author"]
                marker = ">>> OURS" if is_ours else "    OTHER"
                print(f"\n{marker} | {e['author']} | {e['updated'][:16]}")
                print(f"  URL: {e['link']}")
                print(f"  {e['content']}")  # FULL content, no truncation
            print()
    elif mode == "thread":
        # Check a specific thread by ID
        if len(sys.argv) < 3:
            print("Usage: python3 reddit_replies.py thread <thread_id>")
            sys.exit(1)
        tid = sys.argv[2]
        entries = fetch_thread_replies(tid)
        for e in entries:
            is_ours = USERNAME in e["author"]
            marker = ">>> OURS" if is_ours else "    OTHER"
            print(f"\n{marker} | {e['author']} | {e['updated'][:16]}")
            print(f"  URL: {e['link']}")
            print(f"  {e['content']}")
    else:
        print(f"Unknown mode: {mode}")
        print("Usage: python3 reddit_replies.py [comments|replies|thread <id>]")
        sys.exit(1)


if __name__ == "__main__":
    main()
