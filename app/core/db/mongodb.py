# app/core/db/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.logger import logger
import certifi

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def ensure_indexes():
    """
    Creates necessary indexes for performance and rapid historical retrieval.
    """
    if db.db is not None:
        try:
            # 1. Faster session lookup (Unique)
            await db.db.sessions.create_index("dataset_id", unique=True)
            # 2. Faster history retrieval by user
            await db.db.sessions.create_index("user_id")
            # 3. Faster date-based sorting
            await db.db.sessions.create_index([("created_at", -1)])
            # 4. User lookup optimization
            await db.db.users.create_index("email", unique=True)
            
            logger.info("MongoDB: Optimization indexes verified/created.")
        except Exception as e:
            logger.error(f"MongoDB Indexing Failed: {e}")

async def seed_dev_user():
    """
    Automagically seeds a default developer account for local testing.
    """
    logger.info("MongoDB: Entering seed_dev_user...")
    if db.db is not None:
        try:
            from app.core.auth.security import get_password_hash
            from datetime import datetime
            
            dev_email = "admin@analytix.ai"
            # FORCE DELETE to ensure clean state
            await db.db.users.delete_one({"email": dev_email})
            
            dev_user = {
                "email": dev_email,
                "hashed_password": get_password_hash("admin"),
                "full_name": "Dev Admin",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "tier": "pro"
            }
            await db.db.users.insert_one(dev_user)
            logger.info(f"MongoDB: HARD RESET -> Admin Seeded ({dev_email} / admin)")
        except Exception as e:
            logger.error(f"MongoDB Seeding Failed: {e}")

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Instance...")
    try:
        # Determine connection options based on URL type
        is_atlas = settings.MONGODB_URL.startswith("mongodb+srv")
        
        conn_kwargs = {
            "serverSelectionTimeoutMS": 15000,
            "connectTimeoutMS": 15000,
            "retryWrites": True
        }
        
        if is_atlas:
            # Atlas requires SSL and a valid CA bundle
            conn_kwargs["tlsCAFile"] = certifi.where()
            logger.info("Using Atlas connection (SSL enabled)")
        else:
            logger.info("Using Local connection (SSL disabled)")

        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            **conn_kwargs
        )
        db.db = db.client[settings.DATABASE_NAME]
        
        # Verify connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        await ensure_indexes()
        await seed_dev_user()
    except Exception as e:
        import requests
        try:
            current_ip = requests.get('https://api.ipify.org', timeout=5).text
        except:
            current_ip = "Unable to detect"
            
        logger.error(f"MongoDB Connection Error: {e}")
        logger.warning("-" * 50)
        logger.warning("CRITICAL: Atlas connection failed. This is usually due to your IP not being whitelisted.")
        logger.warning(f"YOUR CURRENT IP: {current_ip}")
        logger.warning("ACTION: Add this IP to MongoDB Atlas -> Network Access -> Add IP Address.")
        logger.warning("TEMPORARY FIX: Add 0.0.0.0/0 to allow connections from anywhere for testing.")
        logger.warning("-" * 50)
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")

def get_database():
    return db.db
