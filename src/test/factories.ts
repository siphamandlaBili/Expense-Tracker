import type { SignInValues } from "../components/auth/signInSchema";

export function buildSignInValues(
  overrides: Partial<SignInValues> = {},
): SignInValues {
  return {
    accountNumber: "12345678901234",
    pin: "12345",
    ...overrides,
  };
}
