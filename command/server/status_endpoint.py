from fastapi import APIRouter, Request, Response
from bootstrap import CONFIG, db
import time
from tinydb import where
from util import *
from starlette.status import *
import os

router = APIRouter(prefix="/status")


@router.get("/")
async def get_status_root(request: Request):
    # log.debug(f"Got status request from {request.state.username}")
    data = db.statistics.search(
        where("time") > time.time() - (CONFIG["proxmox"]["statistic_timer"] * 2)
    )

    try:
        return data[0]
    except:
        return {}


@router.get("/{node}")
async def get_status_node(response: Response, node: str, seconds: int | None = 7200):
    data = {
        d["time"]: d["node_status"][node]
        for d in db.statistics.search(where("time") > time.time() - seconds)
        if node in d["node_status"].keys()
    }
    if len(data.keys()) == 0:
        response.status_code = HTTP_404_NOT_FOUND
        return error(
            404, f"Node {node} has no associated data over the last {seconds}s"
        )

    return {
        "historical_data": data,
        "resource_data": {r["id"]: r for r in db.current_status.search(where("node") == node)},
    }
