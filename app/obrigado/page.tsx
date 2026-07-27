import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
import PurchaseConfirmation from "./PurchaseConfirmation";

export const metadata: Metadata = {
  title: "Confirmação",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Obrigado() {
  return (
    <PublicShell compact>
      <PurchaseConfirmation />
    </PublicShell>
  );
}
