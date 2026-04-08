"""
Connection registry and SQLAlchemy engine factory.

Connection profiles are kept in memory for the current session.
Passwords are stored encrypted on disk via credentials.py.
"""

from __future__ import annotations

import time
from typing import Any

from sqlalchemy import create_engine, text, Engine

from credentials import store_password, retrieve_password, delete_password

# In-memory registry: {id -> profile_dict (no password)}
_connections: dict[str, dict] = {}
_id_counter = 0


def _next_id() -> int:
    global _id_counter
    _id_counter += 1
    return _id_counter


def _build_url(profile: dict, password: str) -> str:
    db_type = profile["type"]
    database = profile.get("database", "")

    if db_type == "sqlite":
        path = database if database else ":memory:"
        return f"sqlite:///{path}"

    host = profile.get("host", "localhost")
    port = profile.get("port", "")
    user = profile.get("username", "")

    if db_type == "postgresql":
        driver = "postgresql+psycopg2"
    elif db_type == "mysql":
        driver = "mysql+pymysql"
    else:
        raise ValueError(f"Unsupported database type: {db_type}")

    port_part = f":{port}" if port else ""
    return f"{driver}://{user}:{password}@{host}{port_part}/{database}"


def test_connection(profile: dict) -> None:
    """Raise an exception if the connection cannot be established."""
    password = profile.get("password", "")
    url = _build_url(profile, password)
    engine = create_engine(url, connect_args={"connect_timeout": 5} if profile["type"] != "sqlite" else {})
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine.dispose()


def save_connection(profile: dict) -> dict:
    """Persist a connection profile and return it with an assigned id."""
    conn_id = str(_next_id())
    password = profile.pop("password", "")

    safe_profile = {**profile, "id": conn_id}
    _connections[conn_id] = safe_profile

    if password:
        store_password(conn_id, password)

    return safe_profile


def get_connection(conn_id: str) -> dict | None:
    return _connections.get(conn_id)


def list_connections() -> list[dict]:
    return list(_connections.values())


def remove_connection(conn_id: str) -> None:
    _connections.pop(conn_id, None)
    delete_password(conn_id)


def get_engine(conn_id: str) -> Engine:
    profile = _connections.get(conn_id)
    if not profile:
        raise ValueError(f"Connection '{conn_id}' not found.")
    password = retrieve_password(conn_id)
    url = _build_url(profile, password)
    return create_engine(url)
