import asyncio
import uuid
import httpx
from jose import jwt
from datetime import UTC, datetime, timedelta

# Configuration matching the running dev server
JWT_SECRET = "def90f72c450d7c7782e5a76ad3ef913"
JWT_ALGORITHM = "HS256"
BASE_URL = "http://localhost:8000/api"

# User IDs from the database
OWNER_ID = uuid.UUID("019ead0d-aa93-76df-a9bf-9ff34166589e")  # mohammedrazim880@gmail.com


def create_test_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=15)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def test_favorites_and_preferences_flow():
    token = create_test_token(OWNER_ID)
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        # --- 1. Set Up Temporary Workspace, Project, and Board ---
        print("--- 1. Set Up Temporary Workspace, Project, and Board ---")
        ws_name = f"Fav Test WS {uuid.uuid4().hex[:6]}"
        ws_slug = f"fav-test-ws-{uuid.uuid4().hex[:6]}"
        res = await client.post(
            f"{BASE_URL}/workspaces/",
            json={"name": ws_name, "slug": ws_slug, "description": "Temp workspace"},
            headers=headers,
        )
        assert res.status_code == 201
        workspace_id = res.json()["id"]

        project_name = f"Fav Test Project {uuid.uuid4().hex[:4]}"
        project_key = f"FTP{uuid.uuid4().hex[:3]}".upper()[:10]
        res = await client.post(
            f"{BASE_URL}/projects/",
            json={"workspace_id": workspace_id, "name": project_name, "key": project_key},
            headers=headers,
        )
        assert res.status_code == 201
        project_id = res.json()["id"]

        board_name = f"Fav Test Board {uuid.uuid4().hex[:4]}"
        res = await client.post(
            f"{BASE_URL}/boards/",
            json={"project_id": project_id, "name": board_name},
            headers=headers,
        )
        assert res.status_code == 201
        board_id = res.json()["id"]

        print(f"WS ID: {workspace_id}, Project ID: {project_id}, Board ID: {board_id}")

        # --- 2. Board Preferences Check (GET & PUT) ---
        print("\n--- 2. Board Preferences Check (GET & PUT) ---")
        # GET default preference (should return view_type = "board" mock)
        res = await client.get(f"{BASE_URL}/boards/{board_id}/preference", headers=headers)
        assert res.status_code == 200, res.text
        pref = res.json()
        assert pref["view_type"] == "board"
        print("Verified default board preference is 'board'")

        # PUT updated preference
        res = await client.put(
            f"{BASE_URL}/boards/{board_id}/preference",
            json={"view_type": "list"},
            headers=headers,
        )
        assert res.status_code == 200, res.text
        pref = res.json()
        assert pref["view_type"] == "list"
        print("Updated board preference to 'list' successfully")

        # GET to verify persistent update
        res = await client.get(f"{BASE_URL}/boards/{board_id}/preference", headers=headers)
        assert res.status_code == 200
        assert res.json()["view_type"] == "list"
        print("Verified persistent board preference is indeed 'list'")

        # --- 3. Favorites System Check (POST, GET, DELETE) ---
        print("\n--- 3. Favorites System Check ---")
        # Favorite the Project
        res = await client.post(
            f"{BASE_URL}/favorites/",
            json={"entity_type": "project", "entity_id": project_id},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        proj_fav = res.json()
        assert proj_fav["entity_type"] == "project"
        assert proj_fav["entity_id"] == project_id
        assert proj_fav["project"]["id"] == project_id
        print("Successfully favorited the project")

        # Favorite the Board
        res = await client.post(
            f"{BASE_URL}/favorites/",
            json={"entity_type": "board", "entity_id": board_id},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        board_fav = res.json()
        assert board_fav["entity_type"] == "board"
        assert board_fav["entity_id"] == board_id
        assert board_fav["board"]["id"] == board_id
        assert board_fav["project"]["id"] == project_id  # Resolves parent project correctly
        print("Successfully favorited the board")

        # Double favorite project (should prevent duplicate with 409 Conflict)
        res = await client.post(
            f"{BASE_URL}/favorites/",
            json={"entity_type": "project", "entity_id": project_id},
            headers=headers,
        )
        assert res.status_code == 409, res.text
        print("Verified duplicate safety constraint blocks double-favorites")

        # List all favorites (GET /favorites)
        res = await client.get(f"{BASE_URL}/favorites/", headers=headers)
        assert res.status_code == 200
        favs = res.json()
        assert len(favs) >= 2
        entity_ids = [f["entity_id"] for f in favs]
        assert project_id in entity_ids
        assert board_id in entity_ids
        print(f"GET /favorites list returned {len(favs)} favorites successfully")

        # Delete the board favorite (DELETE /favorites/{id})
        board_fav_id = board_fav["id"]
        res = await client.delete(f"{BASE_URL}/favorites/{board_fav_id}", headers=headers)
        assert res.status_code == 204
        print("Successfully deleted board favorite")

        # Verify it was removed
        res = await client.get(f"{BASE_URL}/favorites/", headers=headers)
        favs = res.json()
        assert not any(f["id"] == board_fav_id for f in favs)
        print("Verified deletion from active list successfully")

        # --- 4. Clean Up and Cascade Checks ---
        print("\n--- 4. Clean Up and Cascade Checks ---")
        # Delete the temporary workspace
        res = await client.delete(f"{BASE_URL}/workspaces/{workspace_id}", headers=headers)
        assert res.status_code == 204
        print("Deleted temporary workspace successfully")

        # Project and board are cascade deleted. Let's see if favorites are deleted by cascade!
        res = await client.get(f"{BASE_URL}/favorites/", headers=headers)
        favs = res.json()
        assert not any(f["entity_id"] == project_id for f in favs)
        print("Verified favorites table cascade cleared when entities are deleted")


if __name__ == "__main__":
    asyncio.run(test_favorites_and_preferences_flow())
