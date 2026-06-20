import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n.jsx';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useLang();

  const quickLinks = [
    { key: 'nav_about', path: '/about' },
    { key: 'nav_wish_wall', path: '/wish-wall' },
    { key: 'nav_events', path: '/events' },
    { key: 'nav_volunteer', path: '/volunteer' },
    { key: 'nav_donate', path: '/donate' },
    { key: 'nav_impact', path: '/impact' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Heart className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="font-heading font-bold text-lg">Smart Care Connect</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('footer_connect')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/70">
                  Smart Care Connect, Ahmedabad, Gujarat 380015
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <a href="tel:+919876543210" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <a href="mailto:info@smartcareconnect.org" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  info@smartcareconnect.org
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('contact_hours')}
            </h4>
            <p className="text-sm text-primary-foreground/70">{t('contact_hours_value')}</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">{t('footer_rights')}</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/50 cursor-pointer hover:text-primary-foreground/70 transition-colors">{t('footer_privacy')}</span>
            <span className="text-xs text-primary-foreground/50 cursor-pointer hover:text-primary-foreground/70 transition-colors">{t('footer_terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}