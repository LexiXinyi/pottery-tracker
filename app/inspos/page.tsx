import { getAllInspos } from '@/lib/queries';
import InspoGrid from '@/components/InspoGrid';

export const dynamic = 'force-dynamic';

export default async function InsposPage() {
  const inspos = await getAllInspos();
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Inspo</h1>
      <InspoGrid inspos={inspos} />
    </div>
  );
}
