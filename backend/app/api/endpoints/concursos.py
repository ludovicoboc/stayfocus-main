import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload # selectinload for eager loading relationships

from app.db.session import SessionLocal # Your SessionLocal
from app.models.concurso import Concurso, ConteudoProgramatico as ConteudoProgramaticoModel
from app.models.user import User # Your User model
from app.schemas.concurso import Concurso as ConcursoSchema, ConcursoCreate, ConcursoUpdate, ConteudoProgramatico as ConteudoProgramaticoSchema, ConteudoProgramaticoCreate
from app.users import fastapi_users_instance # For current_user dependency

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for current authenticated active user
current_active_user = fastapi_users_instance.current_user(active=True)

@router.post("/", response_model=ConcursoSchema, status_code=status.HTTP_201_CREATED)
def create_concurso(
    *,
    db: Session = Depends(get_db),
    concurso_in: ConcursoCreate,
    current_user: User = Depends(current_active_user)
):
    """
    Create a new concurso for the current authenticated user.
    """
    db_concurso = Concurso(
        user_id=current_user.id,
        titulo=concurso_in.titulo,
        organizadora=concurso_in.organizadora,
        data_inscricao=concurso_in.data_inscricao,
        data_prova=concurso_in.data_prova,
        edital=str(concurso_in.edital) if concurso_in.edital else None, # Ensure HttpUrl is converted to str for DB
        status=concurso_in.status
    )
    db.add(db_concurso)
    db.flush() # Flush to get db_concurso.id for conteudos

    if concurso_in.conteudo_programatico:
        for cp_in in concurso_in.conteudo_programatico:
            db_cp = ConteudoProgramaticoModel(
                concurso_id=db_concurso.id,
                disciplina=cp_in.disciplina,
                topicos=cp_in.topicos, # Assumes topicos is List[str], JSONB handles it
                progresso=cp_in.progresso
            )
            db.add(db_cp)
            # db_concurso.conteudos_programaticos.append(db_cp) # Alternative way if relationship configured for append

    db.commit()
    db.refresh(db_concurso) # Refresh to load relationships like conteudos_programaticos

    # Eager load conteudos_programaticos for the response using a more explicit query after commit,
    # as db.refresh might not always populate relationships added via db.add(db_cp) directly
    # without specific relationship configurations (like back_populates with specific event listeners).
    # For clarity and ensuring the response model is correctly populated:
    db_concurso_loaded = db.query(Concurso).options(selectinload(Concurso.conteudos_programaticos)).filter(Concurso.id == db_concurso.id).first()
    return db_concurso_loaded


@router.get("/", response_model=List[ConcursoSchema])
def read_concursos(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(current_active_user)
):
    """
    Retrieve all concursos for the current authenticated user.
    Includes eager loading of conteudos_programaticos.
    """
    concursos = (
        db.query(Concurso)
        .filter(Concurso.user_id == current_user.id)
        .options(selectinload(Concurso.conteudos_programaticos)) # Eager load
        .order_by(Concurso.data_prova.desc().nullslast(), Concurso.created_at.desc()) # Example ordering
        .offset(skip)
        .limit(limit)
        .all()
    )
    return concursos

# Placeholder for other CRUD operations:
# GET /{concurso_id}
# PUT /{concurso_id}
# DELETE /{concurso_id}
# Endpoints for ConteudoProgramatico (e.g., add/update/delete specific to a concurso)


@router.get("/{concurso_id}", response_model=ConcursoSchema)
def read_concurso(
    *,
    db: Session = Depends(get_db),
    concurso_id: uuid.UUID,
    current_user: User = Depends(current_active_user)
):
    """
    Get a specific concurso by ID, belonging to the current user.
    """
    concurso = (
        db.query(Concurso)
        .filter(Concurso.id == concurso_id, Concurso.user_id == current_user.id)
        .options(selectinload(Concurso.conteudos_programaticos)) # Eager load
        .first()
    )
    if not concurso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concurso not found")
    return concurso

@router.put("/{concurso_id}", response_model=ConcursoSchema)
def update_concurso(
    *,
    db: Session = Depends(get_db),
    concurso_id: uuid.UUID,
    concurso_in: ConcursoUpdate, # Using ConcursoUpdate Pydantic schema
    current_user: User = Depends(current_active_user)
):
    """
    Update a concurso.
    This version updates only the Concurso fields.
    Updating ConteudoProgramatico items might need a more complex logic or separate endpoints.
    """
    db_concurso = (
        db.query(Concurso)
        .filter(Concurso.id == concurso_id, Concurso.user_id == current_user.id)
        .first()
    )
    if not db_concurso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concurso not found")

    update_data = concurso_in.model_dump(exclude_unset=True) # Pydantic V2 (or .dict(exclude_unset=True) for V1)

    for field, value in update_data.items():
        if field == "edital" and value is not None: # Handle HttpUrl to str conversion
             setattr(db_concurso, field, str(value))
        else:
            setattr(db_concurso, field, value)

    # Handling ConteudoProgramatico updates:
    # This is a complex part. For a full update, you might:
    # 1. Delete all existing conteudos for this concurso and recreate from concurso_in.
    # 2. Identify changes: new CPs, CPs to update, CPs to delete.
    # For simplicity in this step, we'll assume ConcursoUpdate schema does not directly
    # contain a list of ConteudoProgramatico to update. If it did, logic would be needed here.
    # The current ConcursoUpdate schema in the plan does not include conteudos.
    # If  could contain  for update:
    # if concurso_in.conteudo_programatico is not None:
    #     # Delete existing ones first (simplest approach)
    #     db.query(ConteudoProgramaticoModel).filter(ConteudoProgramaticoModel.concurso_id == db_concurso.id).delete()
    #     for cp_in in concurso_in.conteudo_programatico:
    #         db_cp = ConteudoProgramaticoModel(
    #             concurso_id=db_concurso.id,
    #             **cp_in.model_dump() # Pydantic V2
    #         )
    #         db.add(db_cp)

    db.add(db_concurso)
    db.commit()
    db.refresh(db_concurso)
    # Eager load for response
    db_concurso_loaded = db.query(Concurso).options(selectinload(Concurso.conteudos_programaticos)).filter(Concurso.id == db_concurso.id).first()
    return db_concurso_loaded


@router.delete("/{concurso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_concurso(
    *,
    db: Session = Depends(get_db),
    concurso_id: uuid.UUID,
    current_user: User = Depends(current_active_user)
):
    """
    Delete a concurso.
    """
    db_concurso = (
        db.query(Concurso)
        .filter(Concurso.id == concurso_id, Concurso.user_id == current_user.id)
        .first()
    )
    if not db_concurso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concurso not found")

    db.delete(db_concurso)
    db.commit()
    return # No content response

# TODO: Add endpoints for managing ConteudoProgramatico items specifically,
# e.g., POST /concursos/{concurso_id}/conteudos, PUT /conteudos/{cp_id}, DELETE /conteudos/{cp_id}
