import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/pieces" className="font-semibold text-stone-800 text-lg tracking-tight">
          🏺 Pottery Tracker
        </Link>
        <Link href="/pieces/new" className={buttonVariants({ size: 'sm' })}>
          + New Piece
        </Link>
      </div>
    </nav>
  );
}
