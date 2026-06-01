from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import mapped_column, MappedColumn


class TimestampMixin:
    """Mixin that adds created_at and updated_at columns."""

    created_at: MappedColumn[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    updated_at: MappedColumn[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
