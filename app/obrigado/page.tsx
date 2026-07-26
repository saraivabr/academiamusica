import { PublicShell } from "../components/Portal";
import PurchaseConfirmation from "./PurchaseConfirmation";

export default function Obrigado() {
  return (
    <PublicShell compact>
      <PurchaseConfirmation />
    </PublicShell>
  );
}
