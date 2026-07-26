"""Base scraper class and shared utilities."""
import os
import time
import logging
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ua = UserAgent()

HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-CA,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}


@dataclass
class ScholarshipRecord:
    name: str
    provider: str
    description: str
    url: str
    source_domain: str
    levels: list[str]          # high_school | diploma | undergraduate | masters | phd
    categories: list[str]      # international | permanent_resident | citizen | all
    eligibility_criteria: list[str] = field(default_factory=list)
    university: Optional[str] = None
    deadline: Optional[str] = None          # ISO date string YYYY-MM-DD
    deadline_display: Optional[str] = None  # human-readable e.g. "January 15, 2026"
    amount: Optional[str] = None
    province: Optional[str] = None
    is_ra_ta: bool = False
    page_last_updated: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "provider": self.provider,
            "university": self.university,
            "description": self.description,
            "eligibility_criteria": self.eligibility_criteria,
            "deadline": self.deadline,
            "deadline_display": self.deadline_display,
            "amount": self.amount,
            "url": self.url,
            "source_domain": self.source_domain,
            "levels": self.levels,
            "categories": self.categories,
            "province": self.province,
            "is_ra_ta": self.is_ra_ta,
            "page_last_updated": self.page_last_updated,
            "is_active": True,
        }


def get_page(url: str, delay: float = 1.5) -> Optional[BeautifulSoup]:
    """Fetch a URL and return a BeautifulSoup object, or None on failure."""
    time.sleep(delay)
    try:
        headers = {**HEADERS, "User-Agent": ua.random}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "lxml")
    except Exception as e:
        logger.warning(f"Failed to fetch {url}: {e}")
        return None


class BaseScraper:
    name: str = "base"
    source_domain: str = ""

    def scrape(self) -> list[ScholarshipRecord]:
        raise NotImplementedError
