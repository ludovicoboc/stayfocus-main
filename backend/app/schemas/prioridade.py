from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
import uuid
from datetime import date

class TipoPrioridade(str, Enum):
    geral = "geral"
    concurso = "concurso"
    # Add other types as needed

class PrioridadeBase(BaseModel):
    texto: str = Field(..., example="Revisar Direito Administrativo")
    concluida: bool = False
    tipo: TipoPrioridade = Field(TipoPrioridade.geral)
    origem_id: Optional[uuid.UUID] = Field(None, description="ID da origem, ex: concursoId, se aplicável")

class PrioridadeCreate(PrioridadeBase):
    data: date = Field(default_factory=date.today) # Defaults to today on creation

class PrioridadeUpdate(BaseModel):
    texto: Optional[str] = None
    concluida: Optional[bool] = None
    tipo: Optional[TipoPrioridade] = None
    origem_id: Optional[uuid.UUID] = None
    data: Optional[date] = None # Allow moving priority to another date

class Prioridade(PrioridadeBase):
    id: uuid.UUID
    user_id: uuid.UUID # Assuming prioridades are user-specific
    data: date

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2
