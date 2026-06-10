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


async def test_workspace_flow():
    owner_token = create_test_token(OWNER_ID)
    member_token = create_test_token(MEMBER_ID)

    headers_owner = {"Authorization": f"Bearer {owner_token}"}
    headers_member = {"Authorization": f"Bearer {member_token}"}

    async with httpx.AsyncClient() as client:
        print("--- 1. List Workspaces for Owner ---")
        res = await client.get(f"{BASE_URL}/workspaces/", headers=headers_owner)
        assert res.status_code == 200, f"Failed: {res.status_code} {res.text}"
        workspaces = res.json()
        print(f"Owner has {len(workspaces)} workspaces.")
        for ws in workspaces:
            print(f"- {ws['name']} ({ws['slug']}) id={ws['id']}")

        print("\n--- 2. Create a new workspace ---")
        ws_name = f"Test Workspace {uuid.uuid4().hex[:6]}"
        ws_slug = f"test-ws-{uuid.uuid4().hex[:6]}"
        create_payload = {
            "name": ws_name,
            "slug": ws_slug,
            "description": "Integration test workspace",
        }
        res = await client.post(
            f"{BASE_URL}/workspaces/", json=create_payload, headers=headers_owner
        )
        assert res.status_code == 201, f"Failed: {res.status_code} {res.text}"
        new_ws = res.json()
        new_ws_id = new_ws["id"]
        print(f"Created workspace '{ws_name}' with ID: {new_ws_id}")

        print("\n--- 3. List Members (Should only be Owner as OWNER) ---")
        res = await client.get(
            f"{BASE_URL}/workspaces/{new_ws_id}/members", headers=headers_owner
        )
        assert res.status_code == 200, f"Failed: {res.status_code} {res.text}"
        members = res.json()
        print("Members in workspace:")
        for m in members:
            print(f"- {m['full_name']} ({m['email']}) Role: {m['role']}")
        assert len(members) == 1
        assert members[0]["role"] == "OWNER"

        print("\n--- 4. Invite newuser@example.com as MEMBER ---")
        invite_payload = {"email": "newuser@example.com", "role": "MEMBER"}
        res = await client.post(
            f"{BASE_URL}/workspaces/{new_ws_id}/members",
            json=invite_payload,
            headers=headers_owner,
        )
        assert res.status_code == 201, f"Failed: {res.status_code} {res.text}"
        print("Successfully invited member.")

        print("\n--- 5. List Members again (Should now have 2 members) ---")
        res = await client.get(
            f"{BASE_URL}/workspaces/{new_ws_id}/members", headers=headers_owner
        )
        assert res.status_code == 200, f"Failed: {res.status_code} {res.text}"
        members = res.json()
        print("Updated Members list:")
        for m in members:
            print(f"- {m['full_name']} ({m['email']}) Role: {m['role']}")
        assert len(members) == 2

        print("\n--- 6. Promote member to ADMIN ---")
        role_payload = {"role": "ADMIN"}
        res = await client.patch(
            f"{BASE_URL}/workspaces/{new_ws_id}/members/{MEMBER_ID}",
            json=role_payload,
            headers=headers_owner,
        )
        assert res.status_code == 204, f"Failed: {res.status_code} {res.text}"
        print("Promoted member to ADMIN successfully.")

        print("\n--- 7. Verify updated role in members list ---")
        res = await client.get(
            f"{BASE_URL}/workspaces/{new_ws_id}/members", headers=headers_owner
        )
        members = res.json()
        member_record = next(m for m in members if m["user_id"] == str(MEMBER_ID))
        assert member_record["role"] == "ADMIN", f"Role is {member_record['role']}"
        print(f"Role updated verify check passed. Member role: {member_record['role']}")

        print(
            "\n--- 8. Non-owner (ADMIN) attempts to delete workspace (Should fail with 403) ---"
        )
        res = await client.delete(
            f"{BASE_URL}/workspaces/{new_ws_id}", headers=headers_member
        )
        assert res.status_code == 403, f"Unexpected: {res.status_code} {res.text}"
        print(
            f"Forbidden check passed. Status code: {res.status_code}, Detail: {res.json().get('detail')}"
        )

        print("\n--- 9. Owner updates workspace details (PATCH) ---")
        update_payload = {
            "name": f"{ws_name} Updated",
            "slug": f"{ws_slug}-up",
            "description": "Updated description",
        }
        res = await client.patch(
            f"{BASE_URL}/workspaces/{new_ws_id}",
            json=update_payload,
            headers=headers_owner,
        )
        assert res.status_code == 200, f"Failed: {res.status_code} {res.text}"
        updated_ws = res.json()
        print(
            f"Workspace updated: name='{updated_ws['name']}', slug='{updated_ws['slug']}', desc='{updated_ws['description']}'"
        )
        assert updated_ws["name"] == f"{ws_name} Updated"

        print("\n--- 10. Owner deletes workspace (Should succeed with 204) ---")
        res = await client.delete(
            f"{BASE_URL}/workspaces/{new_ws_id}", headers=headers_owner
        )
        assert res.status_code == 204, f"Failed: {res.status_code} {res.text}"
        print("Workspace deleted successfully.")

        print("\n--- 11. Verify workspace no longer accessible ---")
        res = await client.get(
            f"{BASE_URL}/workspaces/{new_ws_id}", headers=headers_owner
        )
        assert res.status_code == 404, f"Unexpected: {res.status_code} {res.text}"
        print("Verified: Workspace no longer found.")

        print("\nAll integration checks passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_workspace_flow())
