'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Download, 
  Settings, 
  Activity, 
  Zap,
  FileVideo,
  Link2,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Downloads', href: '/downloads', icon: Download },
  { name: 'Admin', href: '/admin', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-charcoal border border-graphite flex items-center justify-center'
      >
        <Menu className='w-5 h-5 text-silver' />
      </button>

      {isOpen && (
        <div 
          className='lg:hidden fixed inset-0 bg-black/50 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-screen w-20 bg-charcoal border-r border-graphite flex flex-col items-center py-6 z-50',
        'transition-transform duration-300 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className='mb-8'>
          <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center shadow-glow'>
            <Zap className='w-6 h-6 text-white' />
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className='lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center'
        >
          <X className='w-5 h-5 text-silver' />
        </button>

        <nav className='flex-1 flex flex-col gap-2'>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all relative',
                  isActive 
                    ? 'bg-violet/20 text-violet-light' 
                    : 'text-zinc hover:text-white hover:bg-surface'
                )}
                title={item.name}
              >
                <item.icon className='w-5 h-5' />
                {isActive && (
                  <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet rounded-r-full' />
                )}
              </Link>
            );
          })}
        </nav>

        <div className='mt-auto'>
          <div className='w-12 h-12 rounded-xl bg-surface flex items-center justify-center'>
            <Link2 className='w-5 h-5 text-zinc' />
          </div>
        </div>
      </aside>
    </>
  );
}

export function Header() {
  return (
    <header className="h-16 bg-charcoal/50 backdrop-blur-xl border-b border-graphite flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <FileVideo className="w-5 h-5 text-violet" />
        <span className="text-lg font-outfit font-semibold">VideoForge</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc">v1.0.0</span>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-obsidian'>
      <Sidebar />
      <div className='lg:ml-20'>
        <Header />
        <main className='p-4 lg:p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
