"""
Secure credential storage using Fernet symmetric encryption.

A random secret key is generated once per installation and stored in the
user's app-data directory alongside an encrypted credentials store.
Passwords are never written to disk in plain text.
"""

import json
import os
from pathlib import Path

from cryptography.fernet import Fernet

_APP_DIR = Path(os.getenv("APPDATA", Path.home() / ".config")) / "desktop-sql-ide"
_KEY_FILE = _APP_DIR / "key.bin"
_CREDS_FILE = _APP_DIR / "credentials.enc"


def _ensure_key() -> Fernet:
    _APP_DIR.mkdir(parents=True, exist_ok=True)
    if _KEY_FILE.exists():
        key = _KEY_FILE.read_bytes()
    else:
        key = Fernet.generate_key()
        _KEY_FILE.write_bytes(key)
        # Restrict permissions on the key file (Unix only)
        try:
            os.chmod(_KEY_FILE, 0o600)
        except OSError:
            pass
    return Fernet(key)


def _load_store() -> dict:
    fernet = _ensure_key()
    if not _CREDS_FILE.exists():
        return {}
    try:
        encrypted = _CREDS_FILE.read_bytes()
        return json.loads(fernet.decrypt(encrypted))
    except Exception:
        return {}


def _save_store(store: dict) -> None:
    fernet = _ensure_key()
    data = json.dumps(store).encode()
    _CREDS_FILE.write_bytes(fernet.encrypt(data))
    try:
        os.chmod(_CREDS_FILE, 0o600)
    except OSError:
        pass


def store_password(connection_id: str, password: str) -> None:
    store = _load_store()
    store[connection_id] = password
    _save_store(store)


def retrieve_password(connection_id: str) -> str:
    store = _load_store()
    return store.get(connection_id, "")


def delete_password(connection_id: str) -> None:
    store = _load_store()
    store.pop(connection_id, None)
    _save_store(store)
