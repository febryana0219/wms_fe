import React from 'react';
import { Sun, Moon, Monitor, Globe, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor size={16} />;
    if (theme === 'dark' || (theme === 'system' && effectiveTheme === 'dark')) return <Moon size={16} />;
    return <Sun size={16} />;
  };

  return (
    <header className="bg-gradient-to-r from-primary via-primary to-primary/95 border-b border-primary/20 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between backdrop-blur-xl shadow-lg relative overflow-hidden h-[73px]">
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -z-10" />
      <div className="flex items-center gap-3 sm:gap-6 relative z-10 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-primary-foreground hover:bg-white/20 rounded-xl p-2 sm:p-3 transition-all duration-300 hover:scale-105 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Menu size={18} className="sm:w-5 sm:h-5" />
        </Button>
        <div className="hidden sm:block min-w-0 flex-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-primary-foreground tracking-wide truncate">
            {/* Full title on large screens */}
            <span className="hidden lg:inline">Warehouse Management & Order System</span>
            {/* Short title on medium screens */}
            <span className="hidden sm:inline lg:hidden">WMS - Order System</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-white/20 rounded-xl px-2 sm:px-3 lg:px-4 py-2 transition-all duration-300" 
              title={`Current language: ${language.toUpperCase()}`}
            >
              <Globe size={16} className="flex-shrink-0" />
              <span className="ml-1 sm:ml-2 uppercase font-medium text-xs sm:text-sm">{language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => {
                console.log('Switching to Indonesian');
                setLanguage('id');
              }} 
              className={language === 'id' ? 'bg-accent' : ''}
            >
              <span className="mr-2">🇮🇩</span>
              Bahasa Indonesia
              {language === 'id' && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                console.log('Switching to English');
                setLanguage('en');
              }} 
              className={language === 'en' ? 'bg-accent' : ''}
            >
              <span className="mr-2">🇺🇸</span>
              English
              {language === 'en' && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>



        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-white/20 rounded-xl p-2 sm:p-3 transition-all duration-300" 
              title={`Current theme: ${theme} (${effectiveTheme})`}
            >
              {getThemeIcon()}
              <span className="hidden sm:inline ml-2 text-xs opacity-75">{effectiveTheme}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
              <Sun size={16} className="mr-2" />
              {t('settings.light')}
              {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
              <Moon size={16} className="mr-2" />
              {t('settings.dark')}
              {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
              <Monitor size={16} className="mr-2" />
              {t('settings.system')}
              {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 rounded-xl px-2 sm:px-3 lg:px-4 py-2 transition-all duration-300">
              <div className="w-8 h-8 bg-white/20 text-primary-foreground rounded-xl flex items-center justify-center text-sm font-medium backdrop-blur-sm flex-shrink-0">
                {user?.name[0]}
              </div>
              <span className="hidden sm:inline ml-2 lg:ml-3 font-medium text-sm lg:text-base truncate max-w-[120px] lg:max-w-none">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};