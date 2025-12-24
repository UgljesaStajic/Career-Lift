
import React, { useState } from 'react';
import { Check, Crown, Briefcase, Zap, Loader2, ArrowLeft, ChevronRight, CreditCard } from 'lucide-react';
import { SubscriptionTier, AppView, User } from '../types';

interface PricingProps {
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier, paymentMethod?: User['paymentMethod']) => void;
  onNavigate: (view: AppView) => void;
}

const Pricing: React.FC<PricingProps> = ({ currentTier, onUpgrade, onNavigate }) => {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [showCheckout, setShowCheckout] = useState<SubscriptionTier | null>(null);

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free',
      price: '$0',
      tag: 'Basic Access',
      features: [
        '1 Resume Generation',
        'Standard Job Search',
        'PDF Export'
      ],
      cta: 'Current Plan',
      locked: currentTier !== 'free'
    },
    {
      id: 'plus' as SubscriptionTier,
      name: 'Plus',
      price: '$12',
      tag: 'Rising Professional',
      features: [
        '10 Resume Generations',
        'Priority Job Search API',
        'High-Fidelity PDF Exports',
        'Multi-Profile Management'
      ],
      cta: 'Upgrade to Plus',
      popular: true
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro',
      price: '$29',
      tag: 'Global Elite',
      features: [
        'Unlimited Generations',
        'Native Voice Interview Access',
        'Advanced Match Scoring',
        'Priority AI Agent Support',
        'Semantic Performance Analysis'
      ],
      cta: 'Go Pro'
    }
  ];

  const handleSimulatePayment = (tier: SubscriptionTier) => {
    setShowCheckout(tier);
  };

  const handleFinalPayment = (tier: SubscriptionTier, methodType: 'stripe' | 'paypal') => {
    setLoading(tier);
    // Simulate real API transaction latency and success
    setTimeout(() => {
      const paymentMethod: User['paymentMethod'] = methodType === 'stripe' 
        ? { type: 'stripe', details: '4242' }
        : { type: 'paypal', details: 'executive@elite.com' };
        
      onUpgrade(tier, paymentMethod);
      setLoading(null);
      setShowCheckout(null);
    }, 2500);
  };

  if (showCheckout) {
    const plan = plans.find(p => p.id === showCheckout);
    return (
      <div className="max-w-xl mx-auto px-6 py-20 pb-40 animate-in zoom-in duration-500">
        <button onClick={() => setShowCheckout(null)} className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Plans
        </button>

        <div className="glass-card rounded-[2.5rem] p-10 bg-card border border-main shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 tracking-tight">Executive Checkout</h2>
            <p className="text-xs font-bold text-muted mb-8 opacity-60 uppercase tracking-widest">Plan: <span className="text-accent">{plan?.name} Strategy</span></p>

            <div className="p-6 bg-main border border-main rounded-3xl mb-10 flex justify-between items-center shadow-inner">
              <span className="text-sm font-bold text-muted opacity-80">Total Professional Investment</span>
              <span className="text-2xl font-black">{plan?.price}<span className="text-sm opacity-60">/mo</span></span>
            </div>

            <div className="space-y-4">
              {/* High-fidelity simulated Stripe button */}
              <button 
                onClick={() => !loading && handleFinalPayment(showCheckout, 'stripe')}
                className="w-full p-6 bg-[#635BFF] text-white rounded-2xl flex items-center justify-between group transition-all hover:bg-[#5851E0] disabled:opacity-50"
                disabled={!!loading}
              >
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg"><CreditCard className="w-5 h-5 text-white" /></div>
                    <span className="text-sm font-black uppercase tracking-widest">Pay with Stripe</span>
                 </div>
                 {loading === showCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />}
              </button>
              
              {/* High-fidelity simulated PayPal button */}
              <button 
                onClick={() => !loading && handleFinalPayment(showCheckout, 'paypal')}
                className="w-full p-6 bg-[#FFC439] text-[#003087] rounded-2xl flex items-center justify-between group transition-all hover:bg-[#F2BA36] disabled:opacity-50"
                disabled={!!loading}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#003087]/10 rounded-lg">
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4 rounded-sm" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">PayPal Global</span>
                </div>
                {loading === showCheckout ? <Loader2 className="w-4 h-4 animate-spin text-[#003087]" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />}
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-main">
              <p className="text-[9px] font-black text-muted text-center uppercase tracking-[0.2em] opacity-40 mb-2">Secure Transaction Architecture</p>
              <div className="flex justify-center gap-4 opacity-30">
                <ShieldIcon className="w-6 h-6" />
                <LockIcon className="w-6 h-6" />
                <GlobeIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 pb-40 animate-in fade-in duration-1000">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-black mb-4 tracking-tighter">Strategic <span className="text-accent">Architect</span> Plans</h2>
        <p className="text-base font-medium text-muted max-w-lg mx-auto leading-relaxed opacity-80">
          Tailored access levels for every stage of your professional trajectory.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`glass-card p-10 rounded-[2.5rem] bg-card border border-main flex flex-col relative transition-all duration-500 ${
              plan.popular ? 'border-accent shadow-2xl scale-105 z-10 md:translate-y-[-10px]' : 'shadow-sm opacity-90'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-accent text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                Most Popular Choice
              </div>
            )}
            
            <div className="mb-10">
              <h3 className="text-lg font-black mb-1 uppercase tracking-tighter">{plan.name}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60 mb-6">{plan.tag}</p>
              <div className="text-4xl font-black tracking-tighter mb-2">
                {plan.price}<span className="text-base font-bold text-muted ml-1 opacity-50">/mo</span>
              </div>
            </div>

            <ul className="space-y-5 mb-12 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted">
                  <div className="bg-accent/10 p-0.5 rounded-md mt-0.5"><Check className="w-3.5 h-3.5 text-accent" /></div>
                  <span className="opacity-80">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => plan.id !== currentTier && handleSimulatePayment(plan.id)}
              disabled={plan.id === currentTier || plan.locked}
              className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all ${
                plan.id === currentTier 
                  ? 'bg-main border border-main text-muted cursor-default' 
                  : 'bg-accent text-white hover:bg-accent/90 hover:scale-[1.02]'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-main/40 border border-main rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl text-center md:text-left">
          <h4 className="text-xl font-black mb-3 tracking-tight">Need a Bespoke Solution?</h4>
          <p className="text-sm font-medium text-muted opacity-80 leading-relaxed">
            For organizations and global recruiting firms, we offer dedicated API endpoints and white-label narrative engines.
          </p>
        </div>
        <button className="px-8 py-4 bg-main border border-main text-accent rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-accent transition-all shadow-sm">
          Contact Enterprise Team
        </button>
      </div>
    </div>
  );
};

// Internal icon components for checkout aesthetics
const ShieldIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GlobeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default Pricing;
