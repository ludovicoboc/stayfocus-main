from .llm_integration import GerarQuestaoRequest, GerarQuestaoResponse, QuestaoLLM
# Original Schemas (keep them if they are used elsewhere or rename/remove if fully replaced)
# For now, we assume User, UserCreate, UserUpdate, UserBase might be replaced by fastapi-users versions
# or need careful integration. Let's prioritize fastapi-users schema names for user auth.

from .user import UserRead, UserCreate, UserUpdate # fastapi-users compatible schemas

# Schemas for other models (Concurso, Receita, Prioridade)
from .concurso import Concurso, ConcursoCreate, ConcursoUpdate, ConcursoBase, ConteudoProgramatico, ConteudoProgramaticoCreate
from .receita import Receita, ReceitaCreate, ReceitaUpdate, ReceitaBase, Ingrediente, IngredienteCreate
from .prioridade import Prioridade, PrioridadeCreate, PrioridadeUpdate, PrioridadeBase, TipoPrioridade

# It's good practice to also define a generic ID schema if not already present
from pydantic import BaseModel, Field #Field was missing
from datetime import datetime # Added for UserRead schema type hint
import uuid

class IDModel(BaseModel):
    id: uuid.UUID
