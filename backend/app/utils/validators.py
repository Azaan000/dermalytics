import re
from app.core.exceptions import ValidationException

def validate_password_strength(password: str):
    """
    Ensures password is at least 8 chars with mixed case and digits.
    """
    if len(password) < 8:
        raise ValidationException("Password must be at least 8 characters long", code="AUTH_1006")
    if not re.search(r"[A-Z]", password):
        raise ValidationException("Password must contain at least one uppercase letter", code="AUTH_1006")
    if not re.search(r"[a-z]", password):
        raise ValidationException("Password must contain at least one lowercase letter", code="AUTH_1006")
    if not re.search(r"\d", password):
        raise ValidationException("Password must contain at least one number", code="AUTH_1006")

def validate_file_size(size_in_bytes: int, max_bytes: int = 10 * 1024 * 1024):
    if size_in_bytes > max_bytes:
        raise ValidationException("File size exceeds 10MB limit.", code="VAL_2003")
