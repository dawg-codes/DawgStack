import { Card } from '@dawg-codes/react-toolkit';
import type { Stat } from '../data/types';

const numberFormat = new Intl.NumberFormat();

/** One headline number. Rendered as a list item inside the stat grid. */
export function StatCard({ stat }: { stat: Stat }) {
  return (
    <Card as="li" className="stat-card">
      <span className="stat-card__label">{stat.label}</span>
      <span className="stat-card__value">{numberFormat.format(stat.value)}</span>
      {stat.note && <span className="stat-card__note">{stat.note}</span>}
    </Card>
  );
}
