import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CyberNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-display font-bold text-white tracking-wider flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00ff41] animate-pulse"></div>
          VESSEL
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-sm mx-auto h-px bg-gradient-to-r from-transparent via-[#00ff41]/50 to-transparent"></div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-white hover:text-[#00ff41] hover:bg-[#00ff41]/10 font-mono text-sm hidden sm:flex">
          [DOCS]
        </Button>
        <Button className="bg-[#00ff41] hover:bg-[#00ff41]/80 text-black font-mono font-bold rounded-none uppercase tracking-wider">
          Launch App
        </Button>
      </div>
    </nav>
  );
}
