import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, Spacing } from '@/constants/theme';

type MarkProps = {
  size?: number;
};

/** Simple macaw-inspired mark for POC (no asset dependency). */
export function BrandMark({ size = 56 }: MarkProps) {
  return (
    <LinearGradient
      colors={[Brand.blue, Brand.blueMid, Brand.blueDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
      ]}
    >
      <Text style={[styles.glyph, { fontSize: size * 0.42 }]}>A</Text>
    </LinearGradient>
  );
}

export function BrandWordmark({ light = true }: { light?: boolean }) {
  return (
    <View style={styles.wordwrap}>
      <Text style={[styles.word, { color: light ? Brand.white : Brand.ink }]}>Meu Arara</Text>
      <Text style={[styles.tag, { color: light ? 'rgba(255,255,255,0.78)' : Brand.muted }]}>
        Gestores · SGC
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  glyph: {
    color: Brand.white,
    fontWeight: '800',
    letterSpacing: -1,
  },
  wordwrap: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  word: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  tag: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});
