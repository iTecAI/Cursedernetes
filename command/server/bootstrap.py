import json
from typing import Any
from charset_normalizer import CharsetMatch
import tinydb
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware
import os
from enums import *
import logging
from sshfs import SSHFileSystem
from proxmoxer import ProxmoxAPI


class ConfigurationError(ValueError):
    pass


if __name__ == "__main__":
    raise RuntimeError("Bootstrap.py cannot be run directly. Run main.py.")

# Set logger
log = logging.Logger("core")
core_handler = logging.StreamHandler()
core_handler.setFormatter(
    logging.Formatter(
        fmt="> {levelname} - {filename}.{funcName}:{lineno} @ {asctime} : {message}",
        style="{",
    )
)
log.addHandler(core_handler)

# Get config
with open("config.json", "r") as f:
    try:
        CONFIG = json.load(f)
    except json.JSONDecodeError:
        raise ConfigurationError("Failed to load config.json: bad JSON data.")
log.setLevel(CONFIG["server"]["log_level"])
log.info("Loaded config.json")


# Set up DB collections
for c in COLLECTIONS:
    if not os.path.exists(os.path.join(CONFIG["server"]["database"], c + ".json")):
        log.debug(f"DB Collection {c} does not exist, creating...")
        with open(os.path.join(CONFIG["server"]["database"], c + ".json"), "w") as f:
            f.write("{}")


class DB:
    def __init__(self, folder: str, collections: list[str]):
        self.collections: dict[tinydb.TinyDB] = {}
        for c in collections:
            self.collections[c] = tinydb.TinyDB(
                os.path.join(folder, c + ".json"),
                storage=CachingMiddleware(JSONStorage),
            )
        self.folder = folder

    def __getattr__(self, key: str) -> tinydb.TinyDB:
        try:
            return self.collections[key]
        except KeyError:
            raise AttributeError(
                f"Collection {key} does not exist (collections are: [{', '.join(self.collections.keys())}])"
            )


db: DB = DB(CONFIG["server"]["database"], COLLECTIONS)


class StorageWrapper:
    def __init__(self, storage: SSHFileSystem, root: str) -> None:
        self.root = root
        self.storage = storage

    def __getattr__(self, func: str):
        return StorageFunction(self, func)


class StorageFunction:
    def __init__(self, wrapper: StorageWrapper, function: str) -> None:
        self.wrapper = wrapper
        self.function = function
    
    def _fixpaths(self, res):
        if type(res) == str and res.startswith(self.wrapper.root):
            return "/" + res.replace(self.wrapper.root, "", 1).strip("/")
        if type(res) == list or type(res) == tuple:
            nl = []
            for r in res:
                if type(r) == str and r.startswith(self.wrapper.root):
                    nl.append("/" + r.replace(self.wrapper.root, "", 1).strip("/"))
                elif type(r) == list or type(r) == tuple or type(r) == dict:
                    nl.append(self._fixpaths(r))
                else:
                    nl.append(r)
            return nl
        if type(res) == dict:
            nd = {}
            for k, v in res.items():
                if type(v) == str and v.startswith(self.wrapper.root):
                    nd[k] = "/" + v.replace(self.wrapper.root, "", 1).strip("/")
                elif type(v) == list or type(v) == tuple or type(v) == dict:
                    nd[k] = self._fixpaths(v)
                else:
                    nd[k] = v
            return nd
        else:
            return res

    def __call__(self, *args: Any, **kwds: Any) -> Any:
        if self.function in [
            "cat",
            "cat_file",
            "checksum",
            "created",
            "delete",
            "disk_usage",
            "du",
            "exists",
            "expand_path",
            "find",
            "get_mapper",
            "glob",
            "head",
            "info",
            "isdir",
            "isfile",
            "lexists",
            "ls",
            "makedir",
            "makedirs",
            "mkdir",
            "mkdirs",
            "modified",
            "open",
            "pipe",
            "pipe_file",
            "rm",
            "rm_file",
            "rmdir",
            "sign",
            "size",
            "stat",
            "tail",
            "touch",
            "ukey",
            "walk",
            "download",
            "get",
            "get_file",
        ]:
            res = getattr(self.wrapper.storage, self.function)(
                self.wrapper.root.rstrip("/") + "/" + args[0].strip("/"),
                *args[1:],
                **kwds,
            )
        elif self.function in [
            "clear_instance_cache",
            "current",
            "end_transaction",
            "from_json",
            "start_transaction",
            "to_json",
        ]:
            res = getattr(self.wrapper.storage, self.function)(*args, **kwds)
        elif self.function in ["copy", "cp", "move", "mv", "rename"]:
            return getattr(self.wrapper.storage, self.function)(
                self.wrapper.root.rstrip("/") + "/" + args[0].strip("/"),
                self.wrapper.root.rstrip("/") + "/" + args[1].strip("/"),
                *args[2:],
                **kwds,
            )
        elif self.function in ["put", "put_file", "upload"]:
            res = getattr(self.wrapper.storage, self.function)(
                args[1],
                self.wrapper.root.rstrip("/") + "/" + args[1].strip("/"),
                *args[2:],
                **kwds,
            )
        elif self.function == "sizes":
            res = getattr(self.wrapper.storage, self.function)(
                [self.wrapper.root.rstrip("/") + "/" + i.strip("/") for i in args]
            )
        elif self.function == "invalidate_cache":
            res = getattr(self.wrapper.storage, self.function)(
                path=(kwds["path"] if "path" in kwds.keys() else None)
            )
        else:
            raise AttributeError(f"Function {self.function} is not supported.")
        
        return self._fixpaths(res)
            


class Storage:
    def __init__(self, storages: dict[dict[str | int | SSHFileSystem]]) -> None:
        self.storages = storages
        for s, d in storages.items():
            self.storages[s]["name"] = s
            if d["type"] == "sshfs":
                self.storages[s]["connection"] = StorageWrapper(SSHFileSystem(
                    d["host"],
                    port=(d["port"] if "port" in d.keys() else 22),
                    client_keys=[d["ssh_key"]],
                ), d["storage_root"])
            else:
                raise ConfigurationError(
                    f"Storage target [{s}] has an invalid storage type [{d['type']}]."
                )

    def storage_info(self, storage: str) -> dict:
        try:
            return {k: v for k, v in self.storages[storage].items() if k != "connection"}
        except KeyError:
            raise KeyError(
                f"Storage {storage} is not loaded. Available storages are [{', '.join(self.storages.keys())}]"
            )
    
    def storage_list(self) -> list[str]:
        return list(self.storages.keys())
    
    def storage_check(self) -> dict:
        res = {}
        for k in self.storages.keys():
            try:
                res[k] = {
                    "status": "online",
                    "name": k,
                    "used": self[k].du("/"),
                    "root_files": self[k].ls("/")
                }
            except:
                log.exception(f"Error with storage [{k}]")
                res[k] = {
                    "status": "offline",
                    "name": k,
                    "used": 0,
                    "root_files": []
                }
        return res


    def __getitem__(self, storage: str) -> SSHFileSystem:
        try:
            return self.storages[storage]["connection"]
        except KeyError:
            raise KeyError(
                f"Storage {storage} is not loaded. Available storages are [{', '.join(self.storages.keys())}]"
            )

    def __getattr__(self, storage: str) -> SSHFileSystem:
        return self[storage]

storage = Storage(CONFIG["storage"])

# Setup proxmox API connection
pxapi = ProxmoxAPI(
    CONFIG["proxmox"]["host"],
    user=CONFIG["proxmox"]["api"]["user"],
    token_name=CONFIG["proxmox"]["api"]["token_id"],
    token_value=CONFIG["proxmox"]["api"]["token"],
    verify_ssl=False,
)

__all__ = ["log", "CONFIG", "db", "pxapi", "storage"]
