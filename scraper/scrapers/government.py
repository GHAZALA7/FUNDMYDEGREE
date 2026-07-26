"""Scraper for Government of Canada scholarship programs."""
import re
import logging
from urllib.parse import urljoin
from scraper.base import BaseScraper, ScholarshipRecord, get_page

logger = logging.getLogger(__name__)

GOVERNMENT_SOURCES = [
    {
        "name": "Government of Canada — Student Financial Assistance",
        "url": "https://www.canada.ca/en/services/benefits/education/student-aid.html",
        "domain": "canada.ca",
        "province": None,
    },
    {
        "name": "Vanier Canada Graduate Scholarships",
        "url": "https://vanier.gc.ca/en/home-accueil.html",
        "domain": "vanier.gc.ca",
        "province": None,
    },
    {
        "name": "Canada Graduate Scholarships — NSERC",
        "url": "https://www.nserc-crsng.gc.ca/Students-Etudiants/PG-CS/index_eng.asp",
        "domain": "nserc-crsng.gc.ca",
        "province": None,
    },
    {
        "name": "Ontario Student Assistance Program (OSAP)",
        "url": "https://www.ontario.ca/page/osap-ontario-student-assistance-program",
        "domain": "ontario.ca",
        "province": "Ontario",
    },
    {
        "name": "Alberta Student Aid",
        "url": "https://studentaid.alberta.ca/scholarships-and-awards/",
        "domain": "studentaid.alberta.ca",
        "province": "Alberta",
    },
    {
        "name": "StudentAid BC",
        "url": "https://studentaidbc.ca/explore/scholarships-and-grants",
        "domain": "studentaidbc.ca",
        "province": "British Columbia",
    },
]

# Known government scholarship programs as seed data
KNOWN_PROGRAMS = [
    ScholarshipRecord(
        name="Vanier Canada Graduate Scholarships",
        provider="Government of Canada",
        description="The Vanier CGS program aims to attract and retain world-class doctoral students by supporting students who demonstrate both leadership skills and a high standard of scholarly achievement in graduate studies.",
        eligibility_criteria=[
            "Must be a doctoral student (PhD or combined MA/PhD)",
            "Must be nominated by a Canadian university",
            "Canadian citizens, permanent residents, and foreign nationals are eligible",
            "Must demonstrate leadership and high scholarly achievement",
        ],
        url="https://vanier.gc.ca/en/home-accueil.html",
        source_domain="vanier.gc.ca",
        levels=["phd"],
        categories=["all"],
        amount="$50,000/year for 3 years",
        province=None,
        is_ra_ta=False,
        deadline_display="Early November (check website for exact date)",
    ),
    ScholarshipRecord(
        name="Canada Graduate Scholarships — Master's (CGS-M)",
        provider="NSERC / SSHRC / CIHR",
        description="The Canada Graduate Scholarships – Master's (CGS M) program provides financial support to high-calibre scholars who are engaged in master's-level studies in Canada.",
        eligibility_criteria=[
            "Must be a Canadian citizen or permanent resident",
            "Must be enrolled in a master's or combined bachelor's/master's program",
            "Must not hold or have held a doctoral-level scholarship from the program",
            "Minimum A- average in last two years of full-time study",
        ],
        url="https://www.nserc-crsng.gc.ca/Students-Etudiants/PG-CS/CGSM-BESCM_eng.asp",
        source_domain="nserc-crsng.gc.ca",
        levels=["masters"],
        categories=["citizen", "permanent_resident"],
        amount="$17,500 for 1 year",
        province=None,
        is_ra_ta=False,
        deadline_display="December (check NSERC website)",
    ),
    ScholarshipRecord(
        name="Canada Graduate Scholarships — Doctoral (CGS-D / PGS-D)",
        provider="NSERC / SSHRC / CIHR",
        description="The Canada Graduate Scholarships – Doctoral (CGS D) and Postgraduate Scholarships – Doctoral (PGS D) programs support Canadian citizens and permanent residents pursuing doctoral programs.",
        eligibility_criteria=[
            "Must be a Canadian citizen or permanent resident",
            "Must be registered or planning to register in a doctoral program",
            "Minimum A- average",
            "Demonstrated research potential",
        ],
        url="https://www.nserc-crsng.gc.ca/Students-Etudiants/PG-CS/CGSD-BESCD_eng.asp",
        source_domain="nserc-crsng.gc.ca",
        levels=["phd"],
        categories=["citizen", "permanent_resident"],
        amount="CGS-D: $35,000/year | PGS-D: $21,000/year",
        province=None,
        is_ra_ta=False,
        deadline_display="October (check NSERC website)",
    ),
    ScholarshipRecord(
        name="NSERC Undergraduate Student Research Awards (USRA)",
        provider="Natural Sciences and Engineering Research Council (NSERC)",
        description="USRAs are meant to stimulate interest in research in the natural sciences and engineering and encourage students to undertake graduate studies.",
        eligibility_criteria=[
            "Must be a Canadian citizen or permanent resident",
            "Must be a registered undergraduate student",
            "Must have obtained at least 70% average in last completed year",
            "Must not have completed more undergraduate credits than an Honours degree requires",
        ],
        url="https://www.nserc-crsng.gc.ca/Students-Etudiants/UG-PC/USRA-BRPC_eng.asp",
        source_domain="nserc-crsng.gc.ca",
        levels=["undergraduate"],
        categories=["citizen", "permanent_resident"],
        amount="$6,000 minimum for 16 weeks",
        province=None,
        is_ra_ta=True,
        deadline_display="Varies by university (typically Feb–March)",
    ),
]


class GovernmentScraper(BaseScraper):
    name = "government"
    source_domain = "canada.ca"

    def scrape(self) -> list[ScholarshipRecord]:
        results: list[ScholarshipRecord] = list(KNOWN_PROGRAMS)
        logger.info(f"Loaded {len(results)} known government programs")

        # Also try to scrape the Canada.ca scholarships page
        soup = get_page(GOVERNMENT_SOURCES[0]["url"], delay=2.0)
        if soup:
            links = soup.find_all("a", href=re.compile(r"scholar|bursary|award|grant|financial", re.I))
            for link in links[:20]:
                text = link.get_text(strip=True)
                href = link.get("href", "")
                if len(text) > 10 and "canada.ca" in href:
                    logger.info(f"  Found government program link: {text}")

        return results
