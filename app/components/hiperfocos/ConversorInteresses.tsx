'use client'

import { useState, FormEvent } from 'react';
import { Rocket, CheckCircle, PlusCircle, X, Save, Loader2 } from 'lucide-react';
import { useHiperfocosStore, CORES_HIPERFOCOS } from '../../stores/hiperfocosStore';

export function ConversorInteresses() {
  const { adicionarHiperfoco, adicionarTarefa } = useHiperfocosStore();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    corSelecionada: CORES_HIPERFOCOS[0],
    tempoLimite: '',
    novasTarefas: [''],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);
  
  const adicionarCampoTarefa = () => {
    setFormData(prev => ({ ...prev, novasTarefas: [...prev.novasTarefas, ''] }));
  };
  
  const atualizarTarefa = (index: number, valor: string) => {
    const tarefasAtualizadas = [...formData.novasTarefas];
    tarefasAtualizadas[index] = valor;
    setFormData(prev => ({ ...prev, novasTarefas: tarefasAtualizadas }));
  };
  
  const removerTarefa = (index: number) => {
    const tarefasAtualizadas = formData.novasTarefas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, novasTarefas: tarefasAtualizadas }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || formData.novasTarefas.filter(t => t.trim() !== '').length === 0) {
      setFeedback({ tipo: 'erro', mensagem: 'Título e pelo menos uma tarefa são obrigatórios.' });
      return;
    }
    
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      const novoHiperfoco = await adicionarHiperfoco({
        titulo: formData.titulo,
        descricao: formData.descricao,
        cor: formData.corSelecionada,
        tempoLimite: formData.tempoLimite ? parseInt(formData.tempoLimite) : undefined,
      });
      
      for (const tarefaTexto of formData.novasTarefas.filter(t => t.trim() !== '')) {
        await adicionarTarefa(novoHiperfoco.id, tarefaTexto);
      }
      
      setFeedback({ tipo: 'sucesso', mensagem: 'Hiperfoco criado com sucesso!' });
      setFormData({ titulo: '', descricao: '', corSelecionada: CORES_HIPERFOCOS[0], tempoLimite: '', novasTarefas: [''] });
      
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ tipo: 'erro', mensagem: 'Ocorreu um erro ao criar o hiperfoco.' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Rocket className="h-6 w-6 text-hiperfocos-primary mr-2" />
        <h2 className="text-xl font-semibold">Conversor de Interesses</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Transforme um interesse em um projeto estruturado.</p>
      
      {feedback && (
        <div className={`mb-4 p-3 rounded-md ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
          <CheckCircle className="h-5 w-5 inline mr-2" />
          {feedback.mensagem}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium mb-1">Título do Hiperfoco *</label>
            <input type="text" id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label htmlFor="tempoLimite" className="block text-sm font-medium mb-1">Tempo Limite (minutos)</label>
            <input type="number" id="tempoLimite" value={formData.tempoLimite} onChange={(e) => setFormData({ ...formData, tempoLimite: e.target.value })} min="1" placeholder="Ex: 60" className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium mb-1">Descrição</label>
          <textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cor</label>
          <div className="flex gap-2 flex-wrap">
            {CORES_HIPERFOCOS.map((cor) => (
              <button key={cor} type="button" onClick={() => setFormData({ ...formData, corSelecionada: cor })} className={`w-8 h-8 rounded-full ${formData.corSelecionada === cor ? 'ring-2' : ''}`} style={{ backgroundColor: cor }} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tarefas *</label>
          <div className="space-y-3">
            {formData.novasTarefas.map((tarefa, index) => (
              <div key={index} className="flex gap-2">
                <input type="text" value={tarefa} onChange={(e) => atualizarTarefa(index, e.target.value)} className="flex-1 px-3 py-2 border rounded-md" placeholder={`Tarefa ${index + 1}`} />
                <button type="button" onClick={() => removerTarefa(index)} className="p-2" disabled={formData.novasTarefas.length <= 1}><X className="h-5 w-5" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={adicionarCampoTarefa} className="mt-3 flex items-center text-hiperfocos-primary"><PlusCircle className="h-5 w-5 mr-1" />Adicionar Tarefa</button>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="inline-flex items-center px-4 py-2 border rounded-md text-white bg-hiperfocos-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" />Converter em Hiperfoco</>}
          </button>
        </div>
      </form>
    </div>
  );
}