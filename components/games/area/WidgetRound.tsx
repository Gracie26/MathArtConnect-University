import type { AreaWidget, CheckedEvaluation } from '@/lib/games/areaWidgets';

import { AccumulationRound } from './AccumulationRound';
import { ChainRound } from './ChainRound';
import { ComparisonRound } from './ComparisonRound';
import { EqualAreaRound } from './EqualAreaRound';
import { ImproperRound } from './ImproperRound';
import { PropertyRound } from './PropertyRound';
import { RiemannRound } from './RiemannRound';

/**
 * A widget reports every checked action. A correct final action solves the
 * round; a correct intermediate step is reported with `cannotCheck` so its
 * feedback shows without scoring; a wrong action counts as a retry.
 */
export interface WidgetProps<W extends AreaWidget> {
  widget: W;
  locked: boolean;
  onResult: (evaluation: CheckedEvaluation) => void;
}

/** Topic 2 graph rounds, each drawn by its own interactive component. */
export function WidgetRound({ widget, locked, onResult }: WidgetProps<AreaWidget>) {
  switch (widget.type) {
    case 'riemann':
      return <RiemannRound widget={widget} locked={locked} onResult={onResult} />;
    case 'chain':
      return <ChainRound widget={widget} locked={locked} onResult={onResult} />;
    case 'property':
      return <PropertyRound widget={widget} locked={locked} onResult={onResult} />;
    case 'accumulation':
      return <AccumulationRound widget={widget} locked={locked} onResult={onResult} />;
    case 'equalArea':
      return <EqualAreaRound widget={widget} locked={locked} onResult={onResult} />;
    case 'improper':
      return <ImproperRound widget={widget} locked={locked} onResult={onResult} />;
    case 'comparison':
      return <ComparisonRound widget={widget} locked={locked} onResult={onResult} />;
  }
}
