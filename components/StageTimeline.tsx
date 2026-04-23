import { PieceWithDetails, STAGE_ORDER } from '@/lib/types';
import StageBlock from './StageBlock';

export default function StageTimeline({ piece }: { piece: PieceWithDetails }) {
  return (
    <div className="mt-6">
      {STAGE_ORDER.map((stageName) => {
        const stage = piece.stages.find((s) => s.stage_name === stageName);
        const photos = piece.photos.filter((p) => p.stage_name === stageName);
        if (!stage) return null;
        return (
          <StageBlock
            key={stageName}
            stage={stage}
            photos={photos}
            pieceId={piece.id}
            currentStage={piece.current_stage}
            glazeCombo={piece.glaze_combo}
          />
        );
      })}
    </div>
  );
}
