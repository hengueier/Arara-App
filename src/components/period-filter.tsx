import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import {
  formatIso,
  formatRangeLabel,
  formatShortDate,
  parseIsoDate,
  presetSelection,
  resolvePeriod,
  type PeriodPreset,
  type PeriodSelection,
} from '@/utils/dates';

type Props = {
  value: PeriodSelection;
  onChange: (selection: PeriodSelection) => void;
};

const OPTIONS: { id: PeriodPreset; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
];

export function PeriodFilter({ value, onChange }: Props) {
  const range = resolvePeriod(value);
  const customActive = value.kind === 'range';
  const [open, setOpen] = useState(false);
  const [draftDe, setDraftDe] = useState(() => parseIsoDate(range.de));
  const [draftAte, setDraftAte] = useState(() => parseIsoDate(range.ate));
  const [picking, setPicking] = useState<'de' | 'ate' | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  function openCustom() {
    const current = resolvePeriod(value);
    setDraftDe(parseIsoDate(current.de));
    setDraftAte(parseIsoDate(current.ate));
    setPicking(Platform.OS === 'ios' ? 'de' : null);
    setRangeError(null);
    setOpen(true);
  }

  function onPick(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setPicking(null);
      if (event.type !== 'set' || !selected) return;
    }
    if (!selected || !picking) return;
    if (picking === 'de') setDraftDe(selected);
    else setDraftAte(selected);
    setRangeError(null);
  }

  function apply() {
    const de = formatIso(draftDe);
    const ate = formatIso(draftAte);
    if (de > ate) {
      setRangeError('A data inicial não pode ser posterior à final.');
      return;
    }
    onChange({ kind: 'range', de, ate });
    setOpen(false);
    setPicking(null);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = value.kind === 'preset' && value.preset === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(presetSelection(option.id))}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={openCustom}
          style={[styles.chip, customActive && styles.chipActive]}
        >
          <Text style={[styles.chipText, customActive && styles.chipTextActive]}>Período</Text>
        </Pressable>
      </View>
      <Text style={styles.rangeLabel}>{formatRangeLabel(range.de, range.ate)}</Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Período</Text>
            <Text style={styles.sheetHint}>Escolha um dia nos dois campos ou um intervalo.</Text>

            <View style={styles.dateRow}>
              <Pressable
                onPress={() => setPicking('de')}
                style={[styles.dateField, picking === 'de' && styles.dateFieldActive]}
              >
                <Text style={styles.dateCaption}>De</Text>
                <Text style={styles.dateValue}>{formatShortDate(formatIso(draftDe))}</Text>
              </Pressable>
              <Pressable
                onPress={() => setPicking('ate')}
                style={[styles.dateField, picking === 'ate' && styles.dateFieldActive]}
              >
                <Text style={styles.dateCaption}>Até</Text>
                <Text style={styles.dateValue}>{formatShortDate(formatIso(draftAte))}</Text>
              </Pressable>
            </View>

            {Platform.OS === 'ios' && picking ? (
              <DateTimePicker value={picking === 'de' ? draftDe : draftAte} mode="date" display="spinner" onChange={onPick} />
            ) : null}

            {rangeError ? <Text style={styles.error}>{rangeError}</Text> : null}

            <View style={styles.actions}>
              <Pressable onPress={() => setOpen(false)} style={styles.secondary}>
                <Text style={styles.secondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={apply} style={styles.primary}>
                <Text style={styles.primaryText}>Aplicar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {Platform.OS === 'android' && picking ? (
        <DateTimePicker
          value={picking === 'de' ? draftDe : draftAte}
          mode="date"
          display="default"
          onChange={onPick}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Brand.blueDeep,
    borderColor: Brand.blueDeep,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.muted,
  },
  chipTextActive: {
    color: Brand.white,
  },
  rangeLabel: {
    fontSize: 13,
    color: Brand.ink,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 21, 36, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.ink,
  },
  sheetHint: {
    fontSize: 13,
    color: Brand.muted,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: 4,
  },
  dateFieldActive: {
    borderColor: Brand.blue,
  },
  dateCaption: {
    fontSize: 12,
    color: Brand.muted,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 16,
    color: Brand.ink,
    fontWeight: '700',
  },
  error: {
    color: Brand.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  secondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: Brand.muted,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: Brand.blueDeep,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryText: {
    color: Brand.white,
    fontWeight: '700',
  },
});
