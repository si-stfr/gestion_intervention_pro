from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from database import Base


class RefreshToken(Base):

    __tablename__ = "refresh_tokens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    token = Column(
        String(500),
        nullable=False,
        unique=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="refresh_tokens"
    )