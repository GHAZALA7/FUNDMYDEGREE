"""
FundMyDegree — Monthly Cleanup Job
Marks expired scholarships as inactive.
Run: python -m scraper.cleanup

Requires env vars:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""
import os
import logging
import requests
from datetime import date, datetime

from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def get_supabase():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise EnvironmentError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    return create_client(url, key)


def check_url_alive(url: str) -> bool:
    """Return True if the URL responds with a 2xx or 3xx status."""
    try:
        resp = requests.head(url, timeout=10, allow_redirects=True, headers={"User-Agent": "FundMyDegree-Bot/1.0"})
        return resp.status_code < 400
    except Exception:
        return False


def main():
    logger.info("=== FundMyDegree Cleanup Starting ===")
    client = get_supabase()
    today = date.today().isoformat()

    # 1. Mark past-deadline scholarships as inactive
    logger.info("Step 1: Marking expired scholarships as inactive...")
    result = (
        client.table("scholarships")
        .update({"is_active": False})
        .eq("is_active", True)
        .lt("deadline", today)
        .execute()
    )
    expired_count = len(result.data) if result.data else 0
    logger.info(f"  Marked {expired_count} expired scholarships as inactive.")

    # 2. Check scholarships not scraped in the last 60 days — verify their URL
    logger.info("Step 2: Checking stale scholarships (not scraped in 60+ days)...")
    sixty_days_ago = datetime.utcnow().replace(day=max(1, datetime.utcnow().day - 60)).isoformat()

    stale = (
        client.table("scholarships")
        .select("id, url, name")
        .eq("is_active", True)
        .lt("last_scraped_at", sixty_days_ago)
        .limit(100)
        .execute()
    )

    removed_count = 0
    if stale.data:
        for row in stale.data:
            alive = check_url_alive(row["url"])
            if not alive:
                client.table("scholarships").update({"is_active": False}).eq("id", row["id"]).execute()
                logger.info(f"  Deactivated (URL dead): {row['name']}")
                removed_count += 1

    logger.info(f"  Deactivated {removed_count} scholarships with dead URLs.")

    # 3. Log the cleanup run
    try:
        client.table("scrape_logs").insert({
            "source": "cleanup",
            "added": 0,
            "updated": 0,
            "removed": expired_count + removed_count,
            "errors": [],
            "duration_s": 0,
        }).execute()
    except Exception as e:
        logger.warning(f"Could not write cleanup log: {e}")

    logger.info(f"=== Cleanup Done. Expired: {expired_count}, Dead URLs: {removed_count} ===")


if __name__ == "__main__":
    main()
