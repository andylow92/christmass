// lib/validation.ts
import { z } from 'zod';

// Optional free-text field: blank input is stored as null, a missing key is left alone
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .nullish()
    .transform((value) => (value === undefined ? undefined : value || null));

export const giftDetailsSchema = z.strictObject({
  item: z
    .string()
    .trim()
    .min(1, 'Item is required')
    .max(200, 'Item must be at most 200 characters'),
  description: optionalText(2000, 'Description'),
  priceRange: optionalText(50, 'Price range'),
});

export const giftStatusSchema = z.enum(['pending', 'will_buy', 'bought']);

export const giftStatusUpdateSchema = z.strictObject({
  status: giftStatusSchema,
});

export const MIN_PASSWORD_LENGTH = 8;

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(60, 'Name must be at most 60 characters'),
  email: z.string().trim().toLowerCase().pipe(z.email('Please enter a valid email')),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input';
}
