/**
 * SCRIPT DE MIGRAÇÃO DE DADOS - MÓDULO ALIMENTAÇÃO
 * Migra dados do localStorage para a nova arquitetura dual (Supabase/FastAPI)
 */

class AlimentacaoMigration {
  constructor(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
  }

  /**
   * Executa a migração completa dos dados de alimentação
   */
  async executeMigration() {
    console.log('🚀 Iniciando migração de dados do módulo alimentação...');
    
    try {
      // 1. Backup dos dados atuais
      await this.backupLocalStorageData();
      
      // 2. Migrar dados de planejamento de refeições
      await this.migrateMealPlans();
      
      // 3. Migrar registros de refeições
      await this.migrateMealRecords();
      
      // 4. Migrar dados de hidratação
      await this.migrateHydrationData();
      
      // 5. Migrar receitas
      await this.migrateRecipes();
      
      console.log('✅ Migração concluída com sucesso!');
      return { success: true, message: 'Migração realizada com sucesso' };
      
    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
      await this.rollbackMigration();
      return { success: false, error: error.message };
    }
  }

  /**
   * Faz backup dos dados do localStorage
   */
  async backupLocalStorageData() {
    console.log('📦 Criando backup dos dados locais...');
    
    const backup = {
      alimentacao: JSON.parse(localStorage.getItem('alimentacao-storage') || '{}'),
      receitas: JSON.parse(localStorage.getItem('receitas-storage') || '{}'),
      timestamp: new Date().toISOString()
    };
    
    // Salva backup no localStorage com timestamp
    const backupKey = `backup-alimentacao-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    console.log(`✅ Backup criado com chave: ${backupKey}`);
    return backupKey;
  }

  /**
   * Migra dados de planejamento de refeições
   */
  async migrateMealPlans() {
    console.log('🍽️ Migrando planejamento de refeições...');
    
    const alimentacaoData = JSON.parse(localStorage.getItem('alimentacao-storage') || '{}');
    const refeicoes = alimentacaoData.state?.refeicoes || alimentacaoData.refeicoes || [];
    
    if (refeicoes.length === 0) {
      console.log('ℹ️ Nenhuma refeição planejada encontrada');
      return;
    }

    for (const refeicao of refeicoes) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/meal-plans`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            time: refeicao.horario,
            description: refeicao.descricao
          })
        });

        if (!response.ok) {
          throw new Error(`Erro ao migrar refeição: ${response.statusText}`);
        }

        console.log(`✅ Refeição migrada: ${refeicao.descricao} (${refeicao.horario})`);
      } catch (error) {
        console.error(`❌ Erro ao migrar refeição ${refeicao.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Migra registros de refeições consumidas
   */
  async migrateMealRecords() {
    console.log('📝 Migrando registros de refeições...');
    
    const alimentacaoData = JSON.parse(localStorage.getItem('alimentacao-storage') || '{}');
    const registros = alimentacaoData.state?.registros || alimentacaoData.registros || [];
    
    if (registros.length === 0) {
      console.log('ℹ️ Nenhum registro de refeição encontrado');
      return;
    }

    for (const registro of registros) {
      try {
        // Converter foto base64 para URL se necessário
        let photoUrl = registro.foto;
        if (photoUrl && photoUrl.startsWith('data:image/')) {
          // Em produção, seria necessário fazer upload da imagem
          console.log('⚠️ Imagem base64 detectada. Upload de imagem necessário.');
        }

        const response = await fetch(`${this.apiBaseUrl}/api/meal-records`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            date: registro.data,
            time: registro.horario,
            description: registro.descricao,
            mealType: registro.tipoIcone,
            photoUrl: photoUrl
          })
        });

        if (!response.ok) {
          throw new Error(`Erro ao migrar registro: ${response.statusText}`);
        }

        console.log(`✅ Registro migrado: ${registro.descricao} (${registro.data} ${registro.horario})`);
      } catch (error) {
        console.error(`❌ Erro ao migrar registro ${registro.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Migra dados de hidratação
   */
  async migrateHydrationData() {
    console.log('💧 Migrando dados de hidratação...');
    
    const alimentacaoData = JSON.parse(localStorage.getItem('alimentacao-storage') || '{}');
    const state = alimentacaoData.state || alimentacaoData;
    
    const coposBebidos = state.coposBebidos || 0;
    const metaDiaria = state.metaDiaria || 8;
    const ultimoRegistro = state.ultimoRegistro;

    if (coposBebidos === 0 && metaDiaria === 8) {
      console.log('ℹ️ Dados de hidratação padrão, ignorando migração');
      return;
    }

    try {
      // Primeiro, configura a meta diária
      if (metaDiaria !== 8) {
        await fetch(`${this.apiBaseUrl}/api/hydration/goal`, {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({ dailyGoal: metaDiaria })
        });
      }

      // Depois, adiciona os copos consumidos
      for (let i = 0; i < coposBebidos; i++) {
        const response = await fetch(`${this.apiBaseUrl}/api/hydration/add-glass`, {
          method: 'POST',
          headers: this.headers
        });

        if (!response.ok) {
          throw new Error(`Erro ao adicionar copo ${i + 1}: ${response.statusText}`);
        }
      }

      console.log(`✅ Hidratação migrada: ${coposBebidos}/${metaDiaria} copos`);
    } catch (error) {
      console.error('❌ Erro ao migrar dados de hidratação:', error);
      throw error;
    }
  }

  /**
   * Migra receitas
   */
  async migrateRecipes() {
    console.log('👨‍🍳 Migrando receitas...');
    
    const receitasData = JSON.parse(localStorage.getItem('receitas-storage') || '{}');
    const receitas = receitasData.state?.receitas || receitasData.receitas || [];
    const favoritos = receitasData.state?.favoritos || receitasData.favoritos || [];
    
    if (receitas.length === 0) {
      console.log('ℹ️ Nenhuma receita encontrada');
      return;
    }

    for (const receita of receitas) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/recipes`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            name: receita.nome,
            description: receita.descricao,
            prepTime: receita.tempoPreparo,
            servings: receita.porcoes,
            calories: receita.calorias,
            imageUrl: receita.imagem,
            ingredients: receita.ingredientes.map(ing => ({
              name: ing.nome,
              quantity: ing.quantidade,
              unit: ing.unidade
            })),
            instructions: receita.passos,
            categories: receita.categorias,
            tags: receita.tags
          })
        });

        if (!response.ok) {
          throw new Error(`Erro ao migrar receita: ${response.statusText}`);
        }

        const novaReceita = await response.json();

        // Se a receita era favorita, marca como favorita na API
        if (favoritos.includes(receita.id)) {
          await fetch(`${this.apiBaseUrl}/api/recipes/${novaReceita.id}/favorite`, {
            method: 'POST',
            headers: this.headers
          });
        }

        console.log(`✅ Receita migrada: ${receita.nome}`);
      } catch (error) {
        console.error(`❌ Erro ao migrar receita ${receita.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Executa rollback em caso de erro
   */
  async rollbackMigration() {
    console.log('🔄 Executando rollback da migração...');
    
    try {
      // Limpa dados que possam ter sido parcialmente migrados
      // Em produção, seria necessário implementar endpoints de limpeza na API
      console.log('⚠️ Rollback manual necessário - contate o administrador');
      
      // Preserva dados do localStorage
      console.log('💾 Dados do localStorage preservados para nova tentativa');
      
    } catch (error) {
      console.error('❌ Erro durante rollback:', error);
    }
  }

  /**
   * Valida se os dados foram migrados corretamente
   */
  async validateMigration() {
    console.log('🔍 Validando migração...');
    
    try {
      // Valida meal plans
      const mealPlansResponse = await fetch(`${this.apiBaseUrl}/api/meal-plans`, {
        headers: this.headers
      });
      const mealPlans = await mealPlansResponse.json();
      
      // Valida meal records
      const mealRecordsResponse = await fetch(`${this.apiBaseUrl}/api/meal-records`, {
        headers: this.headers
      });
      const mealRecords = await mealRecordsResponse.json();
      
      // Valida hydration
      const hydrationResponse = await fetch(`${this.apiBaseUrl}/api/hydration/today`, {
        headers: this.headers
      });
      const hydration = await hydrationResponse.json();
      
      // Valida recipes
      const recipesResponse = await fetch(`${this.apiBaseUrl}/api/recipes`, {
        headers: this.headers
      });
      const recipes = await recipesResponse.json();
      
      console.log(`✅ Validação concluída:
        - Meal Plans: ${mealPlans.length}
        - Meal Records: ${mealRecords.length}
        - Hydration Goal: ${hydration.dailyGoal}
        - Recipes: ${recipes.length}`);
      
      return {
        mealPlans: mealPlans.length,
        mealRecords: mealRecords.length,
        hydrationGoal: hydration.dailyGoal,
        recipes: recipes.length
      };
      
    } catch (error) {
      console.error('❌ Erro durante validação:', error);
      throw error;
    }
  }

  /**
   * Limpa dados antigos do localStorage após migração bem-sucedida
   */
  clearOldData() {
    console.log('🧹 Limpando dados antigos do localStorage...');
    
    // Não remove imediatamente - mantém backup por segurança
    console.log('⚠️ Dados mantidos por segurança. Para limpar manualmente use:');
    console.log('localStorage.removeItem("alimentacao-storage")');
    console.log('localStorage.removeItem("receitas-storage")');
  }
}

/**
 * Script utilitário para execução da migração
 */
class MigrationRunner {
  static async run(config = {}) {
    const {
      apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      authToken = null,
      skipValidation = false
    } = config;

    if (!authToken) {
      throw new Error('Token de autenticação é obrigatório');
    }

    console.log('🔄 Iniciando migração do módulo alimentação...');
    console.log(`📡 API Base URL: ${apiBaseUrl}`);
    
    const migration = new AlimentacaoMigration(apiBaseUrl, authToken);
    
    // Executa migração
    const result = await migration.executeMigration();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Valida migração se solicitado
    if (!skipValidation) {
      await migration.validateMigration();
    }
    
    // Oferece opção de limpeza
    console.log('✅ Migração concluída com sucesso!');
    console.log('💡 Execute migration.clearOldData() para limpar dados antigos');
    
    return migration;
  }
}

// Exporta para uso em Node.js ou browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AlimentacaoMigration, MigrationRunner };
} else {
  window.AlimentacaoMigration = AlimentacaoMigration;
  window.MigrationRunner = MigrationRunner;
}

/**
 * EXEMPLO DE USO:
 * 
 * // No browser (console do navegador):
 * const migration = await MigrationRunner.run({
 *   apiBaseUrl: 'https://sua-api.com',
 *   authToken: 'seu_token_jwt'
 * });
 * 
 * // Para limpar dados antigos após confirmação:
 * migration.clearOldData();
 * 
 * // Para fazer backup manual:
 * const backup = migration.backupLocalStorageData();
 */ 