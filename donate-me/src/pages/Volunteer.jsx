import React, { useState, useEffect } from 'react';
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
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    full_name: '', mobile: '', email: '', address: '',
    skills: [], interests: '', availability: 'weekdays',
  });

  const fetchVolunteers = () => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    const apiHost = isLocal ? `http://${host}:5000` : 'https://donate-me-j4ha.onrender.com';
    fetch(`${apiHost}/api/volunteers/public`)
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.success && resData.data) {
          const mapped = resData.data.map(i => ({
            id: i._id,
            full_name: i.fullName,
            photo: i.photo || '',
            skills: i.skills || [],
            created_date: i.createdAt
          }));
          setVolunteers(mapped);
        }
        setLoadingVolunteers(false);
      })
      .catch(err => {
        console.error('Failed to fetch volunteers:', err);
        setLoadingVolunteers(false);
      });
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast({ description: "Please enter your name.", variant: "destructive" });
      return;
    }
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(form.mobile.trim())) {
      toast({ description: "Mobile number must be exactly 10 digits.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let photo_url = '';
      if (photoFile) {
        const uploaded = await base44.integrations.Core.UploadFile({ file: photoFile });
        photo_url = uploaded.file_url;
      }
      await base44.entities.Volunteer.create({
        ...form,
        photo: photo_url
      });
      setSubmitting(false);
      setSubmitted(true);
      toast({ description: t('success_msg') });
      
      // Refresh local list
      fetchVolunteers();
    } catch (error) {
      console.error(error);
      toast({
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
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
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0 relative group">
                        <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-border bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-xs">
                        No Photo
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="volunteer-photo"
                    />
                    <label
                      htmlFor="volunteer-photo"
                      className="px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-sm font-medium cursor-pointer transition-colors"
                    >
                      Upload Photo
                    </label>
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

          {/* Dynamic Volunteer Gallery */}
          <ScrollReveal>
            <div className="mt-20 border-t border-border pt-16">
              <div className="text-center mb-12">
                <h3 className="font-heading font-bold text-3xl text-foreground mb-3">Our Dedicated Volunteers</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">Meet the passionate individuals who dedicate their time and talent to support the smart care community.</p>
              </div>
              {loadingVolunteers ? (
                <div className="text-center text-sm text-muted-foreground py-8">Loading volunteer gallery...</div>
              ) : volunteers.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">No registered volunteers yet. Be the first to join!</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {volunteers.map(vol => (
                    <div key={vol.id} className="flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {vol.photo ? (
                          <img src={vol.photo} alt={vol.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                            {vol.full_name?.charAt(0).toUpperCase() || 'V'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-heading font-semibold text-foreground text-base truncate mb-0.5">{vol.full_name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">Joined: {new Date(vol.created_date || vol.join_date).toLocaleDateString()}</p>
                        {vol.skills ? (
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(vol.skills) ? vol.skills : String(vol.skills).split(',')).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-semibold uppercase tracking-wider">
                                {String(s).trim()}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}