import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { login } from '@/api/auth';
import { cacheEmpresas } from '@/cache/db';
import { BrandBackdrop } from '@/components/brand-backdrop';
import { BrandMark, BrandWordmark } from '@/components/brand-mark';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { loginFormSchema, type LoginFormValues } from '@/forms/schemas';
import { TENANT_SELECTION_LOCKED, USE_AUTH_BRIDGE } from '@/config/tenants';
import { useAuthStore } from '@/store/use-auth-store';
import { useTenantStore } from '@/store/use-tenant-store';

export default function LoginScreen() {
  const router = useRouter();
  const tenant = useTenantStore((s) => s.tenant);
  const clearTenant = useTenantStore((s) => s.clearTenant);
  const setApiUrl = useTenantStore((s) => s.setApiUrl);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { user: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(values.user.trim(), values.password);
      if (result.apiUrl) {
        await setApiUrl(result.apiUrl);
      }
      await setSession({
        token: result.token,
        pessoaId: result.pessoaId,
        nome: result.nome,
        user: result.user,
        empresas: result.empresas,
      });
      await cacheEmpresas(result.empresas);
    } catch (err) {
      const response = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { message?: string } } }).response
        : undefined;
      const axiosMessage = response?.data?.message ?? '';
      if (response?.status === 403) {
        setError(
          axiosMessage ||
            'Seu usuário não possui perfil de Gerente no SGC. Solicite ao administrador.',
        );
      } else {
        setError(axiosMessage || (err instanceof Error ? err.message : 'Falha no login'));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <BrandBackdrop>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.shell}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={[Brand.blue, Brand.blueMid, Brand.blueDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.brandPanel}
              >
                <View style={styles.brandGlow} />
                <BrandMark size={64} />
                <BrandWordmark />
              </LinearGradient>

              <View style={styles.body}>
                <Text style={styles.bodyTitle}>Entrar</Text>
                <Text style={styles.bodyHint}>
                  {USE_AUTH_BRIDGE
                    ? 'Use usuario@cliente e a mesma senha do SGC'
                    : 'Use o mesmo usuário do SGC'}
                </Text>
                {!USE_AUTH_BRIDGE && tenant ? (
                  TENANT_SELECTION_LOCKED ? (
                    <View style={styles.tenantChip}>
                      <Text style={styles.tenantChipLabel}>Ambiente</Text>
                      <Text style={styles.tenantChipValue}>{tenant.nome}</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        void clearSession();
                        void clearTenant();
                        router.replace('/selecionar-cliente');
                      }}
                      style={styles.tenantChip}
                    >
                      <Text style={styles.tenantChipLabel}>Cliente</Text>
                      <Text style={styles.tenantChipValue}>{tenant.nome}</Text>
                      <Text style={styles.tenantChipAction}>Trocar</Text>
                    </Pressable>
                  )
                ) : null}

                <Controller
                  control={control}
                  name="user"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <View style={styles.field}>
                      <Text style={styles.label}>Usuário</Text>
                      <TextInput
                        placeholder={USE_AUTH_BRIDGE ? 'usuario@cliente' : 'seu.usuario'}
                        placeholderTextColor={Brand.muted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        style={styles.input}
                        returnKeyType="next"
                        keyboardType={USE_AUTH_BRIDGE ? 'email-address' : 'default'}
                      />
                      {fieldState.error ? (
                        <Text style={styles.error}>{fieldState.error.message}</Text>
                      ) : null}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <View style={styles.field}>
                      <Text style={styles.label}>Senha</Text>
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor={Brand.muted}
                        secureTextEntry
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        style={styles.input}
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                      />
                      {fieldState.error ? (
                        <Text style={styles.error}>{fieldState.error.message}</Text>
                      ) : null}
                    </View>
                  )}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  onPress={onSubmit}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.button,
                    { opacity: loading || pressed ? 0.85 : 1 },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={Brand.white} />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BrandBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  shell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Brand.white,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  brandPanel: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    position: 'relative',
  },
  brandGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  bodyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.3,
  },
  bodyHint: {
    fontSize: 13,
    color: Brand.muted,
    marginBottom: Spacing.two,
  },
  field: { gap: 6, marginBottom: Spacing.one },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 14,
    fontSize: 16,
    color: Brand.ink,
  },
  button: {
    marginTop: Spacing.two,
    backgroundColor: Brand.blue,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  error: { color: Brand.danger, fontSize: 13 },
  tenantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.two,
  },
  tenantChipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.muted,
    textTransform: 'uppercase',
  },
  tenantChipValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Brand.ink,
  },
  tenantChipAction: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.blue,
  },
});
