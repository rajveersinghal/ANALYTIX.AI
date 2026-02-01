from typing import Optional, List, Dict, Any
import pandas as pd
from sqlalchemy import create_engine, text
from pathlib import Path
import json
import streamlit as st
from modules.utils import Logger

class DatabaseConnection:
    """Manages database connections and queries."""
    
    def __init__(self):
        self.engine = None
        self.connection_string = None
    
    def connect(self, db_type: str, **kwargs) -> bool:
        """
        Establishes database connection.
        
        Args:
            db_type: 'sqlite', 'postgresql', or 'mysql'.
            **kwargs: Connection parameters (host, port, database, user, password).
            
        Returns:
            bool: True if connection successful.
        """
        try:
            if db_type == 'sqlite':
                db_path = kwargs.get('database', 'data.db')
                self.connection_string = f"sqlite:///{db_path}"
            elif db_type == 'postgresql':
                host = kwargs.get('host', 'localhost')
                port = kwargs.get('port', 5432)
                database = kwargs.get('database')
                user = kwargs.get('user')
                password = kwargs.get('password')
                self.connection_string = f"postgresql://{user}:{password}@{host}:{port}/{database}"
            elif db_type == 'mysql':
                host = kwargs.get('host', 'localhost')
                port = kwargs.get('port', 3306)
                database = kwargs.get('database')
                user = kwargs.get('user')
                password = kwargs.get('password')
                self.connection_string = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
            
            self.engine = create_engine(self.connection_string)
            # Test connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            Logger.log(f"✅ Connected to {db_type} database")
            return True
            
        except Exception as e:
            Logger.log(f"❌ Database connection failed: {str(e)}")
            st.error(f"Connection failed: {str(e)}")
            return False
    
    def execute_query(self, query: str) -> Optional[pd.DataFrame]:
        """
        Executes SQL query and returns results.
        
        Args:
            query: SQL query string.
            
        Returns:
            pd.DataFrame with query results, or None if error.
        """
        if not self.engine:
            st.error("No active database connection")
            return None
        
        try:
            df = pd.read_sql(query, self.engine)
            Logger.log(f"📊 Query executed: {len(df)} rows returned")
            return df
        except Exception as e:
            Logger.log(f"❌ Query failed: {str(e)}")
            st.error(f"Query error: {str(e)}")
            return None
    
    def list_tables(self) -> List[str]:
        """Lists all tables in the connected database."""
        if not self.engine:
            return []
        
        try:
            query = "SELECT name FROM sqlite_master WHERE type='table'" if 'sqlite' in self.connection_string else \
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
            
            df = pd.read_sql(query, self.engine)
            return df.iloc[:, 0].tolist()
        except:
            return []
    
    def disconnect(self):
        """Closes database connection."""
        if self.engine:
            self.engine.dispose()
            Logger.log("🔌 Database disconnected")

def save_query(query: str, name: str, description: str = ""):
    """
    Saves a SQL query for later use.
    
    Args:
        query: SQL query string.
        name: Name for the saved query.
        description: Optional description.
    """
    save_dir = Path("saved_queries")
    save_dir.mkdir(exist_ok=True)
    
    query_data = {
        'name': name,
        'query': query,
        'description': description
    }
    
    filepath = save_dir / f"{name.replace(' ', '_')}.json"
    with open(filepath, 'w') as f:
        json.dump(query_data, f, indent=2)
    
    Logger.log(f"💾 Query saved: {name}")

def load_saved_queries() -> Dict[str, Dict[str, str]]:
    """
    Loads all saved queries.
    
    Returns:
        Dictionary of {name: {query, description}}.
    """
    save_dir = Path("saved_queries")
    if not save_dir.exists():
        return {}
    
    queries = {}
    for filepath in save_dir.glob("*.json"):
        with open(filepath, 'r') as f:
            data = json.load(f)
            queries[data['name']] = {
                'query': data['query'],
                'description': data.get('description', '')
            }
    
    return queries
