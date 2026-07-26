"""
FundMyDegree — Main Scraper
Run: python -m scraper.main

Requires env vars:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""
import os
import sys
import time
import logging
from datetime import datetime

from supabase import create_client, Client
from scraper.scrapers import ALL_SCRAPERS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise EnvironmentError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
            "Copy .env.local.example to .env.local and fill in the values."
        )
    return create_client(url, key)


def upsert_scholarships(client: Client, records: list[dict]) -> tuple[int, int, list[str]]:
    """Upsert scholarships by URL. Returns (added, updated, errors)."""
    added = 0
    updated = 0
    errors: list[str] = []

    for record in records:
        try:
            record["last_scraped_at"] = datetime.utcnow().isoformat()

            # check if exists
            existing = client.table("scholarships").select("id, last_scraped_at").eq("url", record["url"]).execute()

            if existing.data:
                client.table("scholarships").update(record).eq("url", record["url"]).execute()
                updated += 1
            else:
                client.table("scholarships").insert(record).execute()
                added += 1

        except Exception as e:
            error_msg = f"Error upserting {record.get('url', '?')}: {e}"
            logger.error(error_msg)
            errors.append(error_msg)

    return added, updated, errors


def log_run(client: Client, source: str, added: int, updated: int, removed: int, errors: list[str], duration: float):
    try:
        client.table("scrape_logs").insert({
            "source": source,
            "added": added,
            "updated": updated,
            "removed": removed,
            "errors": errors[:10],  # cap at 10
            "duration_s": round(duration, 2),
        }).execute()
    except Exception as e:
        logger.warning(f"Could not write scrape log: {e}")


def main():
    logger.info("=== FundMyDegree Scraper Starting ===")
    client = get_supabase()

    total_added = 0
    total_updated = 0
    total_errors: list[str] = []

    for ScraperClass in ALL_SCRAPERS:
        scraper = ScraperClass()
        logger.info(f"\n--- Running scraper: {scraper.name} ---")
        start = time.time()

        try:
            records = scraper.scrape()
            logger.info(f"Scraped {len(records)} records from {scraper.name}")

            dicts = [r.to_dict() for r in records]
            added, updated, errors = upsert_scholarships(client, dicts)
            duration = time.time() - start

            total_added += added
            total_updated += updated
            total_errors.extend(errors)

            logger.info(f"  Added: {added}, Updated: {updated}, Errors: {len(errors)}")
            log_run(client, scraper.name, added, updated, 0, errors, duration)

        except Exception as e:
            logger.error(f"Scraper {scraper.name} failed: {e}")
            total_errors.append(str(e))

    logger.info(f"\n=== Done. Total added: {total_added}, updated: {total_updated}, errors: {len(total_errors)} ===")

    if total_errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
