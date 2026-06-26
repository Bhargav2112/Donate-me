import React, { useState } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const { t } = useLang();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', subject: '', message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    await base44.entities.ContactMessage.create(form);
    setSubmitting(false);
    setSubmitted(true);
    toast({ description: t('success_msg') });
  };

  const contactCards = [
    {
      icon: MapPin,
      title: t('contact_address'),
      value: 'Smart Care Connect, Near City Hospital, Satellite Road, Ahmedabad, Gujarat 380015',
    },
    {
      icon: Phone,
      title: t('contact_phone'),
      value: '+91 98765 43210',
      href: 'tel:+919876543210',
    },
    {
      icon: Mail,
      title: t('contact_email'),
      value: 'info@smartcareconnect.org',
      href: 'mailto:info@smartcareconnect.org',
    },
    {
      icon: Clock,
      title: t('contact_hours'),
      value: t('contact_hours_value'),
    },
  ];

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('contact_title')} description={t('contact_desc')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactCards.map((card, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="bg-card rounded-2xl border border-border p-6 text-center hover:border-secondary/30 transition-colors h-full">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-2">{card.title}</h3>
                  {card.href ? (
                    <a href={card.href} className="text-sm text-secondary hover:underline break-all">{card.value}</a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{card.value}</p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <ScrollReveal>
              <div className="rounded-2xl overflow-hidden border border-border h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.2!2d72.51!3d23.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAyJzAwLjAiTiA3MsKwMzAnMzYuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Smart Care Connect Location"
                ></iframe>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal delay={0.1}>
              {submitted ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground text-xl mb-2">{t('success_msg')}</h3>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                  <h3 className="font-heading font-semibold text-foreground text-lg mb-6">{t('contact_form_title')}</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('field_name')} *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('field_email')}</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('field_mobile')}</label>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={e => setForm({ ...form, mobile: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('field_subject')}</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={e => setForm({ ...form, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('field_message')} *</label>
                      <textarea
                        rows={5}
                        required
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 min-h-[48px]"
                    >
                      {submitting ? t('loading') : t('send_message')}
                    </button>
                  </form>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}