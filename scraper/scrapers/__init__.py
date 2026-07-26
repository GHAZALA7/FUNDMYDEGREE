from .scholarships_canada import ScholarshipsCanadaScraper
from .universities import UniversityScraper
from .government import GovernmentScraper

ALL_SCRAPERS = [
    GovernmentScraper,
    UniversityScraper,
    ScholarshipsCanadaScraper,
]
