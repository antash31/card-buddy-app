// #genai: Simple themed surface container — a thin wrapper over the soft raised `Surface`, kept for
// the leftover starter screens that still import the primitives barrel.
import { Surface } from '@/components/surfaces/Surface';

export function Card({ children, style, elevated = true }) {
  return (
    <Surface shadow={elevated ? 'md' : 'none'} style={style} contentStyle={{ gap: 8 }}>
      {children}
    </Surface>
  );
}
