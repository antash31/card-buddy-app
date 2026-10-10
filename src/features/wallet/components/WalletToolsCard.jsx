// #genai: The Card Nest's doorway to the wallet tools: audit, then categorisation.
//
// Categorisation is *unlocked* by finishing the audit — the audit supplies the spend that says which
// card takes which category once caps are in play — so its row shows a lock until then rather than
// hiding, which keeps the whole path visible from the first visit.
//
// Other features that build on the audit's spend (Card Finder) join the same list through
// `children`, a function given `{ auditDone }`, so this card owns the status and no feature has to
// import another's internals.
import { Fragment } from 'react';
import { useRouter } from 'expo-router';

import { ToolRow, TOOL_ROW_TILE } from '@/components/actions/ToolRow';
import { AuditIcon, GridIcon } from '@/components/icons';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { useWalletStatus } from '../hooks/useWallet';

export function WalletToolsCard({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const status = useWalletStatus();

  const done = status.data?.auditCompleted === true;
  const ruleInset = theme.spacing.lg + TOOL_ROW_TILE + theme.spacing.md;
  const extra = typeof children === 'function' ? children({ auditDone: done }) : null;

  return (
    <Surface padded={false}>
      <ToolRow
        icon={AuditIcon}
        title="Wallet audit"
        subtitle={
          done
            ? `Done · ${formatRupeesWhole(status.data.monthlyTotal)} a month. Tap to review.`
            : 'Find out which cards to keep, close or add.'
        }
        onPress={() => router.push('/wallet-audit')}
      />
      <Rule inset={ruleInset} />
      <ToolRow
        icon={GridIcon}
        title="Wallet categorisation"
        subtitle={done ? 'Which card to use for which spend.' : 'Finish the audit to unlock.'}
        locked={!done}
        onPress={() => router.push(done ? '/wallet-categories' : '/wallet-audit')}
      />
      {extra ? (
        <Fragment>
          <Rule inset={ruleInset} />
          {extra}
        </Fragment>
      ) : null}
    </Surface>
  );
}
