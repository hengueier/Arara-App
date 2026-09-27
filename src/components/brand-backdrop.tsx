import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Brand } from '@/constants/theme';

type Props = ViewProps & {
  children?: React.ReactNode;
};

/** Full-bleed navy atmosphere matching SGC / AraraTech login. */
export function BrandBackdrop({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={[Brand.navyMid, Brand.navy, Brand.navyDeep]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(37, 99, 168, 0.38)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(26, 106, 173, 0.22)']}
        start={{ x: 0.8, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
});
