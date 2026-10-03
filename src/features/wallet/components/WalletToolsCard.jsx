// #genai: The Card Nest's doorway to the wallet tools: audit, then categorisation.
//
// Categorisation is *unlocked* by finishing the audit — the audit supplies the spend that says which
// card takes which category once caps are in play — so its row shows a lock until then rather than
// hiding, which keeps the whole path visible from the first visit.
import { useRouter } from 'expo-router';

import { ToolRow, TOOL_ROW_TILE } from '@/components/actions/ToolRow';
import { AuditIcon, GridIcon } from '@/components/icons';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { useWalletStatus } from '../hooks/useWallet';

export function WalletToolsCard() {
  const theme = useTheme();
  const router = useRouter();
  const status = useWalletStatus();

  const done = status.data?.auditCompleted === true;

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
      <Rule inset={theme.spacing.lg + TOOL_ROW_TILE + theme.spacing.md} />
      <ToolRow
        icon={GridIcon}
        title="Wallet categorisation"
        subtitle={done ? 'Which card to use for which spend.' : 'Finish the audit to unlock.'}
        locked={!done}
        onPress={() => router.push(done ? '/wallet-categories' : '/wallet-audit')}
      />
    </Surface>
  );
}
