import re
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.mentions.models import Mention
from app.mentions.repository import MentionRepository
from app.users.repository import UserRepository

# Match @username where username contains alphanumeric and underscores
MENTION_REGEX = re.compile(r"@([a-zA-Z0-9_]+)")


class MentionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.mention_repo = MentionRepository(session)
        self.user_repo = UserRepository(session)

    def extract_usernames(self, content: str) -> set[str]:
        """Extract all unique usernames prefix with '@' from content."""
        if not content:
            return set()
        return set(MENTION_REGEX.findall(content))

    async def process_mentions(
        self, comment_id: uuid.UUID, content: str
    ) -> list[Mention]:
        """
        Extract mentions, resolve users, create new mentions, and remove stale ones.
        Prepares notifications trigger TODOs.
        """
        usernames = self.extract_usernames(content)

        # Resolve usernames to existing User objects
        resolved_users = []
        for username in usernames:
            user = await self.user_repo.get_by_username(username)
            if user:
                resolved_users.append(user)

        resolved_user_ids = {u.id for u in resolved_users}

        # Fetch existing mentions for the comment
        existing_mentions = await self.mention_repo.get_comment_mentions(comment_id)
        existing_user_ids = {m.mentioned_user_id for m in existing_mentions}

        # 1. Create new mentions
        new_mentions = []
        for user in resolved_users:
            if user.id not in existing_user_ids:
                mention = Mention(
                    comment_id=comment_id,
                    mentioned_user_id=user.id,
                )
                created = await self.mention_repo.create(mention)
                new_mentions.append(created)

                # TODO: Trigger notification to user.id for being @mentioned (future integration)

        # 2. Remove stale mentions
        for m in existing_mentions:
            if m.mentioned_user_id not in resolved_user_ids:
                await self.mention_repo.delete(m)

        await self.session.flush()
        return new_mentions
