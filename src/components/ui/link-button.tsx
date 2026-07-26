import Link from "next/link";

import { buttonVariants, type ButtonSize, type ButtonVariant } from "./button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  prefetch,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  prefetch?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={buttonVariants({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
