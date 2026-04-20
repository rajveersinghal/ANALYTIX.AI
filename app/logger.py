import logging
import sys
import os

def setup_logger(name: str = "AnalytixAI"):
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(module)s:%(funcName)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        # Console Handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(formatter)
        logger.addHandler(ch)
        
        # File Handler (Production Grade with Rotation)
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        from logging.handlers import RotatingFileHandler
        # 10MB per file, max 5 files = 50MB cap
        fh = RotatingFileHandler(
            os.path.join(log_dir, "system.log"), 
            maxBytes=10*1024*1024, 
            backupCount=5
        )
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        
    return logger

logger = setup_logger()
get_logger = setup_logger # Alias for factory usage if needed
