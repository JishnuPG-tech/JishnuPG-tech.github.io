from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import database as db

router = APIRouter(prefix="/connections", tags=["connections"])


class ConnectionProfile(BaseModel):
    name: str
    type: str
    host: str = "localhost"
    port: str = ""
    database: str = ""
    username: str = ""
    password: str = ""


@router.get("")
def list_connections():
    return db.list_connections()


@router.post("")
def create_connection(profile: ConnectionProfile):
    try:
        saved = db.save_connection(profile.model_dump())
        return saved
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/test")
def test_connection(profile: ConnectionProfile):
    try:
        db.test_connection(profile.model_dump())
        return {"status": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{conn_id}")
def delete_connection(conn_id: str):
    db.remove_connection(conn_id)
    return {"status": "deleted"}
