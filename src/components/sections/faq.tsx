"use client";

import { Separator } from "@/components/ui/separator";
import { track } from "@vercel/analytics";
import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useState } from "react";

interface FAQItemProps {
  number: string;
  question: string;
  answer?: ReactNode;
  isExpanded?: boolean;
  onClick?: () => void;
}

function FAQItem({
  number,
  question,
  answer,
  isExpanded = false,
  onClick,
}: FAQItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`flex w-full flex-col border-b border-dark-grey pl-0 pr-6 py-6 cursor-pointer select-none relative hover:pl-6 transition-[padding] ${
        isExpanded ? "text-off-white pl-6" : "text-off-white-light"
      }`}
      onClick={onClick}
      initial={false}
      animate={{
        color: isExpanded ? "var(--off-white)" : "var(--off-white-light)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-dark-grey"
        initial="normal"
        animate={isExpanded ? "expanded" : isHovered ? "hovered" : "normal"}
        variants={{
          normal: {
            top: "unset",
          },
          hovered: {
            top: 0,
          },
          expanded: {
            top: 0,
          },
        }}
      ></motion.div>
      <div className="flex w-full items-start justify-between z-10">
        <div className="flex items-start flex-1 gap-6">
          <p className="font-mono text-sm uppercase leading-3 tracking-tight whitespace-pre">
            {number}
          </p>
          <p className="text-3xl leading-8">{question}</p>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {answer && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden z-10"
          >
            <div className="text-base leading-6 pt-6 pr-12 max-w-lg">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      number: "[01]",
      question: "What results can I expect?",
      answer: (
        <>
          <div className="mb-4">
            You get a product that ships fast without breaking. We stabilize
            your codebase so ideas move to production in days, not weeks.
            Regressions get caught early, monitoring keeps the build healthy,
            and performance stays tight. You also leave with a real design
            system, clean architecture, and a clear path for adding AI-powered
            workflows as you scale.
          </div>
          <div>
            tl;dr → stability, speed, and a codebase you’re not afraid to grow.
          </div>
        </>
      ),
    },
    {
      number: "[02]",
      question: "What are the deliverables?",
      answer: (
        <>
          <div className="mb-4">
            A fully cleaned, documented, production-ready product. That
            includes: full source code, component library, design system, CI/CD
            pipelines, monitoring & error tracking, infra setup, onboarding
            docs, and a finished deployment on your platform of choice.
            Everything is yours — no lock-in, no black boxes, no mystery glue
            code.
          </div>
          <div>You own the repo. You own the infrastructure.</div>
        </>
      ),
    },
    {
      number: "[03]",
      question: "How do you work?",

      answer: (
        <>
          <div className="mb-4">
            We work in sprints — fast cycles with constant feedback. Each sprint
            includes design reviews, implementation, testing, and improvements.
            We show progress frequently, fix issues early, and keep you in the
            loop without drowning you in meetings. Major decisions happen
            transparently so nothing goes off the rails.
          </div>
          <div>Fast loops. Clear communication. Zero surprises.</div>
        </>
      ),
    },
    {
      number: "[04]",
      question: "Enterprise experience?",
      answer: (
        <div>
          Yes — a lot. We worked for Auth0, Twilio, Segment, Supabase, Okta,
          LangChain, LlamaIndex. We understand compliance, scalability, and
          internal review processes — and adapt to your governance requirements.
        </div>
      ),
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="flex w-full flex-col gap-[120px] pb-[120px] max-w-container-6xl">
      {/* Header */}
      <div className="flex w-full flex-col gap-3">
        <Separator />
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">
          FAQ
        </p>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col lg:flex-row w-full gap-12">
          <p className="flex-1 text-[32px] leading-10 text-off-white min-w-xs">
            Got questions?
          </p>
          <div className="lg:flex-1 flex flex-col">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                number={faq.number}
                question={faq.question}
                answer={faq.answer}
                isExpanded={expandedIndex === index}
                onClick={() => {
                  track("faq-clicked", {
                    faqNumber: faq.number,
                    fagTitle: faq.question,
                  });
                  toggleFAQ(index);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
