import React, { useEffect, useState } from 'react';
import { LeadData, UserProfile, LeadStatus, MAX_FREE_SIMULATIONS } from '../types';
import {
  Users, TrendingUp, Phone, Mail, Search,
  CheckCircle2, MapPin,
  Trash2, Pencil, X, Save, AlertTriangle, MessageCircle, UserPlus, Star, Zap, Eye, Calendar
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

  return (
    <div className="p-3 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-8 font-sans">

      {/* HEADER SECTION - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">CRM de Vendas</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase tracking-wide">Beta</span>
          </div>
          <p className="text-slate-500 font-medium text-xs">Gerencie seus leads e acompanhe o funil.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-blue-100 outline-none w-full md:w-56 shadow-sm transition-all"
            />
          </div>

          <button
            onClick={() => {
              setEditingLead({ name: '', email: '', phone: '', interest: '', status: 'NOVO', date: new Date().toISOString() } as any);
              setIsEditModalOpen(true);
            }}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" /> Novo Lead
          </button>
        </div>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Leads</p>
            <p className="text-lg font-black text-slate-900">{totalLeads}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Novos</p>
            <p className="text-lg font-black text-slate-900">{newLeadsCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 relative overflow-hidden group">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg relative z-10">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="relative z-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">VGV Potencial</p>
            <p className="text-lg font-black text-slate-900">{formatBRL(potentialValue)}</p>
          </div>
        </div>

        {/* PLAN STATUS */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${user.plan === 'PRO' ? 'bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-200/50' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${user.plan === 'PRO' ? 'bg-white/10 text-yellow-400' : 'bg-blue-50 text-blue-600'}`}>
              {user.plan === 'PRO' ? <Star className="w-3.5 h-3.5 fill-yellow-400" /> : <Zap className="w-3.5 h-3.5" />}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest mb-0.5 text-slate-400">Seu Plano</p>
              <p className="text-xs font-black">{user.plan === 'PRO' ? 'PRO Ativo' : 'Versão Free'}</p>
            </div>
          </div>
          {user.plan === 'FREE' && (
            <button onClick={onUpgrade} className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">
              Upgrade
            </button>
          )}
        </div>
      </div>


      {/* VIEW TOGGLE */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setViewMode('BOARD')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${viewMode === 'BOARD' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
        >
          Quadro Kanban
        </button>
        <button
          onClick={() => setViewMode('LIST')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${viewMode === 'LIST' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
        >
          Lista Detalhada
        </button>
      </div>

      {/* DASHBOARD CONTENT */}
      {viewMode === 'BOARD' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {PIPELINE_STEPS.map(step => {
            const stepLeads = filteredLeads.filter(l => l.status === step.id);
            const isOver = dragOverColumn === step.id;

            return (
              <div
                key={step.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverColumn(step.id); }}
                onDrop={(e) => handleDrop(e, step.id)}
                className={`min-w-[280px] w-[280px] flex-shrink-0 flex flex-col gap-3 p-3 rounded-2xl transition-all ${step.bg} ${isOver ? 'ring-2 ring-blue-500 bg-white/80' : ''}`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-between border shadow-sm ${step.headerBg} ${step.text} ${step.border}`}>
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4" />
                    <span className="font-black text-[10px] uppercase tracking-wider">{step.label}</span>
                  </div>
                  <span className="bg-white/60 px-2 py-0.5 rounded-md text-[10px] font-bold">{stepLeads.length}</span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar px-1">
                  {stepLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{lead.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-white pl-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditClick(lead, e); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Pencil className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(lead.id); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        <p className="text-sm font-black text-emerald-600">{lead.interest}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                          <Phone className="w-3 h-3 text-slate-300" /> {lead.phone}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400">{new Date(lead.date).toLocaleDateString()}</span>
                        <div className="flex gap-1.5">
                          <a href={getWhatsappLink(lead.phone)} target="_blank" className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors" title="WhatsApp"><MessageCircle className="w-3.5 h-3.5" /></a>
                          <button onClick={() => onSelectLead?.(lead)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Detalhes"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stepLeads.length === 0 && (
                    <div className="py-8 border-2 border-dashed border-slate-200/50 rounded-xl flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-[9px]">Vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Interesse</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-[10px] text-slate-500">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{lead.interest}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="bg-slate-100 border-none rounded-lg px-2 py-1 text-[10px] font-bold uppercase focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                      >
                        {PIPELINE_STEPS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{new Date(lead.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onSelectLead?.(lead)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-3.5 h-3.5" /></button>
                        <a href={getWhatsappLink(lead.phone)} target="_blank" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle className="w-3.5 h-3.5" /></a>
                        <button onClick={() => setDeleteConfirmationId(lead.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Excluir Lead?</h3>
            <p className="text-slate-500 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteConfirmationId(null)} className="py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={confirmDeleteLead} disabled={isDeleting} className="py-2.5 bg-red-500 text-white rounded-xl font-bold text-xs uppercase hover:bg-red-600 transition-colors">{isDeleting ? '...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                {editingLead.id ? 'Editar Lead' : 'Novo Lead'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Interesse</label>
                  <input
                    type="text"
                    value={editingLead.interest}
                    onChange={(e) => setEditingLead({ ...editingLead, interest: e.target.value })}
                    onBlur={(e) => {
                      const val = parseCurrency(e.target.value);
                      if (!isNaN(val) && val > 0) setEditingLead({ ...editingLead, interest: formatCurrency(val) });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Save className="w-4 h-4" /> Salvar
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