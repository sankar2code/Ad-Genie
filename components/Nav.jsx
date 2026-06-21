'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Ticket, CircleUser, LogOut } from 'lucide-react';
import GenieLamp from '@/components/icons/GenieLamp';

const NAV_ITEMS = [
  { href: '/offers',    icon: Ticket,          label: 'Offers'    },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile',   icon: CircleUser,      label: 'Profile'   },
];

export default function Nav() {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    router.push('/login');
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-[72px] flex flex-col items-center py-5 z-50"
      style={{
        background: 'linear-gradient(180deg, #0C0720 0%, #05010F 100%)',
        borderRight: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}>

      {/* Logo */}
      <Link href="/offers" className="mb-8 flex items-center justify-center relative group" title="Ad-Genie">
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(8px)' }} />
        <GenieLamp size={38} className="ag-float relative" />
      </Link>

      {/* Divider */}
      <div className="w-8 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1 w-full">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-full h-14 gap-1 text-[10px] font-semibold transition-all duration-200 ${
                active ? 'text-ag-magic' : 'text-ag-fg-muted hover:text-ag-fg-subtle'
              }`}
              style={active ? {
                background: 'rgba(139,92,246,0.12)',
              } : {}}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #8B5CF6, #14B8A6)' }} />
              )}
              {/* Icon glow on active */}
              {active && (
                <div className="absolute inset-0 opacity-20"
                  style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.6) 0%, transparent 70%)' }} />
              )}
              <Icon className={`w-5 h-5 relative ${active ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]' : ''}`} strokeWidth={1.5} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Sign out"
        className="flex flex-col items-center justify-center w-full h-14 gap-1 text-[10px] font-semibold text-ag-fg-muted hover:text-ag-error transition-colors"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
        Sign out
      </button>
    </nav>
  );
}
