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

# Load environment variables
load_dotenv()

# --- Letta Setup --- (Add this right after loading environment variables)
LETTA_API_TOKEN = os.getenv("LETTA_API_TOKEN")
if not LETTA_API_TOKEN:
    print("ERROR: LETTA_API_TOKEN environment variable is not set.")
    letta = None
else:
    letta = Letta(token=LETTA_API_TOKEN)
    print("Letta client initialized.")

# --- FastAPI App --- (MOVED UP HERE)
app = FastAPI()

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
DB_USER = os.getenv("user")
DB_PASSWORD = os.getenv("password")
DB_HOST = os.getenv("host")
DB_PORT = os.getenv("port")
DB_NAME = os.getenv("dbname")

# Database connection function
def get_db_connection():
    if not (DB_USER and DB_PASSWORD and DB_HOST and DB_PORT and DB_NAME):
        print("ERROR: Database connection parameters are not set.")
        return None
    
    try:
        connection = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# Test connection at startup - already implemented
try:
    conn = get_db_connection()
    if conn:
        conn.close()
        print("Database connection test successful")
    else:
        print("WARNING: Database connection test failed")
except Exception as e:
    print(f"Database connection test error: {e}")

@app.get("/trump-chat-history")
async def get_chat_history():
    """Returns the last 10 messages from database"""
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, timestamp, is_user, content, trump_response, fact_check 
            FROM chat_messages 
            ORDER BY id DESC 
            LIMIT 20
            """
        )
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Data is newest first, reverse to get oldest first for chat display
        messages = list(reversed(messages))
        
        # Map keys for frontend consistency
        formatted_messages = [
            {
                "timestamp": msg["timestamp"],
                "isUser": msg["is_user"],
                "content": msg["content"],
                "trump_response": msg["trump_response"],
                "fact_check": msg["fact_check"]
            } for msg in messages
        ]

        return {"messages": formatted_messages}

    except Exception as e:
        print(f"Error fetching chat history: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching history")

# Add this variable near the top of your file, after the manager initialization
active_requests = {}  # Dictionary to track client requests

async def process_and_broadcast_message(message_content, client_id, message_id):
    """Process a user message, store in DB, and broadcast response"""
    
    # Add forced delay to ensure typing indicator is visible for at least 2 seconds
    await asyncio.sleep(2)
    
    # Current time in UTC
    current_time_utc = datetime.now(timezone.utc)
    
    # Store user message in database - make this non-blocking
    try:
        # Use a background task for database operations
        asyncio.create_task(store_user_message(message_content, current_time_utc))
    except Exception as db_e:
        print(f"Exception scheduling user message storage: {db_e}")
    
    # Call Letta for Trump's response - don't block other operations
    if not letta:
        print("ERROR: Letta client not initialized")
        trump_response_content = "Sorry, I couldn't get a response from Trump right now. (API client error)"
        fact_check_content = "Fact check unavailable due to API client error."
    else:
        try:
            # Create a task for the Trump response
            trump_agent_id = "agent-e6c64060-ee1a-42ab-aadd-fed54ab9bb6c"
            print(f"Calling Trump Agent ({trump_agent_id})")
            
            # Get Trump's response
            response_trump = await get_trump_response(trump_agent_id, message_content)
            
            # Extract Trump response
            trump_response_content = "Sorry, I couldn't get a response from Trump right now."
            if hasattr(response_trump, 'messages') and response_trump.messages:
                for msg in response_trump.messages:
                    if hasattr(msg, 'message_type') and msg.message_type == 'assistant_message' and hasattr(msg, 'content'):
                        if isinstance(msg.content, list) and len(msg.content) > 0 and isinstance(msg.content[0], TextContent):
                            trump_response_content = msg.content[0].text
                            break
                        elif isinstance(msg.content, str):
                            trump_response_content = msg.content
                            break
        except Exception as e:
            print(f"Error getting Trump response: {e}")
            trump_response_content = "Sorry, I couldn't get a response from Trump right now."
            fact_check_content = "Fact check unavailable due to API error."
    
    # Call Letta for Fact Checking - in parallel if possible
    try:
        fact_checker_agent_id = "agent-7334ad53-f9c4-4524-b299-cd307b1ffc4f"
        fact_check_prompt = f'Fact check this message from Donald Trump: "{trump_response_content}" How accurate is this statement? Be concise.'
        
        # Get fact check response
        response_factcheck = await get_fact_check(fact_checker_agent_id, fact_check_prompt)
        
        # Extract Fact Checker response
        fact_check_content = "Fact check unavailable."
        if hasattr(response_factcheck, 'messages') and response_factcheck.messages:
            for msg in response_factcheck.messages:
                if hasattr(msg, 'message_type') and msg.message_type == 'assistant_message' and hasattr(msg, 'content'):
                    if isinstance(msg.content, list) and len(msg.content) > 0 and isinstance(msg.content[0], TextContent):
                        fact_check_content = msg.content[0].text
                        break
                    elif isinstance(msg.content, str):
                        fact_check_content = msg.content
                        break
    except Exception as e:
        print(f"Error getting fact check: {e}")
        fact_check_content = "Fact check unavailable due to an error."
    
    # Store assistant response in database as a background task
    try:
        asyncio.create_task(store_assistant_message(
            trump_response_content, fact_check_content, current_time_utc))
    except Exception as db_e:
        print(f"Exception scheduling assistant message storage: {db_e}")
    
    # Send response to user
    response_data = {
        "trump_response": trump_response_content,
        "fact_check": fact_check_content,
        "timestamp": current_time_utc.isoformat()
    }
    
    # Broadcast Trump's response to ALL clients
    await manager.broadcast({
        "trump_response": trump_response_content,
        "fact_check": fact_check_content,
        "isUser": False,
        "timestamp": current_time_utc.isoformat(),
        "type": "trump_response",
        "message_id": message_id  # Include message_id for tracking
    })
    
    # Remove this message from active requests
    if client_id in active_requests and message_id in active_requests[client_id]:
        active_requests[client_id].remove(message_id)
        
        # If this client has no more pending requests, turn off typing indicator
        if not active_requests[client_id]:
            await manager.broadcast({
                "type": "typing_indicator",
                "isTyping": False,
                "client_id": client_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"New connection: {websocket.client}. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Connection closed: {websocket.client}. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Fix: ensure proper JSON serialization and error handling
        message_str = json.dumps(message)
        
        # Use a copy of the connections to avoid modification during iteration
        connections = list(self.active_connections)
        
        for connection in connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                print(f"Error broadcasting to {connection.client}: {e}")
                # Optionally: remove failed connections
                self.active_connections.discard(connection)

# Initialize the connection manager
manager = ConnectionManager()

# --- Rate Limiting ---
class RateLimiter:
    def __init__(self, max_messages=3, window_seconds=60):
        # Store message timestamps per client
        self.client_messages = {}
        self.max_messages = max_messages
        self.window_seconds = window_seconds
    
    def check_rate_limit(self, client_id):
        """
        Check if client has exceeded rate limit
        Returns: (bool) True if allowed, False if limit exceeded
        """
        current_time = datetime.now(timezone.utc)
        
        # Initialize timestamps list for new clients
        if client_id not in self.client_messages:
            self.client_messages[client_id] = []
        
        # Filter out old timestamps outside the current window
        window_start = current_time - timedelta(seconds=self.window_seconds)
        self.client_messages[client_id] = [
            ts for ts in self.client_messages[client_id] 
            if ts > window_start
        ]
        
        # Check if client is over limit
        if len(self.client_messages[client_id]) >= self.max_messages:
            return False
        
        # Add current timestamp and allow message
        self.client_messages[client_id].append(current_time)
        return True

# Initialize rate limiter
rate_limiter = RateLimiter(max_messages=3, window_seconds=60)

@app.websocket("/ws/trump-chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Use client IP or some identifier as client_id
    client_id = f"{websocket.client.host}:{websocket.client.port}"
    
    # Initialize this client's active requests
    if client_id not in active_requests:
        active_requests[client_id] = set()
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                if "message" in message_data and isinstance(message_data["message"], str):
                    user_message = message_data["message"].strip()
                    if user_message:
                        # Check rate limit before processing
                        if not rate_limiter.check_rate_limit(client_id):
                            # Send rate limit exceeded message
                            await websocket.send_text(json.dumps({
                                "type": "rate_limit_exceeded",
                                "message": "You can only send 3 messages per minute. Please wait before sending more.",
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }))
                            continue
                        
                        # Generate a unique message ID
                        message_id = f"{client_id}-{datetime.now().timestamp()}"
                        
                        # Store this message as an active request
                        active_requests[client_id].add(message_id)
                        
                        # Process as before...
                        
                        # Immediately send typing indicator to ALL clients
                        await manager.broadcast({
                            "type": "typing_indicator",
                            "isTyping": True,
                            "client_id": client_id,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                        
                        # Process in background, passing client_id and message_id
                        asyncio.create_task(process_and_broadcast_message(user_message, client_id, message_id))
                    else:
                        print("Received empty message.")
                else:
                    print(f"Invalid message format received: {data}")
            except json.JSONDecodeError:
                print(f"Non-JSON message received: {data}")
            except Exception as e:
                print(f"Error processing message: {e}")
                traceback.print_exc()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {websocket.client} disconnected (outer catch).")
    finally:
        print(f"Connection closed: {websocket.client}. Total: 0")
        print("INFO:     connection closed")

# Add these helper functions to make the code more modular and async-friendly

async def store_user_message(message_content, timestamp):
    """Store user message in database asynchronously"""
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO chat_messages (content, is_user, timestamp, trump_response, fact_check)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    message_content, 
                    True, 
                    timestamp.isoformat(),
                    None,
                    None
                )
            )
            conn.commit()
            cursor.close()
            conn.close()
            print("User message stored in database.")
        else:
            print("Could not store user message - database connection failed.")
    except Exception as db_e:
        print(f"Exception during database user message insert: {db_e}")

async def store_assistant_message(trump_response, fact_check, timestamp):
    """Store assistant message in database asynchronously"""
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO chat_messages (content, is_user, timestamp, trump_response, fact_check)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    None,
                    False,
                    timestamp.isoformat(),
                    trump_response,
                    fact_check
                )
            )
            conn.commit()
            cursor.close()
            conn.close()
            print("Assistant message stored in database.")
        else:
            print("Could not store assistant message - database connection failed.")
    except Exception as db_e:
        print(f"Exception during database assistant message insert: {db_e}")

async def get_trump_response(agent_id, message_content):
    """Get response from Trump agent asynchronously"""
    return letta.agents.messages.create(
        agent_id=agent_id,
        messages=[
            MessageCreate(
                role="user",
                content=[TextContent(text=message_content)]
            )
        ]
    )

async def get_fact_check(agent_id, prompt):
    """Get fact check response asynchronously"""
    return letta.agents.messages.create(
        agent_id=agent_id,
        messages=[
            MessageCreate(
                role="user",
                content=[TextContent(text=prompt)]
            )
        ]
    )
    
    