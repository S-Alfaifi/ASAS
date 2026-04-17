"""Utility Helpers"""
import os


def allowed_file(filename, allowed_extensions=None):
    """Check if file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = {'.csv', '.xlsx', '.xls'}
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions
