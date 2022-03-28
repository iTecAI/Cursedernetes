from fastapi import APIRouter, Request, Response
from bootstrap import log, storage
import time
from tinydb import where
from util import *
from starlette.status import *
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

router = APIRouter(prefix="/service")

# Preview functions ===
def _preview_source_github(url: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Referer": "https://github.com"
    }
    path = urlparse(url).path.split("/")[1:]
    if len(path) != 2:
        raise RuntimeError
    if len(path[1]) == 0:
        raise RuntimeError
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        raise RuntimeError
    page_raw = r.text
    soup = BeautifulSoup(page_raw, features="html.parser")
    return {
        "title": str(soup.select_one("title").string),
        "description": str(soup.find("meta", {"property": "og:description"})["content"]),
        "image": str(soup.find("meta", {"property": "og:image"})["content"]),
    }

def _preview_source_dockerhub(url: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Referer": url
    }
    path = urlparse(url).path.strip("/").split("/")
    if len(path) < 2 or len(path) > 3:
        raise RuntimeError
    
    if path[0] == "_":
        if len(path) != 2:
            raise RuntimeError
        r = requests.get(f"https://hub.docker.com/api/content/v1/products/images/{path[1]}", headers=headers)
        if r.status_code != 200:
            raise RuntimeError
        dat = r.json()
        summary = {
            "title": dat["name"],
            "description": dat["short_description"],
            "image": list(dat["logo_url"].values())[0]
        }
    else:
        if len(path) != 3:
            raise RuntimeError
        r = requests.get(f"https://hub.docker.com/v2/repositories/{path[1]}/{path[2]}/", headers=headers)
        if r.status_code != 200:
            raise RuntimeError
        dat = r.json()
        r_org = requests.get(f"https://hub.docker.com/v2/orgs/{path[1]}/", headers=headers)
        if r_org.status_code != 200:
            raise RuntimeError
        dat_org = r_org.json()
        summary = {
            "title": dat["user"] + "/" + dat["name"],
            "description": dat["description"],
            "image": dat_org["gravatar_url"]
        }

    return summary


@router.get("/create/preview")
async def get_preview(request: Request, response: Response, url: str):
    hostname = urlparse(url).hostname
    sources = {"github.com": _preview_source_github, "hub.docker.com": _preview_source_dockerhub}
    if hostname in sources.keys():
        try:
            data = sources[hostname](url)
        except:
            response.status_code = HTTP_404_NOT_FOUND
            return error(404, f"URL {url} could not be resolved/data is insufficient/invalid source")
    else:
        response.status_code = HTTP_406_NOT_ACCEPTABLE
        return error(406, f"URL {url} is not in acceptable sources [{', '.join(sources.keys())}]")
    return data

# End preview system ===