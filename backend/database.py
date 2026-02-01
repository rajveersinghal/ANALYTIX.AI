"""
MongoDB Database Connection
Async MongoDB connection using Motor
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.config import settings
from backend.db.models import User, OnboardingData, Dataset, MLModel, Prediction, Experiment, Session

# MongoDB client
client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # Initialize Beanie with document models
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User,
            OnboardingData,
            Dataset,
            MLModel,
            Prediction,
            Experiment,
            Session
        ]
    )
    
    # Create indexes
    await create_indexes()
    
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("❌ Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for performance"""
    # User indexes
    await User.find_one().motor_collection.create_index("email", unique=True)
    
    # Dataset indexes
    await Dataset.find_one().motor_collection.create_index("user_id")
    await Dataset.find_one().motor_collection.create_index([("user_id", 1), ("created_at", -1)])
    
    # Model indexes
    await MLModel.find_one().motor_collection.create_index("user_id")
    await MLModel.find_one().motor_collection.create_index("dataset_id")
    
    # Prediction indexes (time-series optimized)
    await Prediction.find_one().motor_collection.create_index("model_id")
    await Prediction.find_one().motor_collection.create_index([("created_at", -1)])
    await Prediction.find_one().motor_collection.create_index([("model_id", 1), ("created_at", -1)])
    
    print("✅ Created database indexes")


def get_database():
    """Get database instance"""
    return client[settings.DATABASE_NAME]
