'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {resolvedTheme === 'dark' ? (
          <Moon size={20} className="text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun size={20} className="text-gray-700 dark:text-gray-300" />
        )}
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          {themes.map(({ name, icon: Icon, label }) => (
            <button
              key={name}
              onClick={() => setTheme(name as 'light' | 'dark' | 'system')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                theme === name
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{label}</span>
              {theme === name && (
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}