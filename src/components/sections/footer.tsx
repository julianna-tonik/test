import Image from "next/image";
import Link from "next/link";
import brandingIcon from "./icons/branding.svg";
import pdIcon from "./icons/pd.svg";
import devIcon from "./icons/dev.svg";
import webIcon from "./icons/web.svg";
import { SplineLogo } from "../ui/spline-logo";

export function Footer() {
  const services = [
    {
      name: "Product Design",
      href: "https://www.tonik.com/product-design",
      icon: (
        <Image
          src={pdIcon}
          alt="Product Design"
          className="size-6 object-contain"
        />
      ),
    },
    {
      name: "Product Development",
      href: "https://www.tonik.com/engineering",
      icon: (
        <Image
          src={devIcon}
          alt="Product Development"
          className="size-6 object-contain"
        />
      ),
    },
    {
      name: "Branding",
      href: "https://www.tonik.com/branding",
      icon: (
        <Image
          src={brandingIcon}
          alt="Branding"
          className="size-6 object-contain"
        />
      ),
    },
    {
      name: "Web Development",
      href: "https://www.tonik.com/websites",
      icon: (
        <Image
          src={webIcon}
          alt="Web Development"
          className="size-6 object-contain"
        />
      ),
    },
  ];

  return (
    <section className="relative flex w-full flex-col items-center gap-[52px]">
      {/* Content */}
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center gap-8">
        {/* ASCII Video Background */}
        <div className="absolute flex justify-center items-center -left-6 top-0 h-[600px] w-[calc(100%+var(--spacing)*12)] overflow-clip">
          <div className="relative h-[600px] md:h-[1000px] w-full">
            <SplineLogo />
          </div>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <p className="relative z-10 text-center text-4xl sm:text-4xl md:text-7xl leading-none tracking-tight text-balance">
          We can boost your product beyond just the code.
        </p>

        <div className="grid  w-full flex-row gap-x-4 gap-y-8 items-center justify-center mx-auto z-10">
          <div className="grid gap-8 md:grid-cols-[repeat(2,auto)] lg:grid-cols-[repeat(4,auto)] justify-center items-start">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="flex items-center gap-3"
              >
                <div className="flex size-6 items-center justify-center overflow-clip">
                  <span className="text-base">{service.icon}</span>
                </div>
                <p className="text-xl leading-7 text-off-white whitespace-pre underline">
                  {service.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
