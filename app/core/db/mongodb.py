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
    Maintains a SINGLE canonical admin account: admin@analytix.ai
    Removes all legacy variant accounts to prevent ID conflicts.
    """
    logger.info("MongoDB: Entering seed_dev_user...")
    if db.db is not None:
        try:
            from app.core.auth.security import get_password_hash
            from datetime import datetime
            
            # Remove legacy variants that cause user_id conflicts
            for stale_email in ["admin@analytixai.com", "admin@analytixai"]:
                result = await db.db.users.delete_many({"email": stale_email})
                if result.deleted_count > 0:
                    logger.info(f"MongoDB: Removed stale admin variant: {stale_email}")
            
            # Upsert the single canonical admin
            canonical_email = "admin@analytix.ai"
            existing = await db.db.users.find_one({"email": canonical_email})
            if not existing:
                dev_user = {
                    "email": canonical_email,
                    "hashed_password": get_password_hash("admin"),
                    "full_name": "Admin",
                    "is_active": True,
                    "created_at": datetime.utcnow(),
                    "tier": "pro"
                }
                await db.db.users.insert_one(dev_user)
                logger.info(f"MongoDB: Created admin account: {canonical_email}")
            else:
                logger.info(f"MongoDB: Admin account already exists: {canonical_email}")
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
        
        # OFFLINE FALLBACK
        logger.warning("Attempting OFFLINE FALLBACK to local MongoDB (localhost:27017)...")
        try:
            db.client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
            await db.client.admin.command('ping')
            db.db = db.client[settings.DATABASE_NAME]
            logger.info("OFFLINE SUCCESS: Connected to local MongoDB.")
            await ensure_indexes()
            await seed_dev_user()
        except Exception as local_e:
            import requests
            try:
                current_ip = requests.get('https://api.ipify.org', timeout=5).text
            except:
                current_ip = "Unable to detect"
                
            logger.error(f"Local Fallback Failed: {local_e}")
            logger.warning("-" * 50)
            logger.warning(f"CRITICAL: No MongoDB connection available (Atlas or Local).")
            logger.warning(f"YOUR CURRENT IP: {current_ip}")
            logger.warning("ACTION: Start local MongoDB or whitelist your IP in Atlas.")
            logger.warning("-" * 50)
            raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")

def get_database():
    return db.db
