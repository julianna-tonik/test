"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Separator } from "@/components/ui/separator";
import { List, ListItem } from "../ui/list-item";
import { cn, isTouchDevice } from "@/lib/utils";
import { Children, ReactNode, useState } from "react";
import { ContactUsLink } from "../contact-us-button";
import { Slot } from "@radix-ui/react-slot";

function Duration({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">
      {children}
    </p>
  );
}

const titleVariants = cva("text-off-white font-sans transition-all", {
  variants: {
    variant: {
      small: "text-xl",
      big: "text-3xl",
    },
  },
  defaultVariants: {
    variant: "big",
  },
});

function Title({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & VariantProps<
  typeof titleVariants
>) {
  return <p className={cn(titleVariants(rest), className)}>{children}</p>;
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-6 text-off-white-light">{children}</p>;
}

function Header({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const count = Children.count(children);
  const rows =
    count === 2
      ? "grid-rows-[auto_calc(var(--spacing)*12)]"
      : "grid-rows-[auto_auto_calc(var(--spacing)*12)]";
  return (
    <div className={cn("grid w-full gap-2", rows, className)}>{children}</div>
  );
}

function Price({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-1 text-off-white">
      <p className="font-mono text-sm uppercase leading-none tracking-tight">
        From
      </p>
      <p className="text-xl leading-7">{children}</p>
    </div>
  );
}

function Card({
  children,
  className,
  asChild = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(
        "flex flex-1 border border-dark-grey relative gap-4 p-10 flex-col",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

interface PricingCardProps {
  duration: string;
  title: string;
  description: string;
  price: string;
  features?: string[];
  className?: string;
}

function PricingCard({
  duration,
  title,
  description,
  price,
  features,
  className,
  ...rest
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 items-start justify-items-start content-start gap-y-6",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Header */}
        <Header>
          <Duration>{duration}</Duration>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Header>

        <Separator className="invisible" />

        <Price>{price}</Price>

        {features && <Separator />}
      </div>
      {features && (
        <List>
          {features.map((feature, index) => (
            <ListItem key={index}>{feature}</ListItem>
          ))}
        </List>
      )}
    </Card>
  );
}

export function PricingSection() {
  const [selectedGroup, setSelectedGroup] = useState(0);

  return (
    <section className="flex w-full flex-col gap-[120px] max-w-container-6xl pb-[120px]">
      {/* Header */}
      <div className="flex w-full flex-col gap-3">
        <Separator />
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">
          How We fix Your product
        </p>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col">
        {/* Sprints */}
        <div className="grid lg:grid-cols-3 grid-cols-1 w-full gap-4">
          <ContactUsLink
            className="flex-1 flex flex-col w-full justify-stretch items-stretch text-start"
            asChild
          >
            <a>
              <PricingCard
                duration="2–4 weeks"
                title="Sprint Package"
                description="A focused clean-up sprint tackling the biggest issues first."
                price="$9,000"
                features={[
                  "Product & code audit",
                  "Prioritized roadmap",
                  "Delivering critical fixes",
                ]}
              />
            </a>
          </ContactUsLink>

          <ContactUsLink
            className="flex-1 flex flex-col w-full justify-stretch items-stretch text-start"
            asChild
          >
            <a>
              <PricingCard
                duration="6–10 weeks"
                title="Full Refactor"
                description="End-to-end product refinement."
                price="$27,000"
                features={[
                  "Codebase cleaning",
                  "Performance tuning",
                  "Design standardization",
                  "UX/UI revamp",
                  "Architecture upgrade",
                ]}
              />
            </a>
          </ContactUsLink>

          <Card className="flex-1">
            <ContactUsLink
              className="flex-1 flex flex-col w-full gap-4 group justify-stretch items-stretch text-start"
              asChild
            >
              <a
                onMouseEnter={() => {
                  if (!isTouchDevice()) {
                    setSelectedGroup(0);
                  }
                }}
              >
                <Header
                  className={cn("transition-all", {
                    "pb-2": selectedGroup !== 0,
                  })}
                >
                  <Duration>Subscription options</Duration>
                  <Title
                    variant={selectedGroup === 0 ? "big" : "small"}
                    className="pointer-coarse:text-3xl"
                  >
                    Monthly support
                  </Title>
                  <Description>
                    Continuous maturity support,  monthly improvements.
                  </Description>
                </Header>

                <Separator className="invisible" />

                <Price>$1,250 / mo</Price>
              </a>
            </ContactUsLink>

            <Separator />

            <ContactUsLink
              className={cn(
                "flex-1 flex w-full flex-col gap-4 pb-2 pt-4 transition-all justify-stretch items-stretch text-start",
                {
                  "pt-6": selectedGroup !== 1,
                },
              )}
              asChild
            >
              <a
                onMouseEnter={() => {
                  if (!isTouchDevice()) {
                    setSelectedGroup(1);
                  }
                }}
              >
                <Header>
                  <Title
                    variant={selectedGroup === 1 ? "big" : "small"}
                    className="pointer-coarse:text-3xl"
                  >
                    Team Augmentation
                  </Title>
                  <Description>
                    Undivided focus on your product  to deliver our expertise to
                    your team.
                  </Description>
                </Header>

                <Separator className="invisible" />

                <Price>$900 / day</Price>
              </a>
            </ContactUsLink>
          </Card>
        </div>
      </div>
    </section>
  );
}
