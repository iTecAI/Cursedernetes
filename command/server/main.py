import uvicorn, json

with open("config.json", "r") as f:
    try:
        CONFIG = json.load(f)
    except json.JSONDecodeError:
        raise RuntimeError("Failed to load config.json: bad JSON data.")

if __name__ == "__main__":
    uvicorn.run(
        "api:app", 
        host=CONFIG["server"]["host"], 
        port=CONFIG["server"]["port"], 
        log_level=CONFIG["server"]["log_level"].lower(),
        reload=CONFIG["server"]["reload"],
        access_logs=False
    )