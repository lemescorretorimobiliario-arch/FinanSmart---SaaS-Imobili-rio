import React, { useEffect, useState } from 'react';
import { LeadData, UserProfile, LeadStatus } from '../types';
import {
  Users, TrendingUp, DollarSign, Phone, Mail, Calendar, Search,
  MoreHorizontal, LayoutGrid, List, MessageCircle, ArrowRight,
  CheckCircle2, XCircle, Clock, MapPin, ExternalLink, GripHorizontal,
  Trash2, Pencil, X, Save, AlertTriangle, RefreshCw
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrency, parseCurrency } from '../utils/finance';
import { toast } from 'sonner';

interface Props {
  user: UserProfile;
  onSelectLead?: (lead: LeadData) => void;
}

// Configuração do Funil de Vendas (Kanban Columns)
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

const AgentDashboard: React.FC<Props> = ({ user, onSelectLead }) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('BOARD');
  const [searchTerm, setSearchTerm] = useState('');

  // Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  // Edit State
  const [editingLead, setEditingLead] = useState<LeadData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedLeads = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        date: item.created_at,
        status: item.status as LeadStatus,
        interest: item.interest,
        simulationData: item.simulation_data // Fetch JSON data
      }));
      setLeads(mappedLeads);
    }
    setIsLoading(false);
  };

  const updateLeadStatus = async (id: string, newStatus: LeadStatus) => {
    // Optimistic Update
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to update status", err);
      setLeads(oldLeads); // Revert
      // Improved error message
      toast.error(`Erro ao atualizar status: ${err.message || JSON.stringify(err)}`);
    }
  };

  // Abre o modal de confirmação
  const reqeustDeleteLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmationId(id);
  };

  // Executa a exclusão real
  const confirmDeleteLead = async () => {
    if (!deleteConfirmationId) return;

    setIsDeleting(true);
    const id = deleteConfirmationId;

    // Optimistic Update
    const oldLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== id));

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '42501') {
          throw new Error("Permissão negada. Verifique se o script SQL foi atualizado com a política de exclusão.");
        }
        throw error;
      }
      // Sucesso
      setDeleteConfirmationId(null);
      toast.success("Lead excluído com sucesso.");
    } catch (err: any) {
      console.error("Failed to delete lead", err);
      setLeads(oldLeads); // Revert on error
      toast.error(`Erro ao excluir lead: ${err.message || "Tente novamente."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (lead: LeadData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: editingLead.name,
          email: editingLead.email,
          phone: editingLead.phone,
          interest: editingLead.interest
        })
        .eq('id', editingLead.id);

      if (error) throw error;

      // Update local state
      setLeads(prev => prev.map(l => l.id === editingLead.id ? editingLead : l));
      setIsEditModalOpen(false);
      setEditingLead(null);
      toast.success("Lead atualizado com sucesso!");

    } catch (err) {
      console.error("Failed to update lead", err);
      toast.error("Erro ao atualizar lead.");
    }
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('leadId', id);

    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
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

  // --- KPI Calculation ---
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'NOVO').length;
  const potentialValue = leads.reduce((acc, lead) => {
    const val = parseFloat(lead.interest.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return acc + val;
  }, 0);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20 bg-slate-50/50 min-h-full">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Gestão de Leads
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              className={`p-2 rounded-full hover:bg-slate-200 transition-all ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`}
              title="Atualizar lista"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie seu funil de vendas e oportunidades.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <button
              onClick={() => setViewMode('BOARD')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'BOARD' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Quadro (Kanban)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Leads</p>
            <p className="text-xl font-bold text-slate-900">{totalLeads}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Novos</p>
            <p className="text-xl font-bold text-slate-900">{newLeads}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Potencial de Venda (VGV)</p>
            <p className="text-xl font-bold text-slate-900">{formatBRL(potentialValue)}</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: KANBAN OR LIST */}

      {viewMode === 'BOARD' ? (
        // --- KANBAN VIEW ---
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 items-start min-h-[500px]">
          {PIPELINE_STEPS.map((step) => {
            const stepLeads = filteredLeads.filter(l => l.status === step.id);
            const isOver = dragOverColumn === step.id;

            return (
              <div
                key={step.id}
                className={`
                    min-w-[280px] md:min-w-[320px] w-full md:w-1/4 flex flex-col rounded-2xl border p-2 h-full transition-colors duration-200
                    ${step.bg} ${step.border}
                    ${isOver ? 'ring-2 ring-blue-400 bg-white shadow-md' : ''}
                 `}
                onDragOver={(e) => handleDragOver(e, step.id)}
                onDrop={(e) => handleDrop(e, step.id)}
              >

                {/* Column Header */}
                <div className={`p-3 rounded-xl mb-3 flex justify-between items-center border-b ${step.headerBg} ${step.text} ${step.border}`}>
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{step.label}</span>
                  </div>
                  <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                    {stepLeads.length}
                  </span>
                </div>

                {/* Cards Area */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] px-1 custom-scrollbar">
                  {stepLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group relative"
                    >
                      {/* Grip Handle & Edit Actions */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm z-20">
                        <button
                          onClick={(e) => handleEditClick(lead, e)}
                          className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => reqeustDeleteLead(lead.id, e)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 p-1" title="Arrastar">
                          <GripHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div
                        onClick={(e) => {
                          if (onSelectLead && !(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
                            onSelectLead(lead);
                          }
                        }}
                        className="block pt-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2 pr-14">
                          <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">{lead.name}</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded block w-fit mb-2">
                          {new Date(lead.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                        </span>

                        <div className="mb-3">
                          <p className="text-xs font-semibold text-emerald-600 mb-1">{lead.interest}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-3">
                        {step.id !== 'FECHADO' && (
                          <button
                            onClick={() => {
                              const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === step.id);
                              if (currentIndex < PIPELINE_STEPS.length - 1) {
                                updateLeadStatus(lead.id, PIPELINE_STEPS[currentIndex + 1].id);
                              }
                            }}
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                            title="Mover para próxima etapa"
                          >
                            Mover <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <div className="flex gap-2 ml-auto relative z-10">
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Enviar Email"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <a
                            href={getWhatsappLink(lead.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Abrir WhatsApp"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          {lead.simulationData && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectLead) onSelectLead(lead);
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Abrir Simulação"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stepLeads.length === 0 && (
                    <div className="text-center py-8 opacity-50 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                      <p className="text-xs text-slate-400 font-medium">Nenhum cliente nesta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // --- LIST VIEW ---
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Valor Interesse</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Carregando leads...</td></tr>
                ) : filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectLead && onSelectLead(lead)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{lead.name}</div>
                      <div className="text-[10px] text-slate-400">ID: {lead.id.slice(0, 6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5" /> {lead.email}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5" /> {lead.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">
                        {lead.interest}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(lead.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-xs font-bold py-1.5 pl-2 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${lead.status === 'NOVO' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                          lead.status === 'FECHADO' ? 'bg-emerald-100 text-emerald-700 focus:ring-emerald-500' :
                            'bg-yellow-100 text-yellow-700 focus:ring-yellow-500'
                          }`}
                      >
                        {PIPELINE_STEPS.map(step => (
                          <option key={step.id} value={step.id}>{step.label}</option>
                        ))}
                        <option value="PERDIDO">Perdido</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => handleEditClick(lead, e)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Lead"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => reqeustDeleteLead(lead.id, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsappLink(lead.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg shadow-sm transition-transform hover:scale-105"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">Nenhum cliente encontrado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-scale-in text-center border-4 border-white/20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Lead?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteLead}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Pencil className="w-4 h-4" /></div>
                Editar Lead
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome Completo</label>
                <input
                  type="text"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Telefone</label>
                  <input
                    type="text"
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Interesse</label>
                  <input
                    type="text"
                    value={editingLead.interest}
                    onChange={(e) => {
                      // Simple mask logic or just text
                      const raw = e.target.value;
                      setEditingLead({ ...editingLead, interest: raw });
                    }}
                    onBlur={(e) => {
                      // Format on blur if it looks like a number
                      const val = parseCurrency(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setEditingLead({ ...editingLead, interest: formatCurrency(val) });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
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