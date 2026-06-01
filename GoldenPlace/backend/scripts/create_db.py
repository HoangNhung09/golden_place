import logging
import os
import sys
from urllib.parse import unquote_plus

import pyodbc
from sqlalchemy.engine import make_url

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def quote_sqlserver_identifier(value: str) -> str:
    return f"[{value.replace(']', ']]')}]"


def get_database_name_from_url() -> str:
    url = make_url(settings.DATABASE_URL)
    query = dict(url.query)

    if url.database:
        return url.database

    if "odbc_connect" in query:
        for part in unquote_plus(query["odbc_connect"]).split(";"):
            if "=" not in part:
                continue
            key, value = part.split("=", 1)
            if key.strip().lower() in {"database", "initial catalog"} and value.strip():
                return value.strip()

    return "GoldenPlace"


def build_master_connection_string() -> str:
    url = make_url(settings.DATABASE_URL)
    query = dict(url.query)

    if "odbc_connect" in query:
        parts = []
        has_database = False
        for part in unquote_plus(query["odbc_connect"]).split(";"):
            if not part:
                continue
            key = part.split("=", 1)[0].strip().lower() if "=" in part else ""
            if key in {"database", "initial catalog"}:
                parts.append("DATABASE=master")
                has_database = True
            else:
                parts.append(part)
        if not has_database:
            parts.append("DATABASE=master")
        return ";".join(parts) + ";"

    driver = unquote_plus(query.get("driver", "ODBC Driver 17 for SQL Server"))
    server = unquote_plus(url.host or "localhost")
    if url.port:
        server = f"{server},{url.port}"

    parts = [
        f"DRIVER={{{driver}}}",
        f"SERVER={server}",
        "DATABASE=master",
    ]

    if url.username:
        parts.extend([f"UID={unquote_plus(url.username)}", f"PWD={unquote_plus(url.password or '')}"])
    elif query.get("trusted_connection", "").lower() in {"yes", "true", "1"}:
        parts.append("Trusted_Connection=yes")

    return ";".join(parts) + ";"


def create_db():
    url = make_url(settings.DATABASE_URL)

    if not url.drivername.startswith("mssql+"):
        raise RuntimeError("DATABASE_URL must use SQL Server, for example mssql+aioodbc://...")

    database_name = get_database_name_from_url()
    database_sql = quote_sqlserver_identifier(database_name)
    database_check = database_name.replace("'", "''")
    connection_string = build_master_connection_string()

    logger.info("Connecting to SQL Server master database...")
    with pyodbc.connect(connection_string, autocommit=True, timeout=10) as conn:
        conn.execute(
            f"""
            IF DB_ID(N'{database_check}') IS NULL
            BEGIN
                CREATE DATABASE {database_sql};
            END
            """
        )
        logger.info("Database '%s' verified/created successfully.", database_name)


if __name__ == "__main__":
    create_db()
