import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-6xl font-light text-gray-900 dark:text-white mb-6">
            JERP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 font-light">
            Enterprise Resource Planning, Simplified
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-in"
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in?signUp=true"
              className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-500">
        <p>&copy; 2026 JERP. All rights reserved.</p>
      </footer>
    </div>
  )
}