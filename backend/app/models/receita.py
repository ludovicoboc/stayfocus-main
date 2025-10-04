import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey, Table, func, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB # Using JSONB for lists
from app.db.base_class import Base

# Association table for user's favorite recipes (Many-to-Many User <-> Receita)
user_favorite_recipes = Table('user_favorite_recipes', Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('receita_id', UUID(as_uuid=True), ForeignKey('receitas.id'), primary_key=True)
)

class Receita(Base):
    __tablename__ = "receitas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True) # Creator/owner

    nome = Column(String, nullable=False, index=True)
    descricao = Column(Text, nullable=True)
    categorias = Column(JSONB, nullable=True, default=lambda: []) # List of strings
    tags = Column(JSONB, nullable=True, default=lambda: [])       # List of strings
    tempo_preparo = Column(Integer, nullable=True) # In minutes
    porcoes = Column(Integer, nullable=True)
    calorias = Column(String, nullable=True) # e.g., "250 kcal per porção"
    imagem = Column(String, nullable=True)   # URL or path
    passos = Column(JSONB, nullable=True, default=lambda: []) # List of strings (steps)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    ingredientes = relationship("Ingrediente", back_populates="receita", cascade="all, delete-orphan")
    user = relationship("User") # Relationship to User (creator)

    # Relationship for users who favorited this recipe (many-to-many)
    # This is not directly on the Receita model but accessible via User or the association table.

class Ingrediente(Base):
    __tablename__ = "ingredientes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    receita_id = Column(UUID(as_uuid=True), ForeignKey("receitas.id"), nullable=False, index=True)

    nome = Column(String, nullable=False)
    quantidade = Column(String, nullable=False) # Changed to String to support "2.5", "1/2", etc. Pydantic handles validation.
    unidade = Column(String, nullable=False)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    receita = relationship("Receita", back_populates="ingredientes")
