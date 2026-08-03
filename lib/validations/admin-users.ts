import { z } from 'zod'

const strongPassword = z
  .string()
  .min(12, 'A senha deve ter pelo menos 12 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .regex(/[a-z]/, 'Inclua pelo menos uma letra minúscula.')
  .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula.')
  .regex(/[0-9]/, 'Inclua pelo menos um número.')
  .regex(/[^A-Za-z0-9]/, 'Inclua pelo menos um símbolo.')

export const createAdminUserSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Informe o nome completo.').max(120),
    email: z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(254),
    password: strongPassword,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'As senhas não são iguais.',
  })

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>
