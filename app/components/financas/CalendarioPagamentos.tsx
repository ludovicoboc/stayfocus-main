'use client'

import { useState, useEffect } from 'react';
import { useFinancasStore } from '@/app/stores/financasStore';
import { Calendar, Plus, Check, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function CalendarioPagamentos() {
  const { 
    pagamentosRecorrentes, 
    categorias,
    adicionarPagamento,
    removerPagamento, // Embora não usado na UI, a store o provê
    atualizarPagamento, // Ação unificada para marcar como pago e editar
    isLoading,
    isInitialized
  } = useFinancasStore();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoPagamento, setNovoPagamento] = useState({
    descricao: '',
    valor: 0,
    dataVencimento: '1',
    categoriaId: 0, // ID agora é numérico
  });
  
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const avancarMes = () => setMesAtual(mes => mes === 11 ? (setAnoAtual(ano => ano + 1), 0) : mes + 1);
  const retrocederMes = () => setMesAtual(mes => mes === 0 ? (setAnoAtual(ano => ano - 1), 11) : mes - 1);
  
  const pagamentosDoMes = pagamentosRecorrentes.filter(p => {
    const dataPagamento = new Date(p.proximoPagamento + 'T00:00:00'); // Considerar fuso horário
    return dataPagamento.getMonth() === mesAtual && dataPagamento.getFullYear() === anoAtual;
  }).sort((a, b) => parseInt(a.dataVencimento) - parseInt(b.dataVencimento));

  const handleAdicionarPagamento = async () => {
    if (!novoPagamento.descricao || novoPagamento.valor <= 0 || !novoPagamento.categoriaId) return;
    await adicionarPagamento(novoPagamento);
    setMostrarFormulario(false);
    setNovoPagamento({ descricao: '', valor: 0, dataVencimento: '1', categoriaId: categorias[0]?.id || 0 });
  };
  
  const handleMarcarComoPago = async (id: number, pago: boolean) => {
    await atualizarPagamento(id, { pago: !pago });
  }

  useEffect(() => {
    if (!novoPagamento.categoriaId && categorias.length > 0) {
      setNovoPagamento(prev => ({ ...prev, categoriaId: categorias[0].id }));
    }
  }, [categorias, novoPagamento.categoriaId]);

  if (isLoading && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-financas-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={retrocederMes} className="p-1 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
        <h3 className="text-md font-medium">{nomesMeses[mesAtual]} {anoAtual}</h3>
        <button onClick={avancarMes} className="p-1 rounded-full"><ChevronRight className="h-5 w-5" /></button>
      </div>
      
      <div className="space-y-2">
        {pagamentosDoMes.length > 0 ? (
          pagamentosDoMes.map(pagamento => {
            const categoria = categorias.find(c => c.id === pagamento.categoriaId);
            const hoje = new Date();
            const dataPagamento = new Date(pagamento.proximoPagamento + 'T00:00:00');
            const dataPassada = dataPagamento < hoje && dataPagamento.getDate() !== hoje.getDate();

            return (
              <div key={pagamento.id} className={`border rounded-lg overflow-hidden ${pagamento.pago ? 'border-green-200' : dataPassada ? 'border-red-200' : 'border-gray-200'}`}>
                <div className={`flex items-center justify-between p-3 ${pagamento.pago ? 'bg-green-50' : dataPassada ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full mr-3 font-medium">{pagamento.dataVencimento}</div>
                    <div>
                      <div className="font-medium">{pagamento.descricao}</div>
                      <div className="text-sm text-gray-500">{categoria?.nome || 'Sem categoria'}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="font-medium mr-3">{formatadorMoeda.format(pagamento.valor)}</div>
                    <button onClick={() => handleMarcarComoPago(pagamento.id, pagamento.pago)} className={`p-1 rounded-full ${pagamento.pago ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {pagamento.pago ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500"><Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" /><p>Nenhum pagamento para este mês.</p></div>
        )}
      </div>
      
      {mostrarFormulario ? (
        <div className="border rounded-lg p-3 mt-3">
          <div className="space-y-3">
            <Input label="Descrição" value={novoPagamento.descricao} onChange={e => setNovoPagamento({ ...novoPagamento, descricao: e.target.value })} />
            <Input label="Valor" type="number" value={novoPagamento.valor || ''} onChange={e => setNovoPagamento({ ...novoPagamento, valor: parseFloat(e.target.value) || 0 })} />
            <Select label="Dia do Vencimento" value={novoPagamento.dataVencimento} onChange={e => setNovoPagamento({ ...novoPagamento, dataVencimento: e.target.value })} options={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))} />
            <Select label="Categoria" value={novoPagamento.categoriaId.toString()} onChange={e => setNovoPagamento({ ...novoPagamento, categoriaId: Number(e.target.value) })} options={categorias.map(c => ({ value: c.id.toString(), label: c.nome }))} />
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleAdicionarPagamento} className="flex-1">Adicionar</Button>
              <Button onClick={() => setMostrarFormulario(false)} className="flex-1" variant="outline">Cancelar</Button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)} className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md py-2"><Plus className="h-5 w-5 mr-1" /> Novo Pagamento</button>
      )}
    </div>
  );
}