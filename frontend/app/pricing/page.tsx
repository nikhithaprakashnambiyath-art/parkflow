"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Zap, Building2, Star, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Star,
    price: "₹0",
    period: "forever",
    description: "For occasional drivers who need basic parking access.",
    color: "slate",
    cta: "Get Started Free",
    popular: false,
    features: [
      "Up to 5 bookings/month",
      "Basic slot search",
      "QR code access",
      "Email notifications",
      "Standard support",
    ],
    missing: [
      "Dynamic pricing",
      "Payment history export",
      "Priority booking",
      "Analytics dashboard",
    ]
  },
  {
    name: "Pro",
    icon: Zap,
    price: "₹499",
    period: "per month",
    description: "For frequent drivers and small fleet operators who need more.",
    color: "cyan",
    cta: "Start Pro Trial",
    popular: true,
    features: [
      "Unlimited bookings",
      "Priority slot reservation",
      "Dynamic pricing alerts",
      "Full payment history & invoices",
      "Multi-vehicle management (up to 10)",
      "Advanced notifications",
      "Analytics overview",
      "Priority support",
    ],
    missing: []
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "contact us",
    description: "For parking operators, malls, and corporate fleets managing large lots.",
    color: "indigo",
    cta: "Contact Sales",
    popular: false,
    features: [
      "Everything in Pro",
      "Admin & Staff portals",
      "Full analytics & reports",
      "Dynamic pricing engine",
      "IoT sensor integration",
      "Custom lot configuration",
      "SLA-backed uptime",
      "Dedicated account manager",
      "Custom branding",
    ],
    missing: []
  }
];

const faq = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel your Pro subscription anytime from your profile settings. Your access continues until the end of the billing period."
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes! Pro comes with a 14-day free trial. No credit card required upfront."
  },
  {
    q: "How does Enterprise pricing work?",
    a: "Enterprise pricing is custom-quoted based on the number of managed lots, slots, and required integrations. Contact our sales team for a proposal."
  },
  {
    q: "Are payments secure?",
    a: "Absolutely. All payments are processed through our encrypted payment gateway with industry-standard PCI DSS compliance."
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(0,217,255,0.5)]">
            <span className="text-xs">PF</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ParkFlow <span className="text-cyan-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/features")} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">Features</button>
          <button onClick={() => router.push("/contact")} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">Contact</button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest block mb-4">Simple, transparent pricing</span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Plans for every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">driver & operator</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Start free, scale as you grow. No hidden fees, no long-term commitments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 border transition-all ${
                  plan.popular
                    ? "bg-gradient-to-b from-cyan-500/15 to-slate-900 border-cyan-500/40 shadow-[0_0_40px_rgba(0,217,255,0.1)]"
                    : "bg-slate-900/60 border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    plan.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-400' :
                    plan.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-400' :
                    'bg-slate-700/60 text-slate-300'
                  }`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? 'text-cyan-400' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-slate-400 text-sm ml-2">/ {plan.period}</span>
                </div>

                <button
                  onClick={() => plan.name === "Enterprise" ? router.push("/contact") : router.push("/login?tab=register")}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm mb-6 transition-all flex items-center gap-2 justify-center ${
                    plan.popular
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,217,255,0.25)]"
                      : "border border-white/15 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-cyan-400' : 'text-emerald-400'}`} />
                      <span className="text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about ParkFlow AI pricing.</p>
          </div>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
              >
                <h3 className="font-bold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
