"""Scrapers for major Canadian university scholarship pages."""
import re
import logging
from urllib.parse import urljoin
from scraper.base import BaseScraper, ScholarshipRecord, get_page

logger = logging.getLogger(__name__)

UNIVERSITIES = [
    {
        "name": "University of Toronto",
        "url": "https://future.utoronto.ca/finances/awards/",
        "domain": "utoronto.ca",
        "province": "Ontario",
    },
    {
        "name": "University of British Columbia",
        "url": "https://students.ubc.ca/enrolment/finances/award-search/",
        "domain": "ubc.ca",
        "province": "British Columbia",
    },
    {
        "name": "McGill University",
        "url": "https://www.mcgill.ca/studentaid/scholarships-bursaries",
        "domain": "mcgill.ca",
        "province": "Quebec",
    },
    {
        "name": "University of Alberta",
        "url": "https://www.ualberta.ca/en/admissions/scholarships-awards-bursaries/index.html",
        "domain": "ualberta.ca",
        "province": "Alberta",
    },
    {
        "name": "University of Waterloo",
        "url": "https://uwaterloo.ca/undergraduate-entrance-awards/awards",
        "domain": "uwaterloo.ca",
        "province": "Ontario",
    },
    {
        "name": "McMaster University",
        "url": "https://sfas.mcmaster.ca/awards/",
        "domain": "mcmaster.ca",
        "province": "Ontario",
    },
    {
        "name": "University of Calgary",
        "url": "https://www.ucalgary.ca/registrar/finances/awards",
        "domain": "ucalgary.ca",
        "province": "Alberta",
    },
    {
        "name": "Simon Fraser University",
        "url": "https://www.sfu.ca/students/financialaid/awards.html",
        "domain": "sfu.ca",
        "province": "British Columbia",
    },
]


def extract_amount(text: str) -> str | None:
    match = re.search(r"\$[\d,]+(?:\.\d{2})?(?:\s*/\s*year)?", text)
    return match.group(0) if match else None


def extract_deadline(text: str) -> str | None:
    patterns = [
        r"(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}",
        r"\d{1,2}[/-]\d{1,2}[/-]\d{4}",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return match.group(0)
    return None


def infer_levels(text: str) -> list[str]:
    t = text.lower()
    levels = []
    if any(w in t for w in ["undergraduate", "bachelor", "first year", "second year"]):
        levels.append("undergraduate")
    if any(w in t for w in ["graduate", "master", "msc", "ma ", "phd", "doctoral", "postgrad"]):
        levels.append("masters")
    if "phd" in t or "doctoral" in t:
        if "phd" not in levels:
            levels.append("phd")
    if any(w in t for w in ["high school", "secondary", "grade 12"]):
        levels.append("high_school")
    return levels or ["undergraduate"]


def infer_categories(text: str) -> list[str]:
    t = text.lower()
    cats = []
    if "international" in t or "foreign" in t or "visa" in t:
        cats.append("international")
    if "permanent resident" in t:
        cats.append("permanent_resident")
    if "canadian citizen" in t or "citizenship" in t:
        cats.append("citizen")
    return cats or ["all"]


class UniversityScraper(BaseScraper):
    name = "universities"

    def scrape(self) -> list[ScholarshipRecord]:
        results: list[ScholarshipRecord] = []

        for uni in UNIVERSITIES:
            logger.info(f"Scraping {uni['name']}...")
            soup = get_page(uni["url"], delay=2.5)

            if soup is None:
                logger.warning(f"Could not reach {uni['name']}")
                continue

            scholarships = self._extract_scholarships(soup, uni)
            logger.info(f"  Found {len(scholarships)} scholarships at {uni['name']}")
            results.extend(scholarships)

        return results

    def _extract_scholarships(self, soup, uni: dict) -> list[ScholarshipRecord]:
        records = []

        # Look for list items, headings, or table rows that describe awards
        selectors = [
            "li.award, li.scholarship, li.bursary",
            "tr.award, tr.scholarship",
            "div.award, div.scholarship, div.bursary",
            "article",
        ]

        items = []
        for sel in selectors:
            items = soup.select(sel)
            if items:
                break

        # Fallback: grab all <h3> / <h4> as scholarship names with surrounding text
        if not items:
            headings = soup.find_all(["h3", "h4"], limit=50)
            for h in headings:
                text = h.get_text(strip=True)
                if len(text) < 10 or len(text) > 200:
                    continue

                # get surrounding paragraph
                sibling = h.find_next_sibling(["p", "div", "ul"])
                description = sibling.get_text(" ", strip=True)[:400] if sibling else ""

                # find a link
                link = h.find("a") or h.find_next("a")
                url = urljoin(uni["url"], link.get("href", "")) if link else uni["url"]

                full_text = text + " " + description
                amount = extract_amount(full_text)
                deadline_display = extract_deadline(full_text)

                records.append(ScholarshipRecord(
                    name=text,
                    provider=uni["name"],
                    university=uni["name"],
                    description=description,
                    url=url,
                    source_domain=uni["domain"],
                    levels=infer_levels(full_text),
                    categories=infer_categories(full_text),
                    amount=amount,
                    deadline_display=deadline_display,
                    province=uni.get("province"),
                    eligibility_criteria=[],
                ))
            return records

        for item in items:
            try:
                title_el = item.find(["h2", "h3", "h4", "a", "strong"])
                if not title_el:
                    continue
                name = title_el.get_text(strip=True)
                if len(name) < 5:
                    continue

                link = item.find("a")
                url = urljoin(uni["url"], link.get("href", "")) if link else uni["url"]

                full_text = item.get_text(" ", strip=True)
                amount = extract_amount(full_text)
                deadline_display = extract_deadline(full_text)

                records.append(ScholarshipRecord(
                    name=name,
                    provider=uni["name"],
                    university=uni["name"],
                    description=full_text[:400],
                    url=url,
                    source_domain=uni["domain"],
                    levels=infer_levels(full_text),
                    categories=infer_categories(full_text),
                    amount=amount,
                    deadline_display=deadline_display,
                    province=uni.get("province"),
                    eligibility_criteria=[],
                ))
            except Exception as e:
                logger.warning(f"Error parsing item from {uni['name']}: {e}")

        return records
