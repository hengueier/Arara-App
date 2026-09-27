export type PeriodPreset = 'hoje' | 'ontem' | 'semana' | 'mes';

export type PeriodSelection =
  | { kind: 'preset'; preset: PeriodPreset }
  | { kind: 'range'; de: string; ate: string };

export function presetSelection(preset: PeriodPreset): PeriodSelection {
  return { kind: 'preset', preset };
}

export function isoToday(): string {
  return formatIso(new Date());
}

export function formatIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

export function periodRange(preset: PeriodPreset, reference = new Date()): { de: string; ate: string } {
  const ate = formatIso(reference);
  if (preset === 'hoje') {
    return { de: ate, ate };
  }
  if (preset === 'ontem') {
    const yesterday = new Date(reference);
    yesterday.setDate(yesterday.getDate() - 1);
    const iso = formatIso(yesterday);
    return { de: iso, ate: iso };
  }
  if (preset === 'semana') {
    const start = new Date(reference);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return { de: formatIso(start), ate };
  }
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  return { de: formatIso(start), ate };
}

export function resolvePeriod(selection: PeriodSelection, reference = new Date()): { de: string; ate: string } {
  if (selection.kind === 'range') {
    return { de: selection.de, ate: selection.ate };
  }
  return periodRange(selection.preset, reference);
}

export function isHoje(selection: PeriodSelection): boolean {
  return selection.kind === 'preset' && selection.preset === 'hoje';
}

export function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateLabel(iso?: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatRangeLabel(de?: string, ate?: string): string {
  if (!de && !ate) return '—';
  if (!de || !ate || de === ate) return formatShortDate(de ?? ate);
  return `${formatShortDate(de)} – ${formatShortDate(ate)}`;
}

export function formatDateTime(value?: string | number): string {
  if (value == null) return '—';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
