import { useCallback, useState } from "react";
import { SignInDialog } from "../components/auth/SignInDialog";
import type { SignInValues } from "../components/auth/signInSchema";
import { Features } from "../components/landing/Features";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";

type LandingPageProps = {
  onSignIn?: (values: SignInValues) => void;
};

export function LandingPage({ onSignIn }: LandingPageProps) {
  const [signInOpen, setSignInOpen] = useState(false);
  const openSignIn = useCallback(() => setSignInOpen(true), []);
  const closeSignIn = useCallback(() => setSignInOpen(false), []);

  return (
    <>
      <Header onSignIn={openSignIn} />
      <main>
        <Hero onSignIn={openSignIn} />
        <Features />
      </main>
      <SignInDialog
        open={signInOpen}
        onClose={closeSignIn}
        onSubmit={(values) => onSignIn?.(values)}
      />
    </>
  );
}
