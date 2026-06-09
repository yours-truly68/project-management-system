"""
Password hashing utilities.

Uses bcrypt directly instead of passlib. passlib is unmaintained and
incompatible with bcrypt>=4.1 on Python 3.13. The bcrypt library
itself is actively maintained and sufficient for our needs.
"""

import bcrypt


def hash_password(plain_password: str) -> str:
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
