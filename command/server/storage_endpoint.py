from fastapi import APIRouter, Request, Response
from bootstrap import log, storage
import time
from tinydb import where
from util import *
from starlette.status import *

router = APIRouter(prefix="/storage")

@router.get("/")
def get_storage_root():
    return {k: storage.storage_info(k) for k in storage.storage_list()}

@router.get("/{st_name}")
async def get_storage_info(st_name: str, response: Response):
    try:
        return storage.storage_info(st_name)
    except KeyError:
        response.status_code = HTTP_404_NOT_FOUND
        return error(404, f"Storage {st_name} does not exist.")

@router.get("/{st_name}/ls/{dirname:path}")
async def get_ls(st_name: str, dirname: str, response: Response):
    if not st_name in storage.storage_list():
        response.status_code = HTTP_404_NOT_FOUND
        return error(404, f"Storage {st_name} does not exist.")
    try:
        return storage[st_name].ls(dirname, detail=True)
    except:
        response.status_code = HTTP_405_METHOD_NOT_ALLOWED
        return error(405, f"{dirname} @ {st_name} cannot be listed. It either does not exist or is a directory.")