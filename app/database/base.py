"""
Declarative base for all SQLAlchemy ORM models.

Uses SQLAlchemy 2.x DeclarativeBase instead of the legacy
declarative_base() factory function.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
