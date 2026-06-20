import React, { useState } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2 } from 'lucide-react';

const VOLUNTEER_IMG = 'https://media.base44.com/images/public/6a3418bebdfcfa2d9b852821/1c53969f0_generated_4cd383fa.png';

export default function Volunteer() {
  const { t } = useLang();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '', mobile: '', email: '', address: '',
    skills: [], interests: '', availability: 'weekdays',
  });

  const skillOptions = [
    { key: 'skill_teaching', value: 'teaching' },
    { key: 'skill_music', value: 'music' },
    { key: 'skill_art', value: 'art' },
    { key: 'skill_therapy', value: 'therapy' },
    { key: 'skill_computer', value: 'computer' },
    { key: 'skill_sports', value: 'sports' },
  ];

  const availOptions = [
    { key: 'avail_weekdays', value: 'weekdays' },
    { key: 'avail_weekends', value: 'weekends' },
    { key: 'avail_both', value: 'both' },
  ];

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.mobile.trim()) return;
    setSubmitting(true);
    await base44.entities.Volunteer.create(form);
    setSubmitting(false);
    setSubmitted(true);
    toast({ description: t('success_msg') });
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{t('success_msg')}</h2>
          <p className="text-muted-foreground">{t('volunteer_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('volunteer_title')} description={t('volunteer_desc')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div className="rounded-3xl overflow-hidden sticky top-24">
                <img src={VOLUNTEER_IMG} alt="Group of volunteers standing together" className="w-full h-auto object-cover" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('field_name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_mobile')} *</label>
                    <input
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={e => setForm({ ...form, mobile: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_email')}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('field_address')}</label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">{t('field_skills')}</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <button
                        key={skill.value}
                        type="button"
                        onClick={() => toggleSkill(skill.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${form.skills.includes(skill.value) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {t(skill.key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('field_interests')}</label>
                  <input
                    type="text"
                    value={form.interests}
                    onChange={e => setForm({ ...form, interests: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">{t('field_availability')}</label>
                  <div className="flex flex-wrap gap-2">
                    {availOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, availability: opt.value })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${form.availability === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {t(opt.key)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 min-h-[48px]"
                >
                  {submitting ? t('loading') : t('submit')}
                </button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}