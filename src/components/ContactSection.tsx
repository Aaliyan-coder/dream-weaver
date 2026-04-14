import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowRight, Check, Loader2 } from "lucide-react";

// ─── Change this to your deployed backend URL in production ──────────────────
const API_URL = "https://dream-weaver-blue.vercel.app/api/contact";
// ─────────────────────────────────────────────────────────────────────────────

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = formRef.current!;
    const data = {
      firstName: (form.querySelector("[name='first_name']") as HTMLInputElement).value,
      lastName:  (form.querySelector("[name='last_name']")  as HTMLInputElement).value,
      email:     (form.querySelector("[name='email']")      as HTMLInputElement).value,
      phone:     (form.querySelector("[name='phone']")      as HTMLInputElement).value,
      service:   (form.querySelector("[name='service']")    as HTMLSelectElement).value,
      message:   (form.querySelector("[name='message']")    as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send message.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-5 relative overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(338 60% 97%) 0%, hsl(0 0% 100%) 50%, hsl(272 15% 97%) 100%)" }}>
      <div className="absolute -bottom-44 -right-28 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-20 w-[360px] h-[360px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7 }}
        className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16 items-start relative z-10"
      >
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-accent border border-primary/15 text-primary text-[11px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-dot" />
            Get in Touch
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-snug mb-4">
            Let's talk about your <span className="text-gradient-plum italic">business goals</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Whether you're just exploring ERP or ready to go live, our team is here to guide you every step of the way.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: Mail,  label: "Email Us",       value: "info@bigbinaryerp.com",          href: "mailto:info@bigbinaryerp.com" },
              { icon: Phone, label: "Call Us",        value: "+92 326 8880101",                href: "tel:03268880101" },
              { icon: MapPin,label: "Our Office",     value: "444-Q DHA Phase 2, Lahore, Pakistan", href: "#" },
              { icon: Clock, label: "Business Hours", value: "Mon – Sat, 10am – 7pm PKT" },
            ].map((c) => {
              const Wrapper = c.href ? "a" : "div";
              return (
                <Wrapper
                  key={c.label}
                  {...(c.href ? { href: c.href } : {})}
                  className="flex items-center gap-4 bg-card border border-primary/10 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/20 transition-all no-underline"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <c.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-plum-glow">{c.label}</div>
                    <div className="text-sm font-semibold text-foreground">{c.value}</div>
                  </div>
                </Wrapper>
              );
            })}
          </div>

          <div className="flex gap-2.5 mt-7">
            {["f", "𝕏", "in", "📷"].map((s) => (
              <a key={s} href="#" className="w-10 h-10 rounded-lg bg-card border border-primary/15 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 transition-all shadow-sm">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-card rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elevated)] border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-plum-glow via-plum-dark via-plum-glow to-primary bg-[length:300%_100%] animate-shimmer" />

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-plum-glow flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-card)]">
                <Check size={30} className="text-primary-foreground" />
              </div>
              <h4 className="font-display text-2xl font-bold text-foreground mb-3">Message sent!</h4>
              <p className="text-muted-foreground">Thank you for reaching out. We'll be in touch shortly.</p>
            </div>
          ) : (
            <>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">Send us a message</h3>
              <p className="text-sm text-muted-foreground mb-7">We respond within one business day.</p>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">First Name <span className="text-primary">*</span></label>
                    <input name="first_name" required className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none" placeholder="Ahmed" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">Last Name <span className="text-primary">*</span></label>
                    <input name="last_name" required className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none" placeholder="Raza" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">Email <span className="text-primary">*</span></label>
                    <input name="email" required type="email" className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">Phone</label>
                    <input name="phone" type="tel" className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none" placeholder="+92 300 0000000" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">Service <span className="text-primary">*</span></label>
                  <select name="service" required className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none appearance-none">
                    <option value="" disabled>Select a service…</option>
                    <option>ERP Implementation</option>
                    <option>CRM & Sales Module</option>
                    <option>Accounting & Finance</option>
                    <option>Inventory & Operations</option>
                    <option>HR & Payroll</option>
                    <option>Custom Module Development</option>
                    <option>General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/80 tracking-wide mb-1.5 block">Message <span className="text-primary">*</span></label>
                  <textarea name="message" required rows={4} className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card transition-all outline-none resize-y" placeholder="Tell us about your business needs…" />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-brand text-primary-foreground py-4 rounded-full text-sm font-bold shadow-[var(--shadow-elevated)] hover:opacity-90 hover:-translate-y-0.5 transition-all group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
