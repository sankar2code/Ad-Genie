'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PiggyBank, Ticket, QrCode, Flame, Wand2, TrendingUp, Star, Hash, Download } from 'lucide-react';
import KPICard from '@/components/KPICard';
import SavedOffersList from '@/components/SavedOffersList';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { STORE_KEYS, STORE_LABELS } from '@/lib/stores';

const ACTIVITY_PAGE_SIZE = 50;
const CHART_STORE_FILTERS = ['All', ...STORE_KEYS];

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Shopper');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('All');
  const [activityLimit, setActivityLimit] = useState(ACTIVITY_PAGE_SIZE);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    setUserId(id);
    if (email) setUserName(email.split('@')[0]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`/api/dashboard?userId=${userId}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const chartData = useMemo(() => {
    const days = lastNDays(30);
    const byDay = {};
    for (const day of days) byDay[day] = 0;
    for (const r of data?.redemptions || []) {
      if (storeFilter !== 'All' && r.offers?.store !== storeFilter) continue;
      const day = r.redeemed_at.slice(0, 10);
      if (day in byDay) byDay[day] += r.savings_amount || 0;
    }
    return days.map(day => ({
      day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      savings: Math.round(byDay[day] * 100) / 100,
    }));
  }, [data, storeFilter]);

  const kpis = data?.kpis;

  const kpiCards = kpis ? [
    { icon: PiggyBank, label: 'Total savings', value: `$${kpis.totalSavings.toFixed(2)}`, color: 'accent' },
    { icon: PiggyBank, label: 'Savings this month', value: `$${kpis.savingsThisMonth.toFixed(2)}`, color: 'genie' },
    { icon: Ticket, label: 'Online coupons used', value: kpis.onlineCount, color: 'accent' },
    { icon: QrCode, label: 'Offline coupons used', value: kpis.offlineCount, color: 'genie' },
    { icon: Flame, label: 'Savings streak', value: `${kpis.savingsStreak} days`, color: 'accent' },
    { icon: Star, label: 'Favourite store', value: kpis.favouriteStore, color: 'genie' },
    { icon: Wand2, label: 'Posters generated', value: kpis.postersGenerated, color: 'accent' },
    { icon: Download, label: 'Posters downloaded', value: kpis.postersDownloaded, color: 'genie' },
    { icon: TrendingUp, label: 'Avg saving / coupon', value: `$${kpis.avgSavingPerCoupon.toFixed(2)}`, color: 'accent' },
    { icon: Ticket, label: 'Active saved offers', value: kpis.activeOffers, color: 'genie' },
    { icon: Ticket, label: 'Expiring today', value: kpis.expiringToday, color: 'accent' },
    { icon: Star, label: 'Top category', value: kpis.topCategory, color: 'genie' },
  ] : Array.from({ length: 12 }, (_, i) => ({ icon: PiggyBank, label: '—', value: '--', color: i % 2 ? 'genie' : 'accent' }));

  const activity = (data?.activity || []).slice(0, activityLimit);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ag-fg-base">
            Welcome back, {userName} ✨
          </h1>
          <p className="text-ag-fg-subtle text-sm mt-0.5">Here's your savings overview.</p>
        </div>
        <Link
          href="/offers"
          className="ag-shimmer px-5 py-2.5 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors"
        >
          Browse deals
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-display text-lg font-semibold text-ag-fg-base">Savings — last 30 days</h2>
          <div className="flex flex-wrap gap-2">
            {CHART_STORE_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStoreFilter(s)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                  storeFilter === s
                    ? 'bg-ag-accent text-ag-fg-inverted border-ag-accent'
                    : 'border-ag-border text-ag-fg-subtle hover:text-ag-fg-base'
                }`}
              >
                {s === 'All' ? 'All' : STORE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: '#6B6047', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B6047', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#252348', border: '1px solid rgba(212,175,55,0.28)', borderRadius: 8 }}
              labelStyle={{ color: '#A89B7A', fontSize: 12 }}
              itemStyle={{ color: '#D4AF37' }}
              formatter={v => [`$${v}`, 'Savings']}
            />
            <Line type="monotone" dataKey="savings" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <SavedOffersList savedOffers={data?.savedOffers || []} />

      <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold text-ag-fg-base mb-4">Recent activity</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded bg-ag-bg-elevated animate-pulse" />)}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-ag-fg-subtle text-sm py-6 text-center">
            No activity yet — head to the offers feed to start saving.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-ag-border">
              {activity.map(a => (
                <li key={`${a.type}-${a.id}`} className="flex items-center justify-between py-3.5">
                  <p className="text-sm text-ag-fg-base">{a.text}</p>
                  <div className="text-right shrink-0 ml-4">
                    {a.amount ? <p className="text-sm font-semibold text-ag-success">${a.amount.toFixed(2)}</p> : null}
                    <p className="text-xs text-ag-fg-muted">{timeAgo(a.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
            {(data?.activity?.length || 0) > activityLimit && (
              <button
                onClick={() => setActivityLimit(n => n + ACTIVITY_PAGE_SIZE)}
                className="w-full mt-4 text-sm text-ag-fg-subtle hover:text-ag-fg-base transition-colors py-2"
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
