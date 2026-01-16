import React, { useEffect, useState } from 'react';
import { LeadData, UserProfile, LeadStatus } from '../types';
import {
  Users, TrendingUp, Phone, MapPin,
  CheckCircle2, Trash2, Pencil, X, Save, AlertTriangle, MessageCircle, UserPlus, Star, Zap, Eye, Calendar, Search
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrency, parseCurrency } from '../utils/finance';
import { toast } from 'sonner';
import { UserPlan, SYSTEM_LIMITS } from '../core/system';

interface Props {
  user: UserProfile;
  onSelectLead?: (lead: LeadData) => void;
  onUpgrade?: () => void;
}

const PIPELINE_STEPS: {
  id: LeadStatus;
  label: string;
  bg: string;
  headerBg: string;
  text: string;
  border: string;
  icon: any
}[] = [
    { id: 'NOVO', label: 'Novos', bg: 'bg-blue-50/30', headerBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: Users },
    { id: 'EM_ATENDIMENTO', label: 'Em Atend.', bg: 'bg-yellow-50/30', headerBg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', icon: Phone },
    { id: 'VISITA', label: 'Visita', bg: 'bg-purple-50/30', headerBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: MapPin },
    { id: 'FECHADO', label: 'Fechados', bg: 'bg-emerald-50/30', headerBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle2 },
  ];

const AgentDashboard: React.FC<Props> = ({ user, onSelectLead, onUpgrade }) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('BOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLead, setEditingLead] = useState<LeadData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [user.id]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        date: item.created_at,
        status: item.status as LeadStatus,
        interest: item.interest,
        simulationData: item.simulation_data
      })));
    } catch (err) {
      toast.error("Erro ao carregar leads.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: LeadStatus) => {
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      setLeads(oldLeads);
      toast.error("Erro ao atualizar status.");
    }
  };

  const confirmDeleteLead = async () => {
    if (!deleteConfirmationId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('leads').delete().eq('id', deleteConfirmationId);
      if (error) throw error;
      setLeads(prev => prev.filter(l => l.id !== deleteConfirmationId));
      setDeleteConfirmationId(null);
      toast.success("Lead excluído.");
    } catch (err) {
      toast.error("Erro ao excluir lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const potentialValue = leads.reduce((acc, lead) => {
    const val = parseFloat(lead.interest.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return acc + val;
  }, 0);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-3 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-8 font-sans">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">Gestão de Carteira</h1>
          <p className="text-slate-500 font-medium text-xs">Transforme leads em contratos assinados.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none w-48 md:w-64"
            />
          </div>
          <button
            onClick={() => { setEditingLead({ name: '', email: '', phone: '', interest: '', status: 'NOVO', date: new Date().toISOString() } as any); setIsEditModalOpen(true); }}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Leads</p>
          <p className="text-xl font-black text-slate-900">{leads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Novas Oportunidades</p>
          <p className="text-xl font-black text-slate-900">{leads.filter(l => l.status === 'NOVO').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">VGV em Aberto</p>
          <p className="text-xl font-black text-emerald-600">{formatBRL(potentialValue)}</p>
        </div>
        <div className={`p-4 rounded-xl border flex items-center justify-between ${user.plan === UserPlan.PRO ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-100'}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status do Plano</p>
            <p className="text-xs font-black">{user.plan === UserPlan.PRO ? 'Plano PRO Ativo' : 'Versão Gratuita'}</p>
          </div>
          {user.plan === UserPlan.PRO ? <Star className="w-5 h-5 text-amber-500 fill-current" /> : <button onClick={onUpgrade} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Upgrade</button>}
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
        {PIPELINE_STEPS.map(step => {
          const stepLeads = filteredLeads.filter(l => l.status === step.id);
          return (
            <div key={step.id} className={`min-w-[300px] w-[300px] flex-shrink-0 flex flex-col gap-3 p-3 rounded-2xl ${step.bg}`}>
              <div className={`p-3 rounded-xl flex items-center justify-between border shadow-sm ${step.headerBg} ${step.text} ${step.border}`}>
                <div className="flex items-center gap-2">
                  <step.icon className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">{step.label}</span>
                </div>
                <span className="bg-white/60 px-2 py-0.5 rounded-lg text-[10px] font-black">{stepLeads.length}</span>
              </div>

              <div className="space-y-3">
                {stepLeads.map(lead => (
                  <div key={lead.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group cursor-pointer" onClick={() => onSelectLead?.(lead)}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-slate-900 text-sm">{lead.name}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(lead.id); }} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-black text-emerald-600">{lead.interest}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{new Date(lead.date).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"><MessageCircle className="w-4 h-4" /></a>
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {stepLeads.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Nenhum Lead</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DELETE MODAL */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Excluir este lead?</h3>
            <p className="text-slate-500 text-sm mb-8">Esta operação é irreversível e apagará o histórico vinculado.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteConfirmationId(null)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={confirmDeleteLead} className="py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;