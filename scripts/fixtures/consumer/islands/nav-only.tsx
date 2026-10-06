/* バンドル検査用（check-bundle.mjs）。NavItem だけを使う利用側を模す。
 * NavItem は framer-motion を含まないことが公開契約（decisions/adr-0008）。 */
import { NavItem } from "@hamirilo/application-ui-kit";
import { createRoot } from "react-dom/client";

const root = document.getElementById("nav");
if (root) {
  createRoot(root).render(<NavItem href="/" active label="ホーム" />);
}
