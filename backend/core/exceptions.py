"""
Custom exceptions for ANALYTIX.AI backend
"""

from fastapi import HTTPException, status


class AnalytixException(Exception):
    """Base exception for ANALYTIX.AI"""
    pass


class DatasetNotFoundException(AnalytixException):
    """Dataset not found"""
    pass


class ModelNotFoundException(AnalytixException):
    """Model not found"""
    pass


class InvalidDataException(AnalytixException):
    """Invalid data provided"""
    pass


class TrialExpiredException(AnalytixException):
    """User trial has expired"""
    pass


def dataset_not_found(dataset_id: str):
    """Raise dataset not found HTTP exception"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Dataset {dataset_id} not found"
    )


def model_not_found(model_id: str):
    """Raise model not found HTTP exception"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Model {model_id} not found"
    )


def invalid_data(message: str):
    """Raise invalid data HTTP exception"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )


def trial_expired():
    """Raise trial expired HTTP exception"""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Your trial has expired. Please upgrade to continue."
    )
