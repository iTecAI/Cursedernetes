from fastapi import Response
from fastapi.routing import APIRouter
import hashlib
import os
from bootstrap import db, CONFIG
import time
from util import *
from pydantic import BaseModel
from starlette.status import *
from tinydb import Query, where
import secrets

router = APIRouter(prefix="/login")


@router.get("/init")
async def init_login():
    srv_bits = hashlib.sha256(os.urandom(16)).hexdigest()
    uuid = hashlib.sha256(os.urandom(8)).hexdigest()
    db.connections.insert(
        {
            "uuid": uuid,
            "srv_bits": srv_bits,
            "timestamp": time.time(),
            "type": "instantiating",
        }
    )
    db.connections.remove(where("timestamp") < (time.time() - 10))
    return {"uuid": uuid, "bits": srv_bits}


class LoginModel(BaseModel):
    username: str
    password_hash: str
    cli_bits: str
    uuid: str


@router.post("/")
async def login(model: LoginModel, response: Response):
    if not model.username in CONFIG["server"]["users"].keys():
        response.status_code = HTTP_404_NOT_FOUND
        return error(404, f"Error: user {model.username} not in userbank.")
    documents: list[dict] = db.connections.search(
        Query().fragment({"type": "instantiating", "uuid": model.uuid})
    )
    if len(documents) == 0:
        response.status_code = HTTP_404_NOT_FOUND
        return error(404, f"Error: uuid {model.uuid} has not yet been instantiated.")

    doc = documents[0]
    if doc["timestamp"] + 5 < time.time():
        response.status_code = HTTP_403_FORBIDDEN
        return error(
            403, f"Error: uuid {model.uuid} has past the instantiation deadline."
        )

    if (
        model.password_hash
        == hashlib.sha256(
            (doc["srv_bits"]
            + CONFIG["server"]["users"][model.username]["password"]
            + model.cli_bits).encode("utf-8")
        ).hexdigest()
    ):
        uuid = hashlib.sha256(os.urandom(32)).hexdigest()
        connection_salt = secrets.token_urlsafe(16)
        db.connections.remove(where("uuid") == model.uuid)
        db.connections.remove(where("username") == model.username)
        db.connections.insert({
            "username": model.username,
            "uuid": hashlib.sha256((uuid + connection_salt).encode("utf-8")).hexdigest(),
            "type": "connection"
        })
        return {
            "uuid": uuid,
            "salt": connection_salt
        }
    else:
        response.status_code = HTTP_403_FORBIDDEN
        return error(
            403, f"Incorrect password."
        )
