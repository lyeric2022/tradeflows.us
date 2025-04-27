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
            SELECT timestamp, is_user, content, trump_response, fact_check 
            FROM chat_messages 
            ORDER BY timestamp DESC 
            LIMIT 10
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

async def process_and_broadcast_message(message_content):
    """Process a user message, store in DB, and broadcast response"""
    
    # Current time in UTC
    current_time_utc = datetime.now(timezone.utc)
    
    # Store user message in database
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
                    current_time_utc.isoformat(),
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
    
    # Call Letta for Trump's response
    if not letta:
        print("ERROR: Letta client not initialized")
        trump_response_content = "Sorry, I couldn't get a response from Trump right now. (API client error)"
        fact_check_content = "Fact check unavailable due to API client error."
    else:
        trump_agent_id = "agent-e6c64060-ee1a-42ab-aadd-fed54ab9bb6c"
        print(f"Calling Trump Agent ({trump_agent_id})")
        response_trump = letta.agents.messages.create(
            agent_id=trump_agent_id,
            messages=[
                MessageCreate(
                    role="user",
                    content=[TextContent(text=message_content)]
                )
            ]
        )
        print("Trump Agent Response received")

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
    
    # Call Letta for Fact Checking
    fact_checker_agent_id = "agent-7334ad53-f9c4-4524-b299-cd307b1ffc4f"
    fact_check_prompt = f'Fact check this message from Donald Trump: "{trump_response_content}"'
    print(f"Calling Fact Checker Agent ({fact_checker_agent_id}) with prompt: {fact_check_prompt[:100]}...")

    response_factcheck = letta.agents.messages.create(
        agent_id=fact_checker_agent_id,
        messages=[
            MessageCreate(
                role="user",
                content=[TextContent(text=fact_check_prompt)]
            )
        ]
    )
    print("Fact Checker Response received")

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
    
    # Store assistant response in database
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
                    current_time_utc.isoformat(),
                    trump_response_content,
                    fact_check_content
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
        "type": "trump_response"
    })
    
    # Turn off typing indicator
    await manager.broadcast({
        "type": "typing_indicator",
        "isTyping": False,
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

@app.websocket("/ws/trump-chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)  # Use manager.connect instead of websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                if "message" in message_data and isinstance(message_data["message"], str):
                    user_message = message_data["message"].strip()
                    if user_message:
                        # Store message in database
                        current_time_utc = datetime.now(timezone.utc)
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
                                        user_message, 
                                        True, 
                                        current_time_utc.isoformat(),
                                        None,
                                        None
                                    )
                                )
                                conn.commit()
                                cursor.close()
                                conn.close()
                                print("User message stored in database.")
                                
                                # Broadcast user message to ALL clients
                                await manager.broadcast({
                                    "content": user_message,
                                    "isUser": True,
                                    "timestamp": current_time_utc.isoformat()
                                })
                                
                                # Immediately send typing indicator to ALL clients
                                await manager.broadcast({
                                    "type": "typing_indicator",
                                    "isTyping": True,
                                    "timestamp": datetime.now(timezone.utc).isoformat()
                                })
                                
                                # Process in background
                                asyncio.create_task(process_and_broadcast_message(user_message))
                            else:
                                print("Could not store user message - database connection failed.")
                        except Exception as db_e:
                            print(f"Exception during database user message insert: {db_e}")
                        
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