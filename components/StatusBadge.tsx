import { StageName, STAGE_LABELS, STAGE_COLORS } from '@/lib/types';

export default function StatusBadge({ stage }: { stage: StageName }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
