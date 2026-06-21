'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Ticket, CircleUser, LogOut } from 'lucide-react';

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
    <nav className="fixed left-0 top-0 h-full w-[72px] bg-ag-bg-subtle border-r border-ag-border flex flex-col items-center py-5 z-50">
      {/* Logo */}
      <Link href="/offers" className="text-2xl mb-8" title="Ad-Genie" aria-label="Ad-Genie home">
        🪔
      </Link>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-[72px] h-14 gap-1 text-xs font-semibold transition-colors ${
                active
                  ? 'text-ag-accent bg-ag-accent-subtle'
                  : 'text-ag-fg-muted hover:text-ag-fg-subtle hover:bg-ag-bg-surface'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-ag-accent rounded-r-full" />
              )}
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Sign out"
        className="flex flex-col items-center justify-center w-[72px] h-14 gap-1 text-[10px] font-semibold text-ag-fg-muted hover:text-ag-error transition-colors"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
        Sign out
      </button>
    </nav>
  );
}
