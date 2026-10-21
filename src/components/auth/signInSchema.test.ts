import { describe, expect, it } from "vitest";
import { buildSignInValues } from "../../test/factories";
import { validateSignIn } from "./signInSchema";

describe("validateSignIn", () => {
  it("accepts a 14-digit account number and 5-digit PIN", () => {
    expect(validateSignIn(buildSignInValues())).toEqual({});
  });

  it("requires both fields", () => {
    expect(validateSignIn({ accountNumber: "", pin: "" })).toEqual({
      accountNumber: "signIn.errors.accountNumberRequired",
      pin: "signIn.errors.pinRequired",
    });
  });

  it.each(["1234567890123", "123456789012345", "1234567890123a"])(
    "rejects account number %s",
    (accountNumber) => {
      expect(validateSignIn(buildSignInValues({ accountNumber }))).toEqual({
        accountNumber: "signIn.errors.accountNumberInvalid",
      });
    },
  );

  it.each(["1234", "123456", "12a45"])("rejects PIN %s", (pin) => {
    expect(validateSignIn(buildSignInValues({ pin }))).toEqual({
      pin: "signIn.errors.pinInvalid",
    });
  });
});
