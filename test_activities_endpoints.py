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


async def test_activities_flow():
    token = create_test_token(OWNER_ID)
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        # --- 1. Set Up Workspace, Project, Board, and Columns ---
        print("--- 1. Set Up Workspace, Project, Board, and Columns ---")
        ws_name = f"Act Test WS {uuid.uuid4().hex[:6]}"
        ws_slug = f"act-test-ws-{uuid.uuid4().hex[:6]}"
        res = await client.post(
            f"{BASE_URL}/workspaces/",
            json={"name": ws_name, "slug": ws_slug, "description": "Temp workspace"},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        workspace_id = res.json()["id"]

        project_name = f"Act Test Project {uuid.uuid4().hex[:4]}"
        project_key = f"ATP{uuid.uuid4().hex[:3]}".upper()[:10]
        res = await client.post(
            f"{BASE_URL}/projects/",
            json={"workspace_id": workspace_id, "name": project_name, "key": project_key},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        project_id = res.json()["id"]

        board_name = f"Act Test Board {uuid.uuid4().hex[:4]}"
        res = await client.post(
            f"{BASE_URL}/boards/",
            json={"project_id": project_id, "name": board_name},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        board_id = res.json()["id"]

        # Create two columns to test moving tasks
        res = await client.post(
            f"{BASE_URL}/columns/",
            json={"board_id": board_id, "name": "Column A", "position": 0},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        col_a_id = res.json()["id"]

        res = await client.post(
            f"{BASE_URL}/columns/",
            json={"board_id": board_id, "name": "Column B", "position": 1},
            headers=headers,
        )
        assert res.status_code == 201, res.text
        col_b_id = res.json()["id"]

        print("Workspace, Project, Board, and Columns created.")

        # --- 2. Check Project/Column Logging ---
        print("\n--- 2. Checking Project/Column Created Events ---")
        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        assert res.status_code == 200, res.text
        acts = res.json()
        
        # We should have PROJECT_CREATED and COLUMN_CREATED events
        actions = [a["action"] for a in acts]
        print("Logged Actions:", actions)
        assert "PROJECT_CREATED" in actions
        assert "COLUMN_CREATED" in actions

        # Verify metadata values
        proj_created_act = next(a for a in acts if a["action"] == "PROJECT_CREATED")
        assert proj_created_act["metadata"]["project_name"] == project_name

        # --- 3. Create Task & Verify TASK_CREATED ---
        print("\n--- 3. Create Task & Verify TASK_CREATED ---")
        res = await client.post(
            f"{BASE_URL}/tasks/",
            json={
                "column_id": col_a_id,
                "title": "Test Task For Activity",
                "description": "Log this creation",
                "priority": "MEDIUM",
                "position": 0,
            },
            headers=headers,
        )
        assert res.status_code == 201, res.text
        task_id = res.json()["id"]

        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        acts = res.json()
        task_created_act = next(a for a in acts if a["action"] == "TASK_CREATED")
        assert task_created_act["task_id"] == task_id
        assert task_created_act["metadata"]["task_title"] == "Test Task For Activity"
        print("Successfully validated TASK_CREATED event and metadata.")

        # --- 4. Update Task Priority & Verify TASK_PRIORITY_CHANGED ---
        print("\n--- 4. Update Task Priority & Verify TASK_PRIORITY_CHANGED ---")
        res = await client.patch(
            f"{BASE_URL}/tasks/{task_id}",
            json={"priority": "HIGH"},
            headers=headers,
        )
        assert res.status_code == 200, res.text

        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        acts = res.json()
        priority_changed_act = next(a for a in acts if a["action"] == "TASK_PRIORITY_CHANGED")
        assert priority_changed_act["task_id"] == task_id
        assert priority_changed_act["metadata"]["from_priority"] == "medium"
        assert priority_changed_act["metadata"]["to_priority"] == "high"
        assert priority_changed_act["metadata"]["task_title"] == "Test Task For Activity"
        print("Successfully validated TASK_PRIORITY_CHANGED event.")

        # --- 5. Move Task & Verify TASK_MOVED ---
        print("\n--- 5. Move Task & Verify TASK_MOVED ---")
        res = await client.post(
            f"{BASE_URL}/tasks/{task_id}/move",
            json={"column_id": col_b_id, "position": 0},
            headers=headers,
        )
        assert res.status_code == 200, res.text

        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        acts = res.json()
        moved_act = next(a for a in acts if a["action"] == "TASK_MOVED")
        assert moved_act["task_id"] == task_id
        assert moved_act["metadata"]["from_column"] == "Column A"
        assert moved_act["metadata"]["to_column"] == "Column B"
        assert moved_act["metadata"]["task_title"] == "Test Task For Activity"
        print("Successfully validated TASK_MOVED event.")

        # --- 6. Assign Task & Verify TASK_ASSIGNED ---
        print("\n--- 6. Assign Task & Verify TASK_ASSIGNED ---")
        res = await client.post(
            f"{BASE_URL}/tasks/{task_id}/assign",
            json={"assignee_id": str(OWNER_ID)},
            headers=headers,
        )
        assert res.status_code == 200, res.text

        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        acts = res.json()
        assigned_act = next(a for a in acts if a["action"] == "TASK_ASSIGNED")
        assert assigned_act["task_id"] == task_id
        assert "assignee_name" in assigned_act["metadata"]
        print("Successfully validated TASK_ASSIGNED event.")

        # --- 7. Delete Task & Verify TASK_DELETED and SET NULL ---
        print("\n--- 7. Delete Task & Verify TASK_DELETED and SET NULL ---")
        res = await client.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        assert res.status_code == 204

        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        acts = res.json()
        deleted_act = next(a for a in acts if a["action"] == "TASK_DELETED")
        # Task ID should be null due to SET NULL behavior, but metadata retains name
        assert deleted_act["task_id"] is None
        assert deleted_act["metadata"]["task_title"] == "Test Task For Activity"
        print("Successfully verified TASK_DELETED event and SET NULL cascade behavior.")

        # --- 8. Workspace Cascade Checks ---
        print("\n--- 8. Workspace Cascade Checks ---")
        res = await client.delete(f"{BASE_URL}/workspaces/{workspace_id}", headers=headers)
        assert res.status_code == 204

        # Since workspace is deleted, its activities should be cascade deleted
        res = await client.get(f"{BASE_URL}/activities/?workspace_id={workspace_id}", headers=headers)
        # Should return 403 because workspace no longer exists / membership checks fail
        assert res.status_code == 403
        print("Cascade deleted activities successfully.")


if __name__ == "__main__":
    asyncio.run(test_activities_flow())
