from fastapi import FastAPI, HTTPException, Request, Depends, WebSocket, WebSocketDisconnect # Added WebSocket imports
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
import json
import os
from letta_client import Letta, MessageCreate, TextContent
from collections import deque
import traceback
import asyncio # Added asyncio

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Rate Limiting (Simplified for WebSocket Example) ---
# Note: Applying precise rate limiting per user on WebSockets is more complex.
# This global limit will apply to the processing triggered by WebSocket messages.
global_rate_limit: List[datetime] = []
RATE_LIMIT_WINDOW = 60
MAX_MESSAGES = 6

# --- Chat History ---
chat_history = deque(maxlen=10)

class UserMessage(BaseModel):
    message: str

class ChatHistoryItem(BaseModel):
    content: str
    isUser: bool
    timestamp: str

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"New connection: {websocket.client}. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Connection closed: {websocket.client}. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Use asyncio.gather for concurrent sending
        results = await asyncio.gather(
            *[connection.send_json(message) for connection in self.active_connections],
            return_exceptions=True # Don't let one failed send stop others
        )
        # Log any errors during broadcast
        for result, connection in zip(results, list(self.active_connections)):
             if isinstance(result, Exception):
                 print(f"Error sending to {connection.client}: {result}")
                 # Optionally disconnect clients that cause errors
                 # self.disconnect(connection)


manager = ConnectionManager()

# --- Helper to process message and interact with Letta ---
async def process_and_broadcast_message(user_message_content: str):
    global global_rate_limit
    current_time = datetime.now()

    # --- Apply Global Rate Limit ---
    cutoff_time = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)
    global_rate_limit = [ts for ts in global_rate_limit if ts > cutoff_time]
    if len(global_rate_limit) >= MAX_MESSAGES:
        print("Global rate limit exceeded, message dropped.")
        # Optionally send an error message back to the specific user? More complex.
        return # Drop the message or send an error

    global_rate_limit.append(current_time)
    # --- End Rate Limit Check ---

    # 1. Add user message to history and broadcast
    user_msg_data = {
        "content": user_message_content,
        "isUser": True,
        "timestamp": current_time.isoformat()
    }
    chat_history.append(user_msg_data)
    await manager.broadcast(user_msg_data)

    # 2. Call Letta API
    trump_response_content = "Sorry, I couldn't get a response from Trump right now." # Default
    try:
        token = os.getenv("LETTA_API_TOKEN")
        if not token:
            print("LETTA_API_TOKEN not set.")
            raise ValueError("API token not configured.")

        client = Letta(token=token)
        response = client.agents.messages.create(
            agent_id="agent-e6c64060-ee1a-42ab-aadd-fed54ab9bb6c",
            messages=[
                MessageCreate(
                    role="user",
                    content=[TextContent(text=user_message_content)]
                )
            ]
        )
        print("Letta API Response received") # Simplified log

        # Extract response (using the robust logic from previous steps)
        extracted = False
        if hasattr(response, 'messages') and response.messages:
            for msg in response.messages:
                if hasattr(msg, 'message_type') and msg.message_type == 'assistant_message' and hasattr(msg, 'content'):
                    trump_response_content = msg.content
                    extracted = True
                    break
        if not extracted and hasattr(response, 'usage') and hasattr(response.usage, 'steps_messages'):
             # ... (add the tool_calls extraction logic here if needed) ...
             pass # Placeholder for brevity

    except Exception as e:
        print(f"Error during Letta API call or processing: {e}")
        print(traceback.format_exc())
        # Keep the default error message

    # 3. Add Trump response to history and broadcast
    trump_msg_data = {
        "content": trump_response_content,
        "isUser": False,
        "timestamp": datetime.now().isoformat()
    }
    chat_history.append(trump_msg_data)
    await manager.broadcast(trump_msg_data)


# --- WebSocket Endpoint ---
@app.websocket("/ws/trump-chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for a message from the client
            data = await websocket.receive_text()
            try:
                # Assuming client sends JSON like {"message": "user text"}
                message_data = json.loads(data)
                if "message" in message_data and isinstance(message_data["message"], str):
                    user_message_content = message_data["message"].strip()
                    if user_message_content:
                        # Process and broadcast asynchronously
                        asyncio.create_task(process_and_broadcast_message(user_message_content))
                else:
                    print(f"Invalid message format received: {data}")
            except json.JSONDecodeError:
                print(f"Non-JSON message received: {data}")
            except Exception as e:
                 print(f"Error processing received message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {websocket.client} disconnected.")
    except Exception as e:
        # Catch other potential errors during receive loop
        print(f"Unexpected error with client {websocket.client}: {e}")
        manager.disconnect(websocket)


# --- HTTP Endpoint for Initial History ---
@app.get("/trump-chat-history")
async def get_chat_history():
    """Returns the last 10 messages in the conversation"""
    return {"messages": list(chat_history)}

# --- (Optional) Keep or remove the old POST endpoint ---
# @app.post("/chat-with-trump") ...

# Run the server (if script is executed directly)
if __name__ == "__main__":
    import uvicorn
    # Ensure LETTA_API_TOKEN is set before running
    if not os.getenv("LETTA_API_TOKEN"):
        print("ERROR: LETTA_API_TOKEN environment variable is not set.")
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)