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
OWNER_ID = uuid.UUID(
    "019ead0d-aa93-76df-a9bf-9ff34166589e"
)  # mohammedrazim880@gmail.com
MEMBER_ID = uuid.UUID("019ead09-bb42-78ba-98ce-ff858a5dea56")  # newuser@example.com


def create_test_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=15)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def test_tasks_flow():
    owner_token = create_test_token(OWNER_ID)
    member_token = create_test_token(MEMBER_ID)

    headers_owner = {"Authorization": f"Bearer {owner_token}"}
    headers_member = {"Authorization": f"Bearer {member_token}"}

    async with httpx.AsyncClient() as client:
        print("--- 1. Create Temporary Workspace, Project, and Board ---")
        ws_name = f"Task WS {uuid.uuid4().hex[:6]}"
        ws_slug = f"task-ws-{uuid.uuid4().hex[:6]}"
        res = await client.post(
            f"{BASE_URL}/workspaces/",
            json={
                "name": ws_name,
                "slug": ws_slug,
                "description": "Temp workspace for tasks",
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Workspace creation failed: {res.text}"
        workspace_id = res.json()["id"]

        res = await client.post(
            f"{BASE_URL}/projects/",
            json={
                "workspace_id": workspace_id,
                "name": "Task Project",
                "key": "TSK",
                "description": "Project for tasks",
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Project creation failed: {res.text}"
        project_id = res.json()["id"]

        res = await client.post(
            f"{BASE_URL}/boards/",
            json={
                "project_id": project_id,
                "name": "Task Board",
                "description": "Board for tasks",
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Board creation failed: {res.text}"
        board_id = res.json()["id"]

        print(
            f"Created Workspace={workspace_id}, Project={project_id}, Board={board_id}"
        )

        print("\n--- 2. Create Columns inside Board ---")
        res = await client.post(
            f"{BASE_URL}/columns/",
            json={
                "board_id": board_id,
                "name": "Column A",
                "position": 0,
                "color": "#ef4444",
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Column A failed: {res.text}"
        col_a_id = res.json()["id"]

        res = await client.post(
            f"{BASE_URL}/columns/",
            json={
                "board_id": board_id,
                "name": "Column B",
                "position": 1,
                "color": "#3b82f6",
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Column B failed: {res.text}"
        col_b_id = res.json()["id"]

        print(f"Created Column A={col_a_id}, Column B={col_b_id}")

        print("\n--- 3. Create Task 1 & Task 2 in Column A ---")
        res = await client.post(
            f"{BASE_URL}/tasks/",
            json={
                "column_id": col_a_id,
                "title": "Task 1",
                "description": "First task description",
                "priority": "HIGH",
                "position": 0,
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Task 1 failed: {res.text}"
        task1 = res.json()
        assert task1["title"] == "Task 1"
        assert task1["position"] == 0
        task1_id = task1["id"]

        res = await client.post(
            f"{BASE_URL}/tasks/",
            json={
                "column_id": col_a_id,
                "title": "Task 2",
                "description": "Second task description",
                "priority": "LOW",
                "position": 1,
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Task 2 failed: {res.text}"
        task2 = res.json()
        assert task2["title"] == "Task 2"
        assert task2["position"] == 1
        task2_id = task2["id"]

        print(f"Created Task 1 ID={task1_id}, Task 2 ID={task2_id}")

        print(
            "\n--- 4. Insert Task 3 at Position 0 in Column A (Verify shift safety) ---"
        )
        res = await client.post(
            f"{BASE_URL}/tasks/",
            json={
                "column_id": col_a_id,
                "title": "Task 3",
                "description": "Third task inserted at start",
                "priority": "MEDIUM",
                "position": 0,
            },
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Task 3 failed: {res.text}"
        task3 = res.json()
        assert task3["position"] == 0
        task3_id = task3["id"]

        print("\n--- 5. Get Board Tasks (Check listing and positions) ---")
        res = await client.get(
            f"{BASE_URL}/tasks/?board_id={board_id}", headers=headers_owner
        )
        assert res.status_code == 200, f"List failed: {res.text}"
        tasks_list = res.json()
        print(f"Tasks on Board: {[{t['title']: t['position']} for t in tasks_list]}")
        assert len(tasks_list) == 3, f"Expected 3 tasks, got {len(tasks_list)}"

        # Verify task positions were shifted correctly
        t3 = next(t for t in tasks_list if t["id"] == task3_id)
        t1 = next(t for t in tasks_list if t["id"] == task1_id)
        t2 = next(t for t in tasks_list if t["id"] == task2_id)
        assert t3["position"] == 0, f"Task 3 position incorrect: {t3['position']}"
        assert t1["position"] == 1, f"Task 1 position incorrect: {t1['position']}"
        assert t2["position"] == 2, f"Task 2 position incorrect: {t2['position']}"
        print("Shift verification passed successfully!")

        print("\n--- 6. Get Single Task Details ---")
        res = await client.get(f"{BASE_URL}/tasks/{task1_id}", headers=headers_owner)
        assert res.status_code == 200, f"Fetch task1 failed: {res.text}"
        assert res.json()["title"] == "Task 1"

        print("\n--- 7. Update Task Details (PATCH) ---")
        res = await client.patch(
            f"{BASE_URL}/tasks/{task1_id}",
            json={
                "title": "Task 1 Renamed",
                "priority": "URGENT",
                "description": "New description",
            },
            headers=headers_owner,
        )
        assert res.status_code == 200, f"Update failed: {res.text}"
        updated_task = res.json()
        assert updated_task["title"] == "Task 1 Renamed"
        assert updated_task["priority"] == "URGENT"

        print("\n--- 8. Assign Task (POST /assign) ---")
        res = await client.post(
            f"{BASE_URL}/tasks/{task1_id}/assign",
            json={"assignee_id": str(MEMBER_ID)},
            headers=headers_owner,
        )
        assert res.status_code == 200, f"Assign failed: {res.text}"
        assert res.json()["assignee_id"] == str(MEMBER_ID)

        print("\n--- 9. Move Task from Column A to Column B ---")
        res = await client.post(
            f"{BASE_URL}/tasks/{task1_id}/move",
            json={"column_id": col_b_id, "position": 0},
            headers=headers_owner,
        )
        assert res.status_code == 200, f"Move failed: {res.text}"
        moved_task = res.json()
        assert moved_task["column_id"] == col_b_id
        assert moved_task["position"] == 0

        # Verify Column A tasks closed the gap
        res = await client.get(
            f"{BASE_URL}/tasks/?board_id={board_id}", headers=headers_owner
        )
        tasks_list = res.json()
        col_a_tasks = [t for t in tasks_list if t["column_id"] == col_a_id]
        print(
            f"Remaining tasks in Column A: {[{t['title']: t['position']} for t in col_a_tasks]}"
        )
        assert len(col_a_tasks) == 2, (
            f"Expected 2 tasks remaining, got {len(col_a_tasks)}"
        )
        t3_new = next(t for t in col_a_tasks if t["id"] == task3_id)
        t2_new = next(t for t in col_a_tasks if t["id"] == task2_id)
        assert t3_new["position"] == 0, (
            f"Task 3 position gap incorrect: {t3_new['position']}"
        )
        assert t2_new["position"] == 1, (
            f"Task 2 position gap incorrect: {t2_new['position']}"
        )
        print("Gap closure verification passed successfully!")

        print("\n--- 10. Invite Member and Check Delete Permission Enforcement ---")
        # Invite MEMBER_ID to workspace
        invite_res = await client.post(
            f"{BASE_URL}/workspaces/{workspace_id}/members",
            json={"email": "newuser@example.com", "role": "MEMBER"},
            headers=headers_owner,
        )
        assert invite_res.status_code == 201, f"Invite member failed: {invite_res.text}"

        # Member attempts to delete task they do not own (should fail with 403)
        res = await client.delete(
            f"{BASE_URL}/tasks/{task1_id}", headers=headers_member
        )
        assert res.status_code == 403, f"Unexpected delete success: {res.status_code}"
        print("Permission enforcement check passed (403 Forbidden received).")

        print("\n--- 11. Owner Deletes Task (Verify 204) ---")
        res = await client.delete(f"{BASE_URL}/tasks/{task1_id}", headers=headers_owner)
        assert res.status_code == 204, f"Delete failed: {res.status_code}"

        # Verify task is deleted
        res = await client.get(f"{BASE_URL}/tasks/{task1_id}", headers=headers_owner)
        assert res.status_code == 404, f"Unexpected fetch: {res.status_code}"

        print("\n--- 12. Clean Up Temporary Workspace ---")
        res = await client.delete(
            f"{BASE_URL}/workspaces/{workspace_id}", headers=headers_owner
        )
        assert res.status_code == 204, f"Workspace delete failed: {res.text}"
        print("Workspace cleanup completed.")

        print("\nAll task integration tests completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_tasks_flow())
