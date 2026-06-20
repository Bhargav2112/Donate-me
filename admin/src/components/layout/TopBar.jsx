import React from 'react';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const initials = (user?.full_name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 pl-12 lg:pl-0" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 ml-2 pl-3 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight">{user?.full_name || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{user?.role || 'Super Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}