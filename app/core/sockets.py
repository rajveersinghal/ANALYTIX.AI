# app/core/sockets.py
from fastapi import WebSocket
from typing import Dict, List
import json
from app.logger import logger

class ConnectionManager:
    """
    Manages active WebSocket connections for real-time job tracking.
    """
    def __init__(self):
        # Maps job_id -> list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)
        logger.info(f"SOCKET: Job {job_id} connected. Total watchers: {len(self.active_connections[job_id])}")

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            if websocket in self.active_connections[job_id]:
                self.active_connections[job_id].remove(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]
        logger.info(f"SOCKET: Job {job_id} disconnected.")

    async def broadcast_to_job(self, job_id: str, message: dict):
        """
        Sends a real-time update to all clients watching a specific job.
        """
        if job_id in self.active_connections:
            # We use a copy of the list to avoid 'size changed during iteration' errors
            dead_connections = []
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"SOCKET: Failed to send to connection in job {job_id}: {e}")
                    dead_connections.append(connection)
            
            # Clean up dead connections
            for dead in dead_connections:
                self.disconnect(dead, job_id)

socket_manager = ConnectionManager()
