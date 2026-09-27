import { z } from 'zod';

import { USE_AUTH_BRIDGE } from '@/config/tenants';

export const loginFormSchema = z.object({
  user: USE_AUTH_BRIDGE
    ? z
        .string()
        .min(1, 'Informe o usuário')
        .regex(
          /^[^@\s]+@[a-z0-9][a-z0-9._-]*$/i,
          'Use o formato usuario@cliente (ex.: admin@demo)',
        )
    : z.string().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
