from bootstrap import *
from fastapi import FastAPI, Request, Response
from fastapi_restful.tasks import repeat_every
import time
from tinydb import Query

app = FastAPI()


# Pull node statistic data from PVE
@app.on_event("startup")
@repeat_every(seconds=CONFIG["proxmox"]["statistic_timer"])
def get_server_status():
    node_data = pxapi.nodes.get()
    current_status = {
        "time": time.time(),
        "node_status": {
            n["node"]: n for n in node_data
        }
    }
    db.statistics.insert(current_status)
    rem = db.statistics.remove(Query().time < (time.time() - CONFIG["proxmox"]["keep_statistics"]))
    if len(rem) > 0:
        log.debug("Removed document ids: {}".format(str(rem)))



