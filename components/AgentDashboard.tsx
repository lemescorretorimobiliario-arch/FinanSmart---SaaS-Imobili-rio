import React from 'react';
import { LeadData, UserProfile } from '../types';
import { Users, TrendingUp, DollarSign, Phone, Mail, Calendar, Search, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface Props {
  user: UserProfile;
  leads: LeadData[];
}

const AgentDashboard: React.FC<Props> = ({ user, leads }) => {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-800">Painel do Corretor</h1>
          <p className="text-sm md:text-base text-slate-500">Bem-vindo, {user.name}.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
           <div className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold px-2 py-1 rounded">PRO</div>
           <span className="text-xs md:text-sm text-slate-500">Exp: 25/12</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+12%</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{leads.length}</h3>
          <p className="text-xs md:text-sm text-slate-500">Leads</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{user.simulationsCount}</h3>
          <p className="text-xs md:text-sm text-slate-500">Simulações</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800">R$ 4.2M</h3>
          <p className="text-xs md:text-sm text-slate-500">VGV Potencial</p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 className="text-base md:text-lg font-bold text-slate-800 self-start md:self-center">Leads Recentes</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-8 md:pl-9 pr-4 py-1.5 md:py-2 border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4">Cliente</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Contato</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Interesse</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Data</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length > 0 ? leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="font-medium text-slate-900 text-xs md:text-sm">{lead.name}</div>
                    <div className="text-[10px] text-slate-400">Origem: Site</div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] md:text-sm text-slate-600">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] md:text-sm text-slate-600">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium text-slate-700">
                    {lead.interest}
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> {new Date(lead.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                      lead.status === 'NOVO' ? 'bg-blue-100 text-blue-700' : 
                      lead.status === 'FECHADO' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 p-2">
                      <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum lead capturado ainda. Comece a simular!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;