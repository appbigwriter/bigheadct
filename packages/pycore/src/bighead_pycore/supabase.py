def supabase_admin_headers(secret_key: str) -> dict[str, str]:
    """Build server-side Supabase headers for hosted and legacy admin keys."""
    headers = {"apikey": secret_key}
    if not secret_key.startswith("sb_secret_"):
        headers["Authorization"] = f"Bearer {secret_key}"
    return headers
