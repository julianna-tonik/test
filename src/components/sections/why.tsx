import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import illu1 from "@/assets/why/startups.svg";
import illu2 from "@/assets/why/code.svg";
import illu3 from "@/assets/why/scale.svg";
import illu4 from "@/assets/why/stabilize.svg";

interface WhyCardProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

function WhyCard({ title, description, illustration }: WhyCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-start">
        {illustration}
      </div>
      <div className="flex w-full flex-col text-base leading-6">
        <p className="text-off-white">{title}</p>
        <p className="text-off-white-light">{description}</p>
      </div>
    </div>
  );
}

export function WhySection() {
  const reasons = [
    {
      illustration: (
        <Image src={illu1} alt="" className="size-[84px] m-[-18px]" />
      ),
      title: "For Startups that Move Fast",
      description:
        "We specialize in fast-built MVPs that need to scale, we clean, optimize, and refactor without slowing you down.",
    },
    {
      illustration: (
        <Image src={illu2} alt="" className="size-[84px] m-[-18px]" />
      ),
      title: "Code + Design Aligned",
      description:
        "Zero handoff friction. UI, UX and codebase evolve together, always aligned, always ready to ship.",
    },
    {
      illustration: (
        <Image src={illu3} alt="" className="size-[84px] m-[-18px]" />
      ),
      title: "Ready for AI, Ready for Scale",
      description:
        "We structure your repo and workflows so AI-generated code stays clean, and agents don’t turn it into spaghetti.",
    },
    {
      illustration: (
        <Image src={illu4} alt="" className="size-[84px] m-[-18px]" />
      ),
      title: "You Build. We Stabilize.",
      description:
        "We take the mess off your plate so you can focus on growth, users, and product vision.",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center gap-[120px] pb-[120px] max-w-container-6xl">
      {/* Header */}
      <div className="flex w-full flex-col gap-3">
        <Separator />
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">
          Why tonik
        </p>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 w-full gap-10">
        {reasons.map((reason, index) => (
          <WhyCard
            key={index}
            title={reason.title}
            description={reason.description}
            illustration={reason.illustration}
          />
        ))}
      </div>
    </section>
  );
}
