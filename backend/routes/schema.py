from fastapi import APIRouter, HTTPException
from sqlalchemy import inspect, text

import database as db

router = APIRouter(prefix="/schema", tags=["schema"])


@router.get("/{conn_id}")
def get_schema(conn_id: str):
    try:
        engine = db.get_engine(conn_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    try:
        inspector = inspect(engine)
        profile = db.get_connection(conn_id)
        db_type = profile.get("type", "")

        # Determine database names to inspect
        if db_type == "postgresql":
            with engine.connect() as conn:
                rows = conn.execute(
                    text("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname")
                )
                db_names = [r[0] for r in rows]
        elif db_type == "mysql":
            with engine.connect() as conn:
                rows = conn.execute(text("SHOW DATABASES"))
                db_names = [r[0] for r in rows]
        else:
            # SQLite: single "database"
            db_names = [profile.get("database") or ":memory:"]

        schema_tree = []
        for db_name in db_names:
            tables = []
            try:
                table_names = inspector.get_table_names()
                for table_name in table_names:
                    columns = []
                    for col in inspector.get_columns(table_name):
                        columns.append(
                            {"name": col["name"], "type": str(col["type"])}
                        )
                    tables.append({"name": table_name, "columns": columns})
            except Exception:
                pass
            schema_tree.append({"name": db_name, "tables": tables})

        return schema_tree
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        engine.dispose()
