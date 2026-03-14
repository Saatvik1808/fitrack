"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, PlusCircle, History, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Nav.module.css';

export default function Nav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={22} /> },
    { label: 'Log Activity', href: '/dashboard/log', icon: <PlusCircle size={22} /> },
    { label: 'Progress', href: '/dashboard/progress', icon: <LineChart size={22} /> },
    { label: 'History', href: '/dashboard/history', icon: <History size={22} /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={22} /> },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className="title-glow" style={{ fontSize: '1.5rem' }}>FitTrack AI</span>
      </div>
      
      <div className={styles.links}>
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`${styles.linkItem} ${isActive ? styles.active : ''}`}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.logoutContainer}>
        <button className={styles.logoutBtn} onClick={() => logout()}>
          <LogOut size={22} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
