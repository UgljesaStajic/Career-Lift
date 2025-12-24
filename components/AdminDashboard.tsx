
import React, { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp, Search, MoreVertical, Trash2, Key, ArrowUpCircle, Crown, ShieldCheck, Mail, LogOut, CheckCircle, X } from 'lucide-react';
import { AdminStats, SubscriptionTier, User } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    plusUsers: 0,
    proUsers: 0,
    monthlyRevenue: 0,
    stripeRevenue: 0,
    paypalRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedUsers = JSON.parse(localStorage.getItem('careerlift_users') || '[]');
    setUsers(storedUsers);
    
    const plus = storedUsers.filter((u: any) => u.tier === 'plus').length;
    const pro = storedUsers.filter((u: any) => u.tier === 'pro').length;
    
    // Revenue simulation logic
    const stripeTotal = storedUsers
      .filter((u: any) => u.paymentMethod?.type === 'stripe')
      .reduce((acc: number, u: any) => acc + (u.tier === 'plus' ? 12 : u.tier === 'pro' ? 29 : 0), 0);
    
    const paypalTotal = storedUsers
      .filter((u: any) => u.paymentMethod?.type === 'paypal')
      .reduce((acc: number, u: any) => acc + (u.tier === 'plus' ? 12 : u.tier === 'pro' ? 29 : 0), 0);

    setStats({
      totalUsers: storedUsers.length,
      plusUsers: plus,
      proUsers: pro,
      monthlyRevenue: stripeTotal + paypalTotal,
      stripeRevenue: stripeTotal,
      paypalRevenue: paypalTotal
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Are you sure you want to permanently delete account: ${email}?`)) {
      const updated = users.filter(u => u.email !== email);
      localStorage.setItem('careerlift_users', JSON.stringify(updated));
      setUsers(updated);
      loadData();
      showToast("Account deleted successfully");
    }
  };

  const handleResetPassword = (email: string) => {
    showToast(`Password reset link sent to ${email}`);
  };

  const handleCycleTier = (email: string, currentTier: SubscriptionTier) => {
    const nextTierMap: Record<SubscriptionTier, SubscriptionTier> = {
      'free': 'plus',
      'plus': 'pro',
      'pro': 'free'
    };
    const nextTier = nextTierMap[currentTier];
    
    const updated = users.map(u => {
      if (u.email === email) {
        return { ...u, tier: nextTier };
      }
      return u;
    });
    
    localStorage.setItem('careerlift_users', JSON.stringify(updated));
    setUsers(updated);
    loadData();
    showToast(`User upgraded/changed to ${nextTier.toUpperCase()}`);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-40 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent text-white rounded-2xl shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Admin <span className="text-accent">Console</span></h2>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Executive Management & Financial Intelligence</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={14} /> Exit Admin Mode
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Users size={20} className="text-accent" />} 
          label="Total Cohort" 
          value={stats.totalUsers.toString()} 
          sub="CareerLift Users"
        />
        <StatCard 
          icon={<Crown size={20} className="text-amber-500" />} 
          label="Subscription Mix" 
          value={`${stats.plusUsers + stats.proUsers}`} 
          sub={`${stats.proUsers} Elite • ${stats.plusUsers} Plus`}
        />
        <StatCard 
          icon={<TrendingUp size={20} className="text-green-500" />} 
          label="Monthly Revenue" 
          value={`$${stats.monthlyRevenue}`} 
          sub="Projected MRR"
        />
        <StatCard 
          icon={<CreditCard size={20} className="text-blue-500" />} 
          label="Payment Splits" 
          value="S/P" 
          sub={`$${stats.stripeRevenue} Stripe • $${stats.paypalRevenue} PP`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-8 bg-card border border-main shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                User Management
                <span className="px-2 py-0.5 bg-main border border-main rounded-md text-[9px] font-black text-muted uppercase">{filteredUsers.length}</span>
              </h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-40 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  className="w-full pl-10 pr-4 py-2 bg-main border border-main rounded-xl outline-none focus:border-accent text-xs font-bold transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-main">
                    <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest">Client</th>
                    <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest">Tier</th>
                    <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="group hover:bg-main/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-black text-xs">
                            {u.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold tracking-tight">{u.name}</div>
                            <div className="text-[10px] text-muted font-medium opacity-60 flex items-center gap-1"><Mail size={10} /> {u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          u.tier === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          u.tier === 'plus' ? 'bg-accent/10 text-accent border-accent/20' :
                          'bg-main text-muted border-main'
                        }`}>
                          {u.tier}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                            onClick={() => handleCycleTier(u.email, u.tier)}
                            className="p-1.5 bg-main border border-main rounded-lg text-muted hover:text-accent transition-colors"
                            title="Cycle Tier"
                          >
                            <ArrowUpCircle size={14} />
                          </button>
                          <button 
                            onClick={() => handleResetPassword(u.email)}
                            className="p-1.5 bg-main border border-main rounded-lg text-muted hover:text-blue-500 transition-colors"
                            title="Reset Password"
                          >
                            <Key size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.email)}
                            className="p-1.5 bg-main border border-main rounded-lg text-muted hover:text-red-500 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Revenue Breakdown Chart Simulation */}
          <div className="glass-card rounded-3xl p-8 bg-card border border-main shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-8">Revenue Breakdown</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                  <span>Stripe Gateway</span>
                  <span>{((stats.stripeRevenue / (stats.monthlyRevenue || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-main rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(stats.stripeRevenue / (stats.monthlyRevenue || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                  <span>PayPal Global</span>
                  <span>{((stats.paypalRevenue / (stats.monthlyRevenue || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-main rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFC439]" style={{ width: `${(stats.paypalRevenue / (stats.monthlyRevenue || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-3xl p-8 text-white shadow-xl">
             <h4 className="text-sm font-black mb-2 uppercase tracking-tight">System Health</h4>
             <p className="text-xs font-bold opacity-80 mb-6 leading-relaxed">All AI Narrative Engines and Voice Interaction API nodes are operational.</p>
             <div className="flex items-center gap-2 py-2 px-3 bg-white/10 rounded-xl border border-white/20">
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Status</span>
             </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-[200] animate-in slide-in-from-right-10">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500 border-green-400 text-white' : 'bg-red-500 border-red-400 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string }> = ({ icon, label, value, sub }) => (
  <div className="glass-card p-6 rounded-3xl bg-card border border-main shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-main border border-main rounded-xl">{icon}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-muted opacity-40">Live Feed</div>
    </div>
    <div className="text-2xl font-black tracking-tighter mb-1">{value}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 mb-2">{label}</div>
    <div className="text-[9px] font-bold text-accent">{sub}</div>
  </div>
);

export default AdminDashboard;
