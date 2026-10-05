import { Slot } from "@radix-ui/react-slot";
import { Button } from "./ui/button";
import Magnetic from "./ui/magnetic";

interface ContactUsLinkProps {
  children?: React.ReactNode;
  subject?: string;
  body?: string;
  className?: string;
  magnetic?: boolean;
  asChild?: boolean;
  href?: string;
}

export const BookCallLink = ({
  magnetic = false,
  children,
  ...rest
}: ContactUsLinkProps) => {
  return (
    <ContactUsLink magnetic={magnetic} {...rest}>
      {children ?? "Book a call"}
    </ContactUsLink>
  );
};

export const ContactUsLink = ({
  children,
  className,
  magnetic,
  asChild,
  ...rest
}: ContactUsLinkProps) => {
  const Component = asChild ? Slot : Button;

  let button = (
    <Component className={className} href="/vibe-fixer-book-call" {...rest}>
      {children}
    </Component>
  );

  if (magnetic) {
    button = <Magnetic>{button}</Magnetic>;
  }

  return button;
};
