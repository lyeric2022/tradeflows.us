"""
lambda.py – AWS Lambda entry-point for the USA Trade Flows backend

Key additions vs your original main.py
--------------------------------------
1. import Mangum and create `handler = Mangum(app)`
2. strip out any `uvicorn.run()` block (not needed in Lambda)
3. keep everything else identical so local dev continues to work
"""

from fastapi import FastAPI, HTTPException, Request, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta, timezone
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import traceback
import asyncio
from letta_client import Letta, MessageCreate, TextContent

# NEW: Mangum adapter
from mangum import Mangum

# -------------------------------------------------------------
# 1. Load env-vars
# -------------------------------------------------------------
load_dotenv()

LETTA_API_TOKEN = os.getenv("LETTA_API_TOKEN")
if not LETTA_API_TOKEN:
    print("ERROR: LETTA_API_TOKEN environment variable is not set.")
    letta = None
else:
    letta = Letta(token=LETTA_API_TOKEN)
    print("Letta client initialized.")

# -------------------------------------------------------------
# 2. FastAPI app
# -------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 3. Postgres helpers (unchanged)
# -------------------------------------------------------------
DB_USER     = os.getenv("user")
DB_PASSWORD = os.getenv("password")
DB_HOST     = os.getenv("host")
DB_PORT     = os.getenv("port")
DB_NAME     = os.getenv("dbname")

def get_db_connection():
    if not (DB_USER and DB_PASSWORD and DB_HOST and DB_PORT and DB_NAME):
        print("ERROR: Database connection parameters are not set.")
        return None
    try:
        return psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME
        )
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# connectivity test on cold-start
try:
    _conn = get_db_connection()
    if _conn:
        _conn.close()
        print("Database connection test successful")
    else:
        print("WARNING: Database connection test failed")
except Exception as e:
    print(f"Database connection test error: {e}")

# -------------------------------------------------------------
# 4. Routes, WebSocket manager, helpers (all your original code)
# -------------------------------------------------------------
# … ✂  (everything from your current main.py stays exactly the same)  …

# -------------------------------------------------------------
# 5. Lambda handler
# -------------------------------------------------------------
handler = Mangum(app)
