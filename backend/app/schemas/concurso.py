from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from enum import Enum
import uuid
from datetime import date

class ConteudoProgramaticoBase(BaseModel):
    disciplina: str = Field(..., example="Direito Constitucional")
    topicos: List[str] = Field(default_factory=list, example=["Controle de Constitucionalidade", "Direitos Fundamentais"])
    progresso: int = Field(0, ge=0, le=100, example=50)

class ConteudoProgramaticoCreate(ConteudoProgramaticoBase):
    pass

class ConteudoProgramatico(ConteudoProgramaticoBase):
    id: uuid.UUID
    concurso_id: uuid.UUID

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2

class ConcursoStatus(str, Enum):
    planejado = "planejado"
    inscrito = "inscrito"
    estudando = "estudando"
    realizado = "realizado"
    aguardando_resultado = "aguardando_resultado"

class ConcursoBase(BaseModel):
    titulo: str = Field(..., example="Concurso TJSP Escrevente")
    organizadora: Optional[str] = Field(None, example="VUNESP")
    data_inscricao: Optional[date] = Field(None)
    data_prova: Optional[date] = Field(None)
    edital: Optional[HttpUrl] = Field(None, example="http://vunesp.com.br/edital.pdf")
    status: ConcursoStatus = Field(ConcursoStatus.planejado)

class ConcursoCreate(ConcursoBase):
    conteudo_programatico: List[ConteudoProgramaticoCreate] = Field(default_factory=list)

class ConcursoUpdate(ConcursoBase):
    titulo: Optional[str] = None
    organizadora: Optional[str] = None
    data_inscricao: Optional[date] = None
    data_prova: Optional[date] = None
    edital: Optional[HttpUrl] = None
    status: Optional[ConcursoStatus] = None
    # Conteudo programatico updates might be handled via separate endpoints

class Concurso(ConcursoBase):
    id: uuid.UUID
    user_id: uuid.UUID # Assuming concursos are user-specific
    conteudo_programatico: List[ConteudoProgramatico] = Field(default_factory=list)

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2
