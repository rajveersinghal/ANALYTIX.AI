import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: "Free",
    price: "0",
    desc: "For hobbyists exploring AI.",
    features: ["3 Analysis runs", "Standard support", "7-day history"]
  },
  {
    name: "Pro",
    price: "499",
    desc: "For data professionals.",
    features: ["Unlimited runs", "Priority support", "Full archive access", "Custom models"],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For growing teams.",
    features: ["White-label reports", "API access", "SSO & Security", "Dedicated manager"]
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Simple, transparent pricing.</h2>
          <p className="text-zinc-400">Scale your intelligence as you grow your data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <div 
              key={idx} 
              className={`card-linear flex flex-col ${plan.popular ? 'border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}`}
            >
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tracking-tighter">{plan.price !== 'Custom' ? '₹' : ''}{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-zinc-500 text-sm">/mo</span>}
                </div>
                <p className="text-zinc-500 text-sm mt-3">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={14} className="text-white" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link 
                to="/signup" 
                className={plan.popular ? 'btn-linear w-full text-center py-3' : 'btn-secondary w-full text-center py-3'}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
