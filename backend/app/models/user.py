from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    guest = "guest"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.guest, nullable=False)
    is_active = Column(Boolean, default=True)
