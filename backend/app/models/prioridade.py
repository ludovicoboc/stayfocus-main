import uuid
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Enum as SAEnum, func, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
from app.schemas.prioridade import TipoPrioridade # Re-using enum from Pydantic

class Prioridade(Base):
    __tablename__ = "prioridades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    texto = Column(String, nullable=False)
    concluida = Column(Boolean, default=False, nullable=False)
    data = Column(Date, nullable=False, index=True)
    tipo = Column(SAEnum(TipoPrioridade), nullable=False, default=TipoPrioridade.geral)
    origem_id = Column(UUID(as_uuid=True), nullable=True, index=True) # FK to another table if needed, e.g. concursos.id

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    user = relationship("User") # Relationship to User
