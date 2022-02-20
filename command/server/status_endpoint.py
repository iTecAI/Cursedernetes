from fastapi import APIRouter, Request
from bootstrap import CONFIG, db
import time
from tinydb import where

router = APIRouter(prefix="/status")

@router.get("/")
async def get_status_root(request: Request):
    #log.debug(f"Got status request from {request.state.username}")
    try:
        return db.statistics.search(where("time") > time.time() - (CONFIG["proxmox"]["statistic_timer"] * 2))[0]
    except:
        return {}