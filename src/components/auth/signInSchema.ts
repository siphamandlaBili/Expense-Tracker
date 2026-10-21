import { z } from "zod";
import type en from "../../i18n/locales/en.json";

export const ACCOUNT_NUMBER_LENGTH = 14;
export const PIN_LENGTH = 5;

export type SignInErrorKey =
  `signIn.errors.${keyof (typeof en)["signIn"]["errors"]}`;

const errorKey = (key: SignInErrorKey) => ({ error: key });

// Error messages are translation keys, resolved by the form at render time.
export const signInSchema = z.object({
  accountNumber: z
    .string()
    .min(1, errorKey("signIn.errors.accountNumberRequired"))
    .regex(
      new RegExp(`^\\d{${ACCOUNT_NUMBER_LENGTH}}$`),
      errorKey("signIn.errors.accountNumberInvalid"),
    ),
  pin: z
    .string()
    .min(1, errorKey("signIn.errors.pinRequired"))
    .regex(
      new RegExp(`^\\d{${PIN_LENGTH}}$`),
      errorKey("signIn.errors.pinInvalid"),
    ),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignInErrors = Partial<Record<keyof SignInValues, SignInErrorKey>>;

export function validateSignIn(values: SignInValues): SignInErrors {
  const result = signInSchema.safeParse(values);
  if (result.success) return {};

  const errors: SignInErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SignInValues;
    // Every rule above sets its message via errorKey(), so this cast holds.
    errors[field] ??= issue.message as SignInErrorKey;
  }
  return errors;
}
