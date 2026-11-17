import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Âncora comum para uma seção da mesma página (o Lenis rola até ela);
 * Link do Next para outra página. Com #seção, a home rola até ela ao chegar (por isso scroll={false}).
 */
export default function NavLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("#")) return <a href={href} {...props} />;
  return <Link href={href} scroll={!href.includes("#")} {...props} />;
}
