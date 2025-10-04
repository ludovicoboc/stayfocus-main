import uuid
from sqlalchemy import Column, String, Date, Enum as SAEnum, ForeignKey, Integer, Text, func, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB # Using JSONB for list of strings (topicos)
from app.db.base_class import Base
from app.schemas.concurso import ConcursoStatus # Re-using enum from Pydantic for consistency

class Concurso(Base):
    __tablename__ = "concursos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    titulo = Column(String, nullable=False, index=True)
    organizadora = Column(String, nullable=True)
    data_inscricao = Column(Date, nullable=True)
    data_prova = Column(Date, nullable=True)
    edital = Column(String, nullable=True) # Store as string, validation at schema level
    status = Column(SAEnum(ConcursoStatus), nullable=False, default=ConcursoStatus.planejado)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship to ConteudoProgramatico
    conteudos_programaticos = relationship("ConteudoProgramatico", back_populates="concurso", cascade="all, delete-orphan")

    user = relationship("User") # Relationship to User

class ConteudoProgramatico(Base):
    __tablename__ = "conteudos_programaticos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concurso_id = Column(UUID(as_uuid=True), ForeignKey("concursos.id"), nullable=False, index=True)

    disciplina = Column(String, nullable=False)
    # Storing list of strings as JSONB array. Another option is a separate table for topicos.
    topicos = Column(JSONB, nullable=False, default=lambda: [])
    progresso = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    concurso = relationship("Concurso", back_populates="conteudos_programaticos")
