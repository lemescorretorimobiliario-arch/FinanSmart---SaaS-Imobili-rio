import React, { useEffect, useState } from 'react';
import { LeadData, UserProfile, LeadStatus, MAX_FREE_SIMULATIONS } from '../types';
import {
  Users, TrendingUp, DollarSign, Phone, Mail, Calendar, Search,
  MoreHorizontal, LayoutGrid, List, MessageCircle, ArrowRight,
  CheckCircle2, XCircle, Clock, MapPin, ExternalLink, GripHorizontal,
  Trash2, Pencil, X, Save, AlertTriangle, RefreshCw, UserPlus, Star, Zap, Eye
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrency, parseCurrency } from '../utils/finance';
import { toast } from 'sonner';

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
    { id: 'NOVO', label: 'Novos', bg: 'bg-blue-50/50', headerBg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Users },
    { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', bg: 'bg-yellow-50/50', headerBg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Phone },
    { id: 'VISITA', label: 'Visita', bg: 'bg-purple-50/50', headerBg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: MapPin },
    { id: 'FECHADO', label: 'Fechados', bg: 'bg-emerald-50/50', headerBg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  ];

const AgentDashboard: React.FC<Props> = ({ user, onSelectLead, onUpgrade }) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('BOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [editingLead, setEditingLead] = useState<LeadData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mappedLeads = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          date: item.created_at,
          status: item.status as LeadStatus,
          interest: item.interest,
          simulationData: item.simulation_data
        }));
        setLeads(mappedLeads);
      }
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
    } catch (err: any) {
      setLeads(oldLeads);
      toast.error(`Erro ao atualizar status.`);
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
    } catch (err: any) {
      toast.error("Erro ao excluir lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const { error } = await supabase.from('leads').update({
        name: editingLead.name,
        email: editingLead.email,
        phone: editingLead.phone,
        interest: editingLead.interest
      }).eq('id', editingLead.id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === editingLead.id ? editingLead : l));
      setIsEditModalOpen(false);
      setEditingLead(null);
      toast.success("Lead atualizado!");
    } catch (err) {
      toast.error("Erro ao salvar lead.");
    }
  };

  const handleEditClick = (lead: LeadData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead({ ...lead });
    setIsEditModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('leadId', id);
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('leadId');
    if (id) {
      const lead = leads.find(l => l.id === id);
      if (lead && lead.status !== newStatus) {
        updateLeadStatus(id, newStatus);
      }
    }
  };

  const getWhatsappLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}`;
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'NOVO').length;
  const potentialValue = leads.reduce((acc, lead) => {
    const val = parseFloat(lead.interest.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return acc + val;
  }, 0);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const usagePercent = Math.min((user.simulationsCount / MAX_FREE_SIMULATIONS) * 100, 100);
  const remaining = Math.max(MAX_FREE_SIMULATIONS - user.simulationsCount, 0);

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-10 animate-fade-in pb-24 font-sans">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">CRM de Vendas</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">Gerencie seus leads e acompanhe o funil de vendas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Buscar prospectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none w-full md:w-72 shadow-xl shadow-slate-200/50 transition-all"
            />
          </div>

          <button
            onClick={() => {
              setEditingLead({ name: '', email: '', phone: '', interest: '', status: 'NOVO', date: new Date().toISOString() } as any);
              setIsEditModalOpen(true);
            }}
            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-3"
          >
            <UserPlus className="w-5 h-5" /> Novo Cliente
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-5 group hover:-translate-y-1 transition-all">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Leads</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalLeads}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-5 group hover:-translate-y-1 transition-all">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:bg-yellow-600 group-hover:text-white transition-all shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Novos</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{newLeadsCount}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6 group hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner relative z-10">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume de Vendas (VGV)</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{formatBRL(potentialValue)}</p>
          </div>
        </div>

        {/* PLAN STATUS */}
        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-40 transition-opacity"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status do Plano</p>
              <h3 className={`text-xl font-black tracking-tight ${user.plan === 'PRO' ? 'text-yellow-400' : 'text-white'}`}>
                {user.plan === 'PRO' ? 'Plano PRO' : 'Plano Free'}
              </h3>
            </div>
            <div className={`p-2 rounded-xl bg-white/10 ${user.plan === 'PRO' ? 'text-yellow-400' : 'text-blue-400'}`}>
              {user.plan === 'PRO' ? <Star className="w-4 h-4 fill-yellow-400" /> : <Zap className="w-4 h-4" />}
            </div>
          </div>

          {user.plan === 'FREE' ? (
            <div className="space-y-3 mt-4 relative z-10">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${usagePercent}%` }}></div>
              </div>
              <button onClick={onUpgrade} className="w-full bg-white text-slate-900 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                Assinar PRO <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 relative z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Acesso Ilimitado</span>
            </div>
          )}
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex border-b border-slate-100 pb-2 gap-8">
        <button
          onClick={() => setViewMode('BOARD')}
          className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${viewMode === 'BOARD' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Visualização em Quadro
        </button>
        <button
          onClick={() => setViewMode('LIST')}
          className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${viewMode === 'LIST' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Visualização em Lista
        </button>
      </div>

      {/* DASHBOARD CONTENT */}
      {viewMode === 'BOARD' ? (
        <div className="flex gap-8 overflow-x-auto pb-8 items-start min-h-[600px] px-2">
          {PIPELINE_STEPS.map(step => {
            const stepLeads = filteredLeads.filter(l => l.status === step.id);
            const isOver = dragOverColumn === step.id;

            return (
              <div
                key={step.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverColumn(step.id); }}
                onDrop={(e) => handleDrop(e, step.id)}
                className={`min-w-[340px] flex-shrink-0 flex flex-col gap-4 p-4 rounded-[2.5rem] transition-all ${step.bg} ${isOver ? 'ring-4 ring-blue-500/20 bg-white/80' : ''}`}
              >
                <div className={`p-5 rounded-[1.5rem] flex items-center justify-between border shadow-sm ${step.headerBg} ${step.text} ${step.border}`}>
                  <div className="flex items-center gap-3">
                    <step.icon className="w-5 h-5" />
                    <span className="font-black text-xs uppercase tracking-[0.2em]">{step.label}</span>
                  </div>
                  <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black shadow-inner">{stepLeads.length}</span>
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar px-1">
                  {stepLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 group hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <h4 className="font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{lead.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEditClick(lead, e); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(lead.id); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10">
                        <p className="text-lg font-black text-emerald-600">{lead.interest}</p>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-300" /> {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-300" /> {lead.email}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(lead.date).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <a href={getWhatsappLink(lead.phone)} target="_blank" className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><MessageCircle className="w-4 h-4" /></a>
                          <button onClick={() => onSelectLead?.(lead)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stepLeads.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-200/50 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Coluna Vazia</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Lead / Contato</th>
                  <th className="px-8 py-6">Volume de Interesse</th>
                  <th className="px-8 py-6">Status Atual</th>
                  <th className="px-8 py-6">Data de Cadastro</th>
                  <th className="px-8 py-6 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.email} • {lead.phone}</div>
                    </td>
                    <td className="px-8 py-6 font-black text-emerald-600">{lead.interest}</td>
                    <td className="px-8 py-6">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="bg-slate-100 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-50 outline-none"
                      >
                        {PIPELINE_STEPS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(lead.date).toLocaleDateString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => onSelectLead?.(lead)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                        <a href={getWhatsappLink(lead.phone)} target="_blank" className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></a>
                        <button onClick={() => setDeleteConfirmationId(lead.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS REUSED FROM ORIGINAL (DELETE/EDIT) */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Excluir Lead?</h3>
            <p className="text-slate-500 font-medium mb-8">Esta ação é irreversível e removerá todos os dados do cliente.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteConfirmationId(null)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</button>
              <button onClick={confirmDeleteLead} disabled={isDeleting} className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/30">{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Pencil className="w-5 h-5" /></div>
                Detalhes do Lead
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 md:p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Cliente</label>
                  <input
                    autoFocus
                    type="text"
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Interesse</label>
                  <input
                    type="text"
                    value={editingLead.interest}
                    onChange={(e) => setEditingLead({ ...editingLead, interest: e.target.value })}
                    onBlur={(e) => {
                      const val = parseCurrency(e.target.value);
                      if (!isNaN(val) && val > 0) setEditingLead({ ...editingLead, interest: formatCurrency(val) });
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" /> Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;