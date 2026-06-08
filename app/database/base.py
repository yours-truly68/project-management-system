"""
Declarative base for all SQLAlchemy ORM models.

Uses SQLAlchemy 2.x DeclarativeBase (class-based) instead of the legacy
declarative_base() factory. All models inherit from Base to share a single
MetaData registry, which Alembic uses for autogenerate.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass
