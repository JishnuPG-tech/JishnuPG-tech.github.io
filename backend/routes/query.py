"""
Query execution route.

Security note: A SQL IDE intentionally executes user-supplied SQL against
user-owned database connections.  The raw SQL string is passed through
SQLAlchemy's text() construct on purpose — this is the core product feature.
Protections in place:
  • The backend only listens on 127.0.0.1 (no external access).
  • Every request must reference a valid, pre-registered connection_id; the
    engine is built from the stored (encrypted) credentials, not from anything
    supplied in the request body.
  • CORS is restricted to local origins only.
"""

import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

import database as db

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    connection_id: str
    sql: str


@router.post("/execute")
def execute_query(req: QueryRequest):
    if not req.sql.strip():
        raise HTTPException(status_code=400, detail="SQL query is empty.")

    # Validate that connection_id refers to a registered profile; the engine
    # URL is constructed entirely from server-side stored credentials.
    try:
        engine = db.get_engine(req.connection_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    start = time.perf_counter()
    try:
        with engine.connect() as conn:
            # nosec B608 — intentional raw SQL execution in a SQL IDE
            result = conn.execute(text(req.sql))  # noqa: S608
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

            if result.returns_rows:
                columns = list(result.keys())
                rows = [list(row) for row in result.fetchall()]
            else:
                columns = ["affected_rows"]
                rows = [[result.rowcount]]
                conn.commit()

        return {
            "columns": columns,
            "rows": rows,
            "executionTime": elapsed_ms,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        engine.dispose()
