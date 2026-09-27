import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  variant?: 'default' | 'primary';
  size?: 'default' | 'compact';
  style?: ViewStyle;
};

export function MetricCard({
  label,
  value,
  variant = 'default',
  size = 'default',
  style,
}: Props) {
  const primary = variant === 'primary';
  const compact = size === 'compact';
  return (
    <View
      style={[
        styles.card,
        primary && styles.cardPrimary,
        compact && styles.cardCompact,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          primary && styles.labelPrimary,
          compact && styles.labelCompact,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          primary && styles.valuePrimary,
          compact && styles.valueCompact,
          compact && primary && styles.valueCompactPrimary,
        ]}
        numberOfLines={compact ? 2 : undefined}
        adjustsFontSizeToFit={compact}
        minimumFontScale={0.75}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.line,
    gap: Spacing.two,
  },
  cardCompact: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Radius.md,
  },
  cardPrimary: {
    backgroundColor: Brand.blueDeep,
    borderColor: Brand.blueDeep,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelCompact: {
    fontSize: 11,
  },
  labelPrimary: {
    color: 'rgba(255,255,255,0.75)',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.6,
  },
  valuePrimary: {
    color: Brand.white,
    fontSize: 30,
  },
  valueCompact: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
  valueCompactPrimary: {
    fontSize: 22,
  },
});