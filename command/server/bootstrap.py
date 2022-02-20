import json
from charset_normalizer import CharsetMatch
import tinydb
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware
import os
from enums import *
import logging
from proxmoxer import ProxmoxAPI

if __name__ == "__main__":
    raise RuntimeError("Bootstrap.py cannot be run directly. Run main.py.")

# Set logger
log = logging.Logger("core")
core_handler = logging.StreamHandler()
core_handler.setFormatter(logging.Formatter(
    fmt="> {levelname} - {filename}.{funcName}:{lineno} @ {asctime} : {message}",
    style="{"
))
log.addHandler(core_handler)

# Get config
with open("config.json", "r") as f:
    try:
        CONFIG = json.load(f)
    except json.JSONDecodeError:
        raise RuntimeError("Failed to load config.json: bad JSON data.")
log.setLevel(CONFIG["server"]["log_level"])
log.info("Loaded config.json")


# Set up DB collections
for c in COLLECTIONS:
    if not os.path.exists(os.path.join(CONFIG["server"]["database"], c+".json")):
        log.debug(f"DB Collection {c} does not exist, creating...")
        with open(os.path.join(CONFIG["server"]["database"], c+".json"), 'w') as f:
            f.write("{}")

class DB:
    def __init__(self, folder: str, collections: list[str]):
        self.collections: dict[tinydb.TinyDB] = {}
        for c in collections:
            self.collections[c] = tinydb.TinyDB(os.path.join(folder, c+".json"), storage=CachingMiddleware(JSONStorage))
        self.folder = folder
    
    def __getattr__(self, key: str) -> tinydb.TinyDB:
        try:
            return self.collections[key]
        except KeyError:
            raise AttributeError(f"Collection {key} does not exist (collections are: [{', '.join(self.collections.keys())}])")

db: DB = DB(CONFIG["server"]["database"], COLLECTIONS)

# Setup proxmox API connection
pxapi = ProxmoxAPI(
    CONFIG["proxmox"]["host"], 
    user=CONFIG["proxmox"]["api"]["user"], 
    token_name=CONFIG["proxmox"]["api"]["token_id"],
    token_value=CONFIG["proxmox"]["api"]["token"],
    verify_ssl=False
)

__all__ = ["log", "CONFIG", "db", "pxapi"]
