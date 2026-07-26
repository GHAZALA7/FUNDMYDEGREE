"""Scraper for ScholarshipsCanada.com — one of the largest Canadian scholarship directories."""
import re
import logging
from urllib.parse import urljoin
from scraper.base import BaseScraper, ScholarshipRecord, get_page

logger = logging.getLogger(__name__)

BASE_URL = "https://www.scholarshipscanada.com"

LEVEL_MAP = {
    "high school": "high_school",
    "secondary school": "high_school",
    "college": "diploma",
    "diploma": "diploma",
    "undergraduate": "undergraduate",
    "bachelor": "undergraduate",
    "graduate": "masters",
    "master": "masters",
    "phd": "phd",
    "doctoral": "phd",
    "postgraduate": "phd",
}

CATEGORY_MAP = {
    "international": "international",
    "foreign": "international",
    "permanent resident": "permanent_resident",
    "canadian citizen": "citizen",
    "citizen": "citizen",
}


def infer_levels(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for keyword, level in LEVEL_MAP.items():
        if keyword in text_lower and level not in found:
            found.append(level)
    return found or ["undergraduate"]


def infer_categories(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for keyword, cat in CATEGORY_MAP.items():
        if keyword in text_lower and cat not in found:
            found.append(cat)
    # if no specific mention, assume open to all
    return found or ["all"]


class ScholarshipsCanadaScraper(BaseScraper):
    name = "scholarships_canada"
    source_domain = "scholarshipscanada.com"

    def scrape(self) -> list[ScholarshipRecord]:
        results: list[ScholarshipRecord] = []
        page = 1

        while True:
            url = f"{BASE_URL}/Scholarships/Search?Keywords=&Page={page}&PerPage=20"
            soup = get_page(url, delay=2.0)

            if soup is None:
                logger.warning(f"Failed to fetch page {page}, stopping.")
                break

            cards = soup.select(".scholarship-listing, .scholarship-item, article.scholarship")
            if not cards:
                # try alternative selectors
                cards = soup.select("[class*='scholarship']")

            if not cards:
                logger.info(f"No more listings found on page {page}.")
                break

            for card in cards:
                try:
                    record = self._parse_listing(card)
                    if record:
                        results.append(record)
                except Exception as e:
                    logger.warning(f"Error parsing card: {e}")

            logger.info(f"Page {page}: scraped {len(cards)} listings (total: {len(results)})")

            # stop after 50 pages to be respectful
            if page >= 50:
                break
            page += 1

        return results

    def _parse_listing(self, card) -> ScholarshipRecord | None:
        # title / link
        title_el = card.find("a", href=re.compile(r"/Scholarships/", re.I))
        if not title_el:
            return None

        name = title_el.get_text(strip=True)
        relative_url = title_el.get("href", "")
        url = urljoin(BASE_URL, relative_url)

        # provider
        provider_el = card.find(class_=re.compile(r"provider|sponsor|organization", re.I))
        provider = provider_el.get_text(strip=True) if provider_el else "Unknown Provider"

        # amount
        amount_el = card.find(string=re.compile(r"\$[\d,]+|\$[\d]+k", re.I))
        amount = amount_el.strip() if amount_el else None

        # deadline
        deadline_el = card.find(string=re.compile(r"deadline|due|closes?", re.I))
        deadline_display = None
        if deadline_el:
            parent = deadline_el.parent
            deadline_display = parent.get_text(strip=True) if parent else None

        # description / eligibility from the full text
        full_text = card.get_text(" ", strip=True)

        levels = infer_levels(full_text)
        categories = infer_categories(full_text)

        return ScholarshipRecord(
            name=name,
            provider=provider,
            description=full_text[:500],
            url=url,
            source_domain=self.source_domain,
            levels=levels,
            categories=categories,
            amount=amount,
            deadline_display=deadline_display,
            eligibility_criteria=[],
        )
