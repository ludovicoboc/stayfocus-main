"""Update User model for fastapi-users compatibility

Revision ID: c39aa826747e
Revises: 37c471cfbef5
Create Date: 2025-06-05 00:05:40.468369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c39aa826747e'
down_revision: Union[str, None] = '37c471cfbef5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
