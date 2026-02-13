'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Users, Camera } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Client', href: '/client', icon: Users },
  { name: 'Camera', href: '/camera', icon: Camera },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        <div className="flex flex-col items-center justify-center py-1 px-3">
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  )
}