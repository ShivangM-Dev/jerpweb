import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen pb-16 bg-gray-50 dark:bg-gray-900">
        <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <Navbar />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}