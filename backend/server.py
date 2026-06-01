from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Any, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class SyncPayload(BaseModel):
    data: Any
    client_updated_at: Optional[str] = None


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ============================================================
# CLOUD SYNC — singleton state for personal protocol
# ============================================================

ALLOWED_KEYS = {"protocol", "agenda"}


@api_router.get("/sync/{key}")
async def get_sync_state(key: str):
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail="invalid sync key")
    doc = await db.sync_state.find_one({"_id": key})
    if not doc:
        return {"data": None, "updated_at": None}
    return {"data": doc.get("data"), "updated_at": doc.get("updated_at")}


@api_router.put("/sync/{key}")
async def put_sync_state(key: str, payload: SyncPayload):
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail="invalid sync key")
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.sync_state.update_one(
        {"_id": key},
        {"$set": {"data": payload.data, "updated_at": now_iso}},
        upsert=True,
    )
    return {"ok": True, "updated_at": now_iso}


@api_router.delete("/sync/{key}")
async def delete_sync_state(key: str):
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail="invalid sync key")
    await db.sync_state.delete_one({"_id": key})
    return {"ok": True}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
