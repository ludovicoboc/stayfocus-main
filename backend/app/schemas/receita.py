from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
import uuid

class IngredienteBase(BaseModel):
    nome: str = Field(..., example="Farinha de Trigo")
    quantidade: float = Field(..., example=2.5)
    unidade: str = Field(..., example="xícara")

class IngredienteCreate(IngredienteBase):
    pass

class Ingrediente(IngredienteBase):
    id: uuid.UUID
    receita_id: uuid.UUID

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2

class ReceitaBase(BaseModel):
    nome: str = Field(..., example="Bolo de Cenoura")
    descricao: Optional[str] = Field(None, example="Bolo simples e fofinho.")
    categorias: List[str] = Field(default_factory=list, example=["Sobremesa", "Café da Tarde"])
    tags: List[str] = Field(default_factory=list, example=["Simples", "Rápido"])
    tempo_preparo: Optional[int] = Field(None, ge=0, example=60) # minutes
    porcoes: Optional[int] = Field(None, ge=1, example=8)
    calorias: Optional[str] = Field(None, example="250 kcal por porção")
    imagem: Optional[HttpUrl] = Field(None, example="http://example.com/bolo.jpg")
    passos: List[str] = Field(default_factory=list, example=["Misture os ingredientes secos.", "Adicione os ovos."])

class ReceitaCreate(ReceitaBase):
    ingredientes: List[IngredienteCreate] = Field(default_factory=list)

class ReceitaUpdate(ReceitaBase):
    nome: Optional[str] = None
    # Allow updating all fields
    descricao: Optional[str] = None
    categorias: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    tempo_preparo: Optional[int] = None
    porcoes: Optional[int] = None
    calorias: Optional[str] = None
    imagem: Optional[HttpUrl] = None
    passos: Optional[List[str]] = None
    # Ingredientes updates might be handled via separate endpoints

class Receita(ReceitaBase):
    id: uuid.UUID
    user_id: uuid.UUID # Assuming receitas are user-specific
    ingredientes: List[Ingrediente] = Field(default_factory=list)
    is_favorito: bool = False # Will be dynamically set based on user's favorites

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2
