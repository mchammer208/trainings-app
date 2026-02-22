import type { PropsWithChildren } from "react";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem" }}>
      <h1>Trainingsentscheidungs-App</h1>
      {children}
    </main>
  );
};
