import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.columns.repository import ColumnRepository
from app.boards.repository import BoardRepository
from app.projects.repository import ProjectRepository
from app.workspaces.repository import WorkspaceRepository
from app.tasks.models import Task
from app.tasks.repository import TaskRepository
from app.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate, TaskMove, TaskReorder, TaskAssign
from app.users.models import User
from app.shared.enums import WorkspaceRole, Priority
from app.shared.permissions.policies import has_permission, Permission


class TaskService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.task_repo = TaskRepository(session)
        self.column_repo = ColumnRepository(session)
        self.board_repo = BoardRepository(session)
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_task(
        self, data: TaskCreate, current_user: User
    ) -> TaskResponse:
        role = await self._get_column_workspace_role(data.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_CREATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to create tasks.",
            )

        # Shift existing tasks to accommodate new position
        tasks = await self.task_repo.get_column_tasks(data.column_id, for_update=True)
        target_pos = max(0, min(data.position, len(tasks)))

        task = Task(
            column_id=data.column_id,
            title=data.title,
            description=data.description,
            priority=data.priority,
            assignee_id=data.assignee_id,
            reporter_id=data.reporter_id or current_user.id,
            due_date=data.due_date,
            position=target_pos,
        )
        task = await self.task_repo.create(task)

        # Re-sequence column tasks atomically
        ordered_ids = [t.id for t in tasks]
        ordered_ids.insert(target_pos, task.id)
        
        mappings = [{"id": tid, "position": idx} for idx, tid in enumerate(ordered_ids)]
        await self.task_repo.bulk_update_positions(mappings)

        await self.session.commit()
        await self.session.refresh(task)
        return TaskResponse.model_validate(task)

    async def get_task(
        self, task_id: uuid.UUID, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this task.",
            )
        return TaskResponse.model_validate(task)

    async def update_task(
        self, task_id: uuid.UUID, data: TaskUpdate, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_EDIT):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit tasks.",
            )

        update_dict = data.model_dump(exclude_unset=True)
        updated_task = await self.task_repo.update(task_id, update_dict)
        await self.session.commit()
        await self.session.refresh(updated_task)
        return TaskResponse.model_validate(updated_task)

    async def assign_task(
        self, task_id: uuid.UUID, data: TaskAssign, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_ASSIGN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to assign tasks.",
            )

        updated_task = await self.task_repo.update(
            task_id, {"assignee_id": data.assignee_id}
        )
        await self.session.commit()
        await self.session.refresh(updated_task)
        return TaskResponse.model_validate(updated_task)

    async def change_priority(
        self, task_id: uuid.UUID, priority: Priority, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_CHANGE_PRIORITY):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to change task priority.",
            )

        updated_task = await self.task_repo.update(task_id, {"priority": priority})
        await self.session.commit()
        await self.session.refresh(updated_task)
        return TaskResponse.model_validate(updated_task)

    async def change_due_date(
        self, task_id: uuid.UUID, due_date: datetime | None, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)
        if not has_permission(role, Permission.TASK_SET_DUE_DATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to set task due date.",
            )

        updated_task = await self.task_repo.update(task_id, {"due_date": due_date})
        await self.session.commit()
        await self.session.refresh(updated_task)
        return TaskResponse.model_validate(updated_task)

    async def delete_task(self, task_id: uuid.UUID, current_user: User) -> None:
        task = await self.task_repo.get_by_id(task_id, for_update=True)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_column_workspace_role(task.column_id, current_user.id)

        # Enforce contextual TASK_DELETE_OWN vs TASK_DELETE_ANY
        is_creator = task.reporter_id == current_user.id
        can_delete = has_permission(role, Permission.TASK_DELETE_ANY) or (
            is_creator
            and has_permission(
                role, Permission.TASK_DELETE_OWN, is_resource_creator=True
            )
        )

        if not can_delete:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this task.",
            )

        column_id = task.column_id
        await self.task_repo.delete(task)

        # Close the gap in remaining tasks sequentially
        remaining_tasks = await self.task_repo.get_column_tasks(column_id, for_update=True)
        mappings = [{"id": t.id, "position": idx} for idx, t in enumerate(remaining_tasks)]
        await self.task_repo.bulk_update_positions(mappings)

        await self.session.commit()

    async def move_task(
        self, task_id: uuid.UUID, data: TaskMove, current_user: User
    ) -> TaskResponse:
        task = await self.task_repo.get_by_id(task_id, for_update=True)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        # Auth checks on source and target columns
        source_role = await self._get_column_workspace_role(task.column_id, current_user.id)
        target_role = await self._get_column_workspace_role(data.column_id, current_user.id)

        if not has_permission(source_role, Permission.TASK_MOVE) or not has_permission(
            target_role, Permission.TASK_MOVE
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to move tasks.",
            )

        if task.column_id == data.column_id:
            # Same Column Move
            tasks = await self.task_repo.get_column_tasks(task.column_id, for_update=True)
            ordered_ids = [t.id for t in tasks if t.id != task_id]
            target_pos = max(0, min(data.position, len(ordered_ids)))
            ordered_ids.insert(target_pos, task_id)

            mappings = [{"id": tid, "position": idx} for idx, tid in enumerate(ordered_ids)]
            await self.task_repo.bulk_update_positions(mappings)
        else:
            # Across Column Move
            # Lock both columns in a consistent order to avoid deadlock
            col_ids = sorted([task.column_id, data.column_id])
            src_tasks = []
            dest_tasks = []
            for col_id in col_ids:
                if col_id == task.column_id:
                    src_tasks = await self.task_repo.get_column_tasks(col_id, for_update=True)
                else:
                    dest_tasks = await self.task_repo.get_column_tasks(col_id, for_update=True)

            # 1. Clean up source column
            src_ordered_ids = [t.id for t in src_tasks if t.id != task_id]
            src_mappings = [{"id": tid, "position": idx} for idx, tid in enumerate(src_ordered_ids)]
            await self.task_repo.bulk_update_positions(src_mappings)

            # 2. Add to target column
            dest_ordered_ids = [t.id for t in dest_tasks]
            target_pos = max(0, min(data.position, len(dest_ordered_ids)))
            dest_ordered_ids.insert(target_pos, task_id)

            # 3. Direct relocation update
            await self.task_repo.move_task(task_id, data.column_id, target_pos)

            # 4. Sequentially reorder destination tasks
            dest_mappings = [{"id": tid, "position": idx} for idx, tid in enumerate(dest_ordered_ids)]
            await self.task_repo.bulk_update_positions(dest_mappings)

        await self.session.commit()
        await self.session.refresh(task)
        return TaskResponse.model_validate(task)

    async def reorder_tasks(
        self, column_id: uuid.UUID, data: TaskReorder, current_user: User
    ) -> None:
        role = await self._get_column_workspace_role(column_id, current_user.id)
        if not has_permission(role, Permission.TASK_MOVE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to reorder tasks.",
            )

        tasks = await self.task_repo.get_column_tasks(column_id, for_update=True)
        existing_ids = {t.id for t in tasks}
        incoming_ids = set(data.ordered_ids)

        if not incoming_ids.issubset(existing_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more task IDs do not belong to this column.",
            )

        mappings = [{"id": tid, "position": idx} for idx, tid in enumerate(data.ordered_ids)]
        await self.task_repo.bulk_update_positions(mappings)
        await self.session.commit()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _get_column_workspace_role(
        self, column_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceRole:
        column = await self.column_repo.get_by_id(column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Column not found.",
            )

        board = await self.board_repo.get_by_id(column.board_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Board not found.",
            )

        project = await self.project_repo.get_by_id(board.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        membership = await self.workspace_repo.get_membership(project.workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to this workspace.",
            )
        return membership.role
