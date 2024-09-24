import { valibotResolver } from '@hookform/resolvers/valibot';
import {
  type InferInput,
  type InferOutput,
  check,
  email,
  forward,
  maxLength,
  minLength,
  nonEmpty,
  number,
  object,
  pipe,
  regex,
  string,
  trim,
} from 'valibot';

export const UsernameSchema = pipe(
  string(),
  nonEmpty('Username is required'),
  minLength(3, 'Username must have at least 3 characters'),
  maxLength(32, 'Username must have at most 32 characters'),
  regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
);
export const EmailSchema = pipe(
  string(),
  trim(),
  nonEmpty('Email is required'),
  email('Invalid email'),
);
export const PasswordSchema = pipe(
  string(),
  nonEmpty('Password is required'),
  minLength(8, 'Password must have at least 8 characters'),
);

export const LoginSchema = object({ email: EmailSchema, password: PasswordSchema });
export const loginResolver = valibotResolver(LoginSchema);
export type LoginInput = InferInput<typeof LoginSchema>;
export type LoginOutput = InferOutput<typeof LoginSchema>;

export const PasswordAuthSchema = pipe(
  object({
    password: PasswordSchema,
    confirmPassword: pipe(string(), nonEmpty('Password confirmation is required')),
    passwordStrength: number(),
  }),
  forward(
    check(
      ({ password, confirmPassword }) => password === confirmPassword,
      'Passwords do not match',
    ),
    ['confirmPassword'],
  ),
  forward(
    check(({ passwordStrength }) => passwordStrength >= 2, 'Password is too weak'),
    ['password'],
  ),
);
export const passwordAuthResolver = valibotResolver(PasswordAuthSchema);
export type PasswordAuthInput = InferInput<typeof PasswordAuthSchema>;
export type PasswordAuthOutput = InferOutput<typeof PasswordAuthSchema>;

export const SignupSchema = pipe(
  object({
    username: UsernameSchema,
    email: EmailSchema,
    ...PasswordAuthSchema.entries,
  }),
  forward(
    check(
      ({ password, confirmPassword }) => password === confirmPassword,
      'Passwords do not match',
    ),
    ['confirmPassword'],
  ),
  forward(
    check(({ passwordStrength }) => passwordStrength >= 2, 'Password is too weak'),
    ['password'],
  ),
);
export const signupResolver = valibotResolver(SignupSchema);
export type SignupInput = InferInput<typeof SignupSchema>;
export type SignupOutput = InferOutput<typeof SignupSchema>;
