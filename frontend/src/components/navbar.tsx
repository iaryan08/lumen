"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed top-6 right-8 z-50 flex items-center gap-2">
      <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex gap-1 shadow-2xl">
        <Link 
          href="/" 
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${pathname === '/' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          📚 Study Mode
        </Link>
        <Link 
          href="/code-review" 
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${pathname === '/code-review' ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          💻 Code Mode
        </Link>
      </div>
    </nav>
  )
}
