#!/usr/bin/env python3
"""Polite crawler for seedlegals.com (Scrapy for crawling, BeautifulSoup for parsing).

Usage:
    pip install scrapy beautifulsoup4 lxml
    python scripts/crawl_seedlegals.py -o seedlegals.jsonl [--max-pages 500]

Respects robots.txt, throttles requests, stays on seedlegals.com.
"""
import argparse

import scrapy
from bs4 import BeautifulSoup
from scrapy.crawler import CrawlerProcess
from scrapy.linkextractors import LinkExtractor

SKIP_EXT = ["pdf", "zip", "png", "jpg", "jpeg", "gif", "svg", "webp", "mp4", "css", "js", "ico", "woff", "woff2"]


class SeedLegalsSpider(scrapy.Spider):
    name = "seedlegals"
    allowed_domains = ["seedlegals.com"]
    start_urls = ["https://seedlegals.com/"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extractor = LinkExtractor(
            allow_domains=self.allowed_domains, deny_extensions=SKIP_EXT, canonicalize=True
        )

    def parse(self, response):
        ctype = response.headers.get("Content-Type", b"").decode("latin-1")
        if "html" not in ctype:
            return
        soup = BeautifulSoup(response.text, "lxml")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        meta = soup.find("meta", attrs={"name": "description"})
        yield {
            "url": response.url,
            "status": response.status,
            "title": soup.title.get_text(strip=True) if soup.title else None,
            "meta_description": meta.get("content") if meta else None,
            "headings": {
                f"h{i}": [h.get_text(" ", strip=True) for h in soup.find_all(f"h{i}")]
                for i in (1, 2, 3)
            },
            "text": soup.get_text(" ", strip=True),
            "links": sorted({a["href"] for a in soup.find_all("a", href=True)}),
        }

        for link in self.extractor.extract_links(response):
            yield response.follow(link.url, callback=self.parse)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-o", "--output", default="seedlegals.jsonl")
    ap.add_argument("--max-pages", type=int, default=500, help="stop after N pages (0 = unlimited)")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between requests")
    args = ap.parse_args()

    process = CrawlerProcess(
        settings={
            "USER_AGENT": "seedlegals-research-crawler (+contact: davidthierryknox@gmail.com)",
            "ROBOTSTXT_OBEY": True,
            "DOWNLOAD_DELAY": args.delay,
            "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
            "AUTOTHROTTLE_ENABLED": True,
            "CLOSESPIDER_PAGECOUNT": args.max_pages,
            "DEPTH_LIMIT": 6,
            "FEEDS": {args.output: {"format": "jsonlines", "encoding": "utf8", "overwrite": True}},
            "LOG_LEVEL": "INFO",
        }
    )
    process.crawl(SeedLegalsSpider)
    process.start()


if __name__ == "__main__":
    main()
