# app/core/data_cleaning/duplicate_handler.py
import pandas as pd

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drops exact row duplicates.
    """
    initial_rows = len(df)
    df = df.drop_duplicates()
    final_rows = len(df)
    
    # We could log this difference later
    return df
