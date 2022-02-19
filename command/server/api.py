import hashlib
from bootstrap import *
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi_restful.tasks import repeat_every
import time
from tinydb import Query, where
import os
import json
from starlette.status import *
from util import *
import secrets
from login_endpoint import router as loginRouter

app = FastAPI()

app.include_router(loginRouter, tags=["login"])


@app.middleware("http")
async def auth(request: Request, call_next):
    if "x-fingerprint" in request.headers.keys():
        if request.headers["x-fingerprint"] == "nofp":
            permissions: list[str] = CONFIG["server"]["unauthenticated_permissions"]
            new_salt = "nosalt"
            user = None
        else:
            conn = db.connections.search(
                Query().fragment(
                    {"uuid": request.headers["x-fingerprint"], "type": "connection"}
                )
            )
            if len(conn) == 0:
                permissions: list[str] = CONFIG["server"]["unauthenticated_permissions"]
                new_salt = "nosalt"
                user = None
            else:
                conn = conn[0]
                if not conn["username"] in CONFIG["server"]["users"].keys():
                    response = JSONResponse(
                        error(404, "Username is not recognized"), HTTP_404_NOT_FOUND
                    )
                    response.headers["Access-Control-Allow-Origin"] = "*";
                    return response
                permissions: list[str] = CONFIG["server"]["users"][conn["username"]][
                    "permissions"
                ]
                new_salt = secrets.token_urlsafe(16)
                user = conn["username"]
    else:
        permissions: list[str] = CONFIG["server"]["unauthenticated_permissions"]
        new_salt = "nosalt"
        user = None

    if not any([request.url.path.startswith(i) for i in permissions]):
        response = JSONResponse(
            error(
                403, f"Unauthorized to access {request.url.path}: Not in permissions"
            ),
            HTTP_403_FORBIDDEN,
        )
        response.headers["Access-Control-Allow-Origin"] = "*";
        return response

    request.state.username = user
    response: Response = await call_next(request)

    response.headers["x-new-salt"] = new_salt
    if user:
        db.connections.update(
            {
                "uuid": hashlib.sha256(
                    (conn["uuid"] + new_salt).encode("utf-8")
                ).hexdigest()
            },
            where("uuid") == conn["uuid"],
        )
    response.headers["Access-Control-Allow-Origin"] = "*";
    return response


# Pull node statistic data from PVE
@app.on_event("startup")
@repeat_every(seconds=CONFIG["proxmox"]["statistic_timer"])
def get_server_status():
    node_data = pxapi.nodes.get()
    current_status = {
        "time": time.time(),
        "node_status": {n["node"]: n for n in node_data},
    }
    db.statistics.insert(current_status)
    rem = db.statistics.remove(
        Query().time < (time.time() - CONFIG["proxmox"]["keep_statistics"])
    )
    if len(rem) > 0:
        log.debug("Removed document ids: {}".format(str(rem)))


@app.get("/theme/{theme}")
async def get_theme(response: Response, theme: str):
    if os.path.exists(os.path.join("themes", f"{theme}.json")):
        with open(os.path.join("themes", f"{theme}.json"), "r") as f:
            return {f"--{k}": v for k, v in json.load(f).items()}

    response.status_code = HTTP_404_NOT_FOUND
    return error(404, f"Theme {theme} not found")

@app.get("/status")
async def get_status_root(request: Request):
    #log.debug(f"Got status request from {request.state.username}")
    return db.statistics.search(where("time") > time.time() - CONFIG["proxmox"]["statistic_timer"])[0]

@app.post("/logout")
async def logout(request: Request):
    db.connections.remove(where("username") == request.state.username)
    return {}
