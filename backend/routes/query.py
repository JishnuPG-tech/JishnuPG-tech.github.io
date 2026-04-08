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

    try:
        engine = db.get_engine(req.connection_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    start = time.perf_counter()
    try:
        with engine.connect() as conn:
            result = conn.execute(text(req.sql))
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
