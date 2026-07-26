from .scholarships_canada import ScholarshipsCanadaScraper
from .universities import UniversityScraper
from .government import GovernmentScraper
from .seed import SeedScraper

ALL_SCRAPERS = [
    SeedScraper,
    GovernmentScraper,
    UniversityScraper,
    ScholarshipsCanadaScraper,
]
