import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Moon, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export const SiteLayout = ({ children }: SiteLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-50">✦ Roblox Profit Radar</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-slate-50 ${
                isActive('/') ? 'text-slate-50' : 'text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-slate-50 ${
                isActive('/pricing') ? 'text-slate-50' : 'text-slate-200'
              }`}
            >
              Pricing
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-slate-50 ${
                  isActive('/dashboard') ? 'text-slate-50' : 'text-slate-200'
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/support"
              className={`text-sm font-medium transition-colors hover:text-slate-50 ${
                isActive('/support') ? 'text-slate-50' : 'text-slate-200'
              }`}
            >
              Support
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-slate-200 hover:text-slate-50 hover:bg-white/10"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-white/20 text-slate-50">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" className="text-slate-200 hover:text-slate-50 hover:bg-white/10">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-white/20 text-slate-50 hover:bg-white/30">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-brand-dark100/50 to-transparent border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/pricing" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-slate-50 transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-300">© 2025 Roblox Profit Radar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};