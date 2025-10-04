from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class QuestaoLLM(BaseModel):
    questao: str = Field(..., example="Qual a capital da França?")
    alternativas: List[str] = Field(..., example=["Paris", "Londres", "Berlin", "Madri"])
    correta: str = Field(..., example="A") # Assuming "A", "B", "C", "D"
    disciplina: str = Field(..., example="Geografia")
    topico: Optional[str] = Field(None, example="Capitais Europeias")

class GerarQuestaoRequest(BaseModel):
    disciplina: str = Field(..., example="História")
    topico: Optional[str] = Field(None, example="Revolução Francesa")
    resumo: Optional[str] = Field(None, example="Um breve resumo do contexto para a questão...")
    quantidade: int = Field(..., gt=0, example=1)
    dificuldade: Optional[Literal['facil', 'medio', 'dificil']] = Field('facil')
    max_tokens: Optional[int] = Field(2000, gt=0)

class GerarQuestaoResponse(BaseModel):
    questoes: List[QuestaoLLM]
