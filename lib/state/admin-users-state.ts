export interface CreateAdminUserState {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: Partial<Record<'fullName' | 'email' | 'password' | 'passwordConfirmation', string[]>>
}

export const initialCreateAdminUserState: CreateAdminUserState = {
  status: 'idle',
  message: '',
}
