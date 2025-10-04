import httpx # Using httpx for async HTTP requests
from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.config import settings
from app.schemas.llm_integration import GerarQuestaoRequest, GerarQuestaoResponse, QuestaoLLM
from app.users import fastapi_users_instance # To protect the endpoint if needed
# Import User model for type hinting if Depends(current_active_user) is used
# from app.models.user import User

# Current active user dependency (optional, can be added to router or specific paths)
# current_active_user = fastapi_users_instance.current_user(active=True)

router = APIRouter()

PPLX_API_URL = "https://api.perplexity.ai/chat/completions"
PPLX_MODEL = "sonar-medium-online" # Or "sonar-small-online", "sonar-medium-chat", etc. Or use from config.

@router.post("/gerar-questao", response_model=GerarQuestaoResponse)
async def gerar_questao_endpoint(
    request_data: GerarQuestaoRequest = Body(...),
    # user: User = Depends(current_active_user) # Uncomment to protect endpoint
):
    if not settings.PPLX_API_KEY or settings.PPLX_API_KEY == "your_perplexity_api_key_here":
        raise HTTPException(status_code=500, detail="PPLX_API_KEY not configured on the server or is using placeholder.")

    headers = {
        "Authorization": f"Bearer {settings.PPLX_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Construct the prompt based on the original TypeScript logic
    instrucao_dificuldade = ''
    if request_data.dificuldade == 'facil':
        instrucao_dificuldade = 'As questões devem ser diretas, sem exigir raciocínio complexo.'
    elif request_data.dificuldade == 'medio':
        instrucao_dificuldade = 'As questões devem exigir reflexão moderada, com enunciados mais elaborados.'
    elif request_data.dificuldade == 'dificil':
        instrucao_dificuldade = 'As questões devem ser desafiadoras, exigindo análise crítica e interpretação profunda.'

    # Ensure alternatives are labeled A, B, C, D if not explicitly asked in LLM output schema
    prompt = f"""
Gere {request_data.quantidade} questões objetivas de múltipla escolha, cada uma com 4 alternativas (rotuladas A, B, C, D) e apenas uma correta.
Responda EXCLUSIVAMENTE no formato JSON especificado abaixo, dentro de um bloco JSON. Nada fora do bloco.
O JSON deve ser uma lista de objetos, onde cada objeto representa uma questão.

Formato de cada objeto questão:
{{
  "questao": "Enunciado completo da questão aqui.",
  "alternativas": ["Texto da Alternativa A", "Texto da Alternativa B", "Texto da Alternativa C", "Texto da Alternativa D"],
  "correta": "Letra da alternativa correta (ex: A, B, C ou D)",
  "disciplina": "{request_data.disciplina}",
  "topico": "{request_data.topico or ''}"
}}

Disciplina: {request_data.disciplina}
Tópico: {request_data.topico or 'Geral'}
Nível de dificuldade: {request_data.dificuldade or 'Não especificado'}. {instrucao_dificuldade}
Contexto/Resumo fornecido:
{request_data.resumo or '[Nenhum resumo fornecido]'}
"""

    payload = {
        "model": PPLX_MODEL,
        "messages": [
            {"role": "system", "content": "Você é um especialista em gerar questões para concursos e provas, formatando a saída estritamente em JSON conforme solicitado."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": request_data.max_tokens,
        # "temperature": 0.0, # For deterministic output, if desired
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(PPLX_API_URL, json=payload, headers=headers, timeout=60.0) # Increased timeout
            response.raise_for_status() # Raises an exception for 4XX/5XX responses

            api_response_data = response.json()

            # Extract content and parse
            llm_output_str = api_response_data.get("choices", [{}])[0].get("message", {}).get("content", "")

            if not llm_output_str:
                raise HTTPException(status_code=500, detail="LLM returned empty content.")

            # Remove potential markdown ```json ... ``` block
            if llm_output_str.startswith("```json"):
                llm_output_str = llm_output_str[len("```json"):].strip()
            if llm_output_str.startswith("```"): # General markdown code block
                llm_output_str = llm_output_str[len("```"):].strip()
            if llm_output_str.endswith("```"):
                llm_output_str = llm_output_str[:-len("```")].strip()

            import json
            try:
                parsed_questoes_data = json.loads(llm_output_str)

                # Ensure it's a list, as per our QuestaoLLM definition in GerarQuestaoResponse
                # This logic handles cases where the LLM might wrap the list in a dict (e.g. {"questoes": [...]})
                actual_questoes_list = []
                if isinstance(parsed_questoes_data, list):
                    actual_questoes_list = parsed_questoes_data
                elif isinstance(parsed_questoes_data, dict) and "questoes" in parsed_questoes_data and isinstance(parsed_questoes_data["questoes"], list):
                    actual_questoes_list = parsed_questoes_data["questoes"]
                else: # If it's a single object, wrap it in a list if it matches QuestaoLLM
                    try:
                        QuestaoLLM(**parsed_questoes_data) # Try to validate as a single object
                        actual_questoes_list = [parsed_questoes_data]
                    except Exception: # Not a single valid QuestaoLLM object
                         raise ValueError("LLM response is not in the expected list format or a single question object.")

                validated_questoes = [QuestaoLLM(**q) for q in actual_questoes_list]
                return GerarQuestaoResponse(questoes=validated_questoes)
            except (json.JSONDecodeError, ValueError, TypeError) as e:
                print(f"Error parsing LLM JSON output: {e}")
                print(f"Raw LLM output was: {llm_output_str}")
                raise HTTPException(status_code=500, detail=f"Error parsing response from LLM: {str(e)}. Raw output: {llm_output_str[:500]}")

        except httpx.HTTPStatusError as e:
            error_detail = f"LLM API request failed with status {e.response.status_code}."
            try:
                error_body = e.response.json()
                error_detail += f" Details: {error_body}"
            except: # Use a generic except clause here as e.response.json() could fail for various reasons
                pass
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except httpx.RequestError as e: # Catches other httpx errors like connection errors
            raise HTTPException(status_code=503, detail=f"Request to LLM API failed: {e}")
