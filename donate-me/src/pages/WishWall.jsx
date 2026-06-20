import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { Search, BookOpen, Stethoscope, UtensilsCrossed, Package, HandHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  education: BookOpen,
  health: Stethoscope,
  food: UtensilsCrossed,
  supplies: Package,
};

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low: 'bg-green-50 text-green-600 border-green-200',
};

export default function WishWall() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    base44.entities.WishItem.list()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    { key: 'all', label: t('filter_all') },
    { key: 'education', label: t('filter_education') },
    { key: 'health', label: t('filter_health') },
    { key: 'food', label: t('filter_food') },
    { key: 'supplies', label: t('filter_supplies') },
  ];

  const priorityLabel = (p) => {
    const map = { high: t('priority_high'), medium: t('priority_medium'), low: t('priority_low') };
    return map[p] || p;
  };

  const getTitle = (item) => {
    const key = `title_${lang}`;
    return item[key] || item.title_en || '';
  };

  const getDesc = (item) => {
    const key = `description_${lang}`;
    return item[key] || item.description_en || '';
  };

  const filtered = items.filter(item => {
    if (activeFilter !== 'all' && item.category !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return getTitle(item).toLowerCase().includes(q) || getDesc(item).toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('wish_wall_title')} description={t('wish_wall_desc')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] ${activeFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('no_data')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => {
                const Icon = CATEGORY_ICONS[item.category] || Package;
                const pct = item.quantity_needed > 0 ? Math.round((item.quantity_fulfilled || 0) / item.quantity_needed * 100) : 0;
                return (
                  <ScrollReveal key={item.id} delay={i * 0.05}>
                    <div className="bg-card rounded-2xl border border-border p-6 hover:border-secondary/30 transition-colors h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.low}`}>
                          {priorityLabel(item.priority)}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{getTitle(item)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{getDesc(item)}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{t('fulfilled_qty')}: {item.quantity_fulfilled || 0}</span>
                          <span>{t('needed_qty')}: {item.quantity_needed}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <Link
                          to="/donate"
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors min-h-[44px]"
                        >
                          <HandHeart className="w-4 h-4" />
                          {t('contribute')}
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}