from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.core.config import settings
from app.workspaces.router import router as workspace_router
from app.projects.router import router as projects_router
from app.boards.router import router as boards_router
from app.columns.router import router as columns_router
from app.tasks.router import router as tasks_router
from app.comments.router import router as comments_router
from app.activity_logs.router import router as activity_logs_router
from app.notifications.router import router as notifications_router
from app.favorites.router import router as favorites_router

# Import all models to ensure registration with declarative Base mapping registry
import app.users.models  # noqa: F401
import app.workspaces.models  # noqa: F401
import app.projects.models  # noqa: F401
import app.boards.models  # noqa: F401
import app.columns.models  # noqa: F401
import app.tasks.models  # noqa: F401
import app.comments.models  # noqa: F401
import app.mentions.models  # noqa: F401
import app.activity_logs.models  # noqa: F401
import app.notifications.models  # noqa: F401
import app.favorites.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown lifecycle hook."""
    # Startup: place future initialization here (e.g. connection pool warmup)
    yield
    # Shutdown: place future cleanup here

    # Import engine here to avoid circular imports at module level
    from app.database.session import engine

    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT.value,
    }


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router, prefix="/api")
app.include_router(workspace_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(boards_router, prefix="/api")
app.include_router(columns_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(comments_router, prefix="/api")
app.include_router(activity_logs_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
