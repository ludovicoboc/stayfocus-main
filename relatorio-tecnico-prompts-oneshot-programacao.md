# Relatório Técnico: Modelos de Prompts One-Shot para LLMs Agênticas em Programação

## Resumo Executivo

Este relatório apresenta as melhores práticas, técnicas e modelos de prompts one-shot para Large Language Models (LLMs) agênticas na área de programação. O documento aborda estratégias avançadas de prompt engineering, templates estruturados e exemplos práticos para maximizar a eficácia de sistemas de IA autônomos em tarefas de desenvolvimento de software.

## 1. Fundamentos do One-Shot Prompting

### 1.1 Definição e Conceitos

**One-Shot Prompting** é uma técnica de engenharia de prompts onde o modelo recebe um único exemplo bem elaborado para guiar seu comportamento em uma tarefa específica. Esta abordagem situa-se entre zero-shot (sem exemplos) e few-shot (múltiplos exemplos), oferecendo eficiência quando dados rotulados são escassos.

### 1.2 Vantagens para Programação Agêntica

**Benefícios Principais:**
- Eficiência computacional reduzida
- Rapidez na prototipagem
- Menor complexidade de prompt
- Generalização efetiva para tarefas similares
- Ideal para sistemas autônomos com recursos limitados

### 1.3 Limitações e Considerações

**Desafios:**
- Menor robustez comparado ao few-shot
- Dependência crítica da qualidade do exemplo
- Dificuldade em tarefas altamente variáveis
- Necessidade de exemplo representativo

## 2. Princípios Fundamentais para LLMs Agênticas

### 2.1 Clareza e Especificidade

**Diretrizes Essenciais:**
- Usar linguagem direta e não ambígua
- Definir explicitamente o papel do agente
- Estabelecer limitações e capacidades
- Especificar formato de saída esperado

### 2.2 Estrutura de Contexto

**Componentes Obrigatórios:**
```markdown
# Definição do Agente
Você é um [tipo de agente] especializado em [área específica].

## Suas Capacidades:
- [Lista de habilidades]

## Suas Limitações:
- [Lista de restrições]

## Tarefa Específica:
[Descrição detalhada da tarefa]

## Exemplo de Execução:
[Exemplo one-shot bem estruturado]
```

### 2.3 Formatação Consistente

**Padrões Recomendados:**
- Manter sintaxe uniforme
- Usar indentação consistente
- Incluir comentários explicativos
- Seguir convenções da linguagem

## 3. Templates de Prompts One-Shot por Categoria

### 3.1 Geração de Código Funcional

**Template Base:**
```
Tarefa: Criar uma função [linguagem] que [funcionalidade específica].

Exemplo:
Entrada: [parâmetros de entrada]
Saída:
```python
def exemplo_funcao(parametros):
    """
    Descrição clara da função.
    
    Args:
        parametros: Descrição dos parâmetros
        
    Returns:
        tipo: Descrição do retorno
    """
    # Implementação com comentários
    return resultado
```

Agora implemente:
Entrada: [novos parâmetros]
Saída:
```

### 3.2 Debugging e Correção de Código

**Template Estruturado:**
```
Você é um agente de debugging especializado em [linguagem].

Analise o código abaixo e identifique/corrija o erro:

Exemplo:
Código com erro:
```python
def calcular_media(numeros):
    return sum(numeros) / len(numeros)  # Erro: divisão por zero
```

Erro identificado: Divisão por zero quando lista vazia
Código corrigido:
```python
def calcular_media(numeros):
    if not numeros:
        return 0
    return sum(numeros) / len(numeros)
```

Agora analise este código:
[código para análise]
```

### 3.3 Refatoração e Otimização

**Template de Melhoria:**
```
Agente de refatoração: Melhore o código seguindo princípios SOLID e boas práticas.

Exemplo de refatoração:
Código original:
```python
def processar(dados):
    # Código monolítico e difícil de manter
    resultado = []
    for item in dados:
        if item > 0:
            resultado.append(item * 2)
    return resultado
```

Código refatorado:
```python
def filtrar_positivos(dados):
    """Filtra apenas números positivos."""
    return [item for item in dados if item > 0]

def duplicar_valores(dados):
    """Duplica os valores da lista."""
    return [item * 2 for item in dados]

def processar(dados):
    """Processa dados aplicando filtro e duplicação."""
    positivos = filtrar_positivos(dados)
    return duplicar_valores(positivos)
```

Refatore este código:
[código para refatoração]
```

### 3.4 Implementação de Algoritmos

**Template Algorítmico:**
```
Implemente o algoritmo [nome] em [linguagem] com complexidade otimizada.

Exemplo - Busca Binária:
Requisitos:
- Entrada: Lista ordenada e valor alvo
- Saída: Índice do elemento ou -1
- Complexidade: O(log n)

Implementação:
```python
def busca_binaria(lista, alvo):
    """
    Implementa busca binária em lista ordenada.
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    esquerda, direita = 0, len(lista) - 1
    
    while esquerda <= direita:
        meio = (esquerda + direita) // 2
        
        if lista[meio] == alvo:
            return meio
        elif lista[meio] < alvo:
            esquerda = meio + 1
        else:
            direita = meio - 1
    
    return -1
```

Agora implemente: [algoritmo solicitado]
```

## 4. Técnicas Avançadas para Sistemas Agênticos

### 4.1 Chain-of-Thought para Programação

**Estrutura de Raciocínio:**
```
Resolva este problema de programação passo a passo:

Exemplo:
Problema: Encontrar o segundo maior elemento em uma lista.

Raciocínio:
1. Primeiro, preciso entender os casos especiais (lista vazia, um elemento)
2. Depois, posso usar duas variáveis para rastrear maior e segundo maior
3. Itero pela lista atualizando essas variáveis conforme necessário
4. Retorno o segundo maior ou None se não existir

Implementação:
```python
def segundo_maior(lista):
    if len(lista) < 2:
        return None
    
    maior = segundo = float('-inf')
    
    for num in lista:
        if num > maior:
            segundo = maior
            maior = num
        elif num > segundo and num != maior:
            segundo = num
    
    return segundo if segundo != float('-inf') else None
```

Agora resolva: [novo problema]
```

### 4.2 Program-of-Thought (PoT)

**Template PoT:**
```
Gere código que resolve o problema através de passos computacionais:

Exemplo:
Problema: Calcular a média ponderada de notas.

Solução em código:
```python
# Passo 1: Definir dados
notas = [8.5, 7.0, 9.2]
pesos = [2, 3, 1]

# Passo 2: Calcular soma ponderada
soma_ponderada = sum(nota * peso for nota, peso in zip(notas, pesos))

# Passo 3: Calcular soma dos pesos
soma_pesos = sum(pesos)

# Passo 4: Calcular média ponderada
media_ponderada = soma_ponderada / soma_pesos

print(f"Média ponderada: {media_ponderada}")
```

Resolva computacionalmente: [problema]
```

### 4.3 ReAct (Reasoning + Acting)

**Template ReAct para Programação:**
```
Você é um agente programador que combina raciocínio e ação.

Exemplo:
Tarefa: Implementar um sistema de cache LRU.

Pensamento: Preciso de uma estrutura que mantenha ordem de acesso e permita remoção eficiente.
Ação: Vou usar um dicionário combinado com uma lista duplamente ligada.
Observação: Isso me dará O(1) para get, put e remoção.

Implementação:
```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key):
        if key in self.cache:
            # Move para o final (mais recente)
            self.cache.move_to_end(key)
            return self.cache[key]
        return -1
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        
        if len(self.cache) > self.capacity:
            # Remove o menos recente
            self.cache.popitem(last=False)
```

Agora resolva: [nova tarefa]
```

## 5. Padrões Específicos para Diferentes Linguagens

### 5.1 Python - Padrão Pythônico

**Template Python:**
```
Escreva código Python seguindo PEP 8 e princípios pythônicos.

Exemplo:
Tarefa: Processar lista de dicionários.

Código pythônico:
```python
def processar_usuarios(usuarios):
    """
    Processa lista de usuários aplicando filtros e transformações.
    
    Args:
        usuarios (List[Dict]): Lista de dicionários com dados de usuários
        
    Returns:
        List[Dict]: Usuários processados
    """
    return [
        {
            'nome': usuario['nome'].title(),
            'email': usuario['email'].lower(),
            'idade': usuario['idade']
        }
        for usuario in usuarios
        if usuario.get('ativo', False) and usuario.get('idade', 0) >= 18
    ]
```

Implemente: [tarefa específica]
```

### 5.2 JavaScript - Padrão Moderno

**Template JavaScript:**
```
Implemente usando JavaScript moderno (ES6+) com async/await quando necessário.

Exemplo:
Tarefa: Buscar dados de API com tratamento de erro.

Implementação:
```javascript
async function buscarDadosUsuario(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        
        return {
            success: true,
            data: userData
        };
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
```

Implemente: [funcionalidade solicitada]
```

## 6. Métricas e Avaliação de Qualidade

### 6.1 Critérios de Avaliação

**Dimensões de Qualidade:**
- **Funcionalidade**: O código executa corretamente?
- **Legibilidade**: O código é claro e bem documentado?
- **Eficiência**: A solução é otimizada?
- **Manutenibilidade**: O código segue boas práticas?
- **Robustez**: Trata casos extremos adequadamente?

### 6.2 Template de Avaliação

**Prompt de Revisão:**
```
Avalie o código gerado nos seguintes critérios:

Exemplo de avaliação:
Código:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

Avaliação:
- Funcionalidade: ✓ Correto
- Legibilidade: ✓ Claro
- Eficiência: ✗ O(2^n) - ineficiente
- Manutenibilidade: ✓ Simples
- Robustez: ✗ Não trata n negativo

Sugestão de melhoria: Usar programação dinâmica.

Avalie este código: [código para avaliação]
```

## 7. Implementação Prática para Sistemas Agênticos

### 7.1 Arquitetura de Prompt para Agentes

**Estrutura Modular:**
```
[CONTEXTO_SISTEMA] + [DEFINIÇÃO_PAPEL] + [EXEMPLO_ONESHOT] + [TAREFA_ESPECÍFICA]
```

### 7.2 Pipeline de Processamento

**Fluxo Recomendado:**
1. **Análise da Tarefa**: Classificar tipo de problema
2. **Seleção de Template**: Escolher template apropriado
3. **Customização**: Adaptar exemplo para contexto
4. **Execução**: Aplicar prompt one-shot
5. **Validação**: Verificar qualidade da saída

### 7.3 Otimização Contínua

**Estratégias de Melhoria:**
- Coletar feedback sobre qualidade do código
- Ajustar exemplos baseado em resultados
- Manter biblioteca de templates testados
- Implementar sistema de versionamento de prompts

## 8. Casos de Uso Específicos

### 8.1 Desenvolvimento Web

**Template Full-Stack:**
```
Crie um componente [framework] que [funcionalidade].

Exemplo - React Hook personalizado:
```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Erro ao ler localStorage:', error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    };

    return [storedValue, setValue];
}
```

Implemente: [componente solicitado]
```

### 8.2 Análise de Dados

**Template Data Science:**
```
Implemente análise de dados usando [biblioteca] para [objetivo].

Exemplo - Análise exploratória:
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def analisar_vendas(df):
    """
    Realiza análise exploratória de dados de vendas.
    
    Args:
        df (pd.DataFrame): DataFrame com dados de vendas
        
    Returns:
        dict: Resumo da análise
    """
    # Estatísticas descritivas
    resumo = {
        'total_vendas': df['valor'].sum(),
        'media_vendas': df['valor'].mean(),
        'vendas_por_mes': df.groupby('mes')['valor'].sum()
    }
    
    # Visualizações
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    
    # Distribuição de vendas
    df['valor'].hist(bins=20, ax=axes[0,0])
    axes[0,0].set_title('Distribuição de Vendas')
    
    # Vendas por mês
    resumo['vendas_por_mes'].plot(kind='bar', ax=axes[0,1])
    axes[0,1].set_title('Vendas por Mês')
    
    plt.tight_layout()
    plt.show()
    
    return resumo
```

Analise: [dataset específico]
```

## 9. Conclusões e Recomendações

### 9.1 Melhores Práticas Consolidadas

**Diretrizes Essenciais:**
- Sempre incluir contexto completo do agente
- Usar exemplos representativos e bem documentados
- Manter consistência na formatação
- Incluir tratamento de casos extremos
- Especificar claramente limitações e capacidades

### 9.2 Implementação Gradual

**Estratégia de Adoção:**
1. **Fase 1**: Implementar templates básicos
2. **Fase 2**: Desenvolver templates especializados
3. **Fase 3**: Criar sistema de avaliação automática
4. **Fase 4**: Otimizar baseado em métricas

### 9.3 Futuro dos Prompts Agênticos

**Tendências Emergentes:**
- Prompts auto-adaptativos
- Integração com ferramentas de desenvolvimento
- Sistemas de feedback contínuo
- Personalização baseada em contexto de projeto

---

**Referências:**
- Documentação oficial de prompt engineering
- Estudos acadêmicos sobre LLMs agênticas
- Melhores práticas da comunidade de desenvolvedores
- Análises comparativas de técnicas de prompting
