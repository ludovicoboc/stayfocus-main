# Import all models here so that Base has them registered when Alembic runs
from .user import User
from .concurso import Concurso, ConteudoProgramatico
from .receita import Receita, Ingrediente # user_favorite_recipes table is also defined here
from .prioridade import Prioridade
