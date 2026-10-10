// #genai: The Card Nest's row for Card Finder. Never locked: with the audit done it uses that spend,
// without it Card Finder asks a few questions of its own.
import { useRouter } from 'expo-router';

import { ToolRow } from '@/components/actions/ToolRow';
import { SearchIcon } from '@/components/icons';

import { entrySubtitle } from '../lib/finderCopy';

export function CardFinderRow({ auditDone }) {
  const router = useRouter();

  return (
    <ToolRow icon={SearchIcon} title="Card finder" subtitle={entrySubtitle(auditDone)} onPress={() => router.push('/card-finder')} />
  );
}
