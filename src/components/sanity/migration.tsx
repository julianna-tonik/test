"use client";

import { Separator } from "@/components/ui/separator";
import { List, ListItem } from "@/components/ui/list-item";
import { Reveal, SectionLabel } from "./shared";
import { MigrationLanes } from "./request-scenes";
import { WhereIcon } from "./where-icons";

export function SanityMigration() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Migration</SectionLabel>
      <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[420px_1fr]">
        <Reveal className="flex flex-col gap-6">
          <p className="text-2xl text-off-white md:text-3xl">Migrate your content without putting the website on hold</p>
          <p className="text-base leading-6 text-off-white-light">We move your existing content to Sanity in stages while your current website keeps running.</p>
          <List>
            <ListItem>Move in stages.</ListItem>
            <ListItem>Repeat the import as content changes.</ListItem>
            <ListItem>No content freeze.</ListItem>
          </List>
        </Reveal>
        <MigrationLanes />
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-3">
          <Separator />
          <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">Where it can go</p>
        </div>
        <Reveal className="grid w-full grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-[444px_repeat(3,1fr)]">
          <div className="flex flex-col gap-3 md:col-span-3 lg:col-span-1 lg:pr-6">
            <p className="text-3xl leading-10 text-off-white">
              Start with pages. <span className="text-off-white-light">Expand when it makes sense.</span>
            </p>
            <p className="text-base leading-6 text-off-white-light">The same workflow can support more of your content operations.</p>
          </div>
          <div className="flex flex-row items-start gap-6 md:flex-col">
            <div className="flex size-20 shrink-0 items-center justify-center md:aspect-[4/3] md:size-auto md:w-full md:border md:border-dark-grey">
              <WhereIcon i={0} />
            </div>
            <p className="text-base leading-6">Create pages from familiar tools. <span className="text-off-white-light">Start a request in Slack, Claude, Codex, or another tool.</span></p>
          </div>
          <div className="flex flex-row items-start gap-6 md:flex-col">
            <div className="flex size-20 shrink-0 items-center justify-center md:aspect-[4/3] md:size-auto md:w-full md:border md:border-dark-grey">
              <WhereIcon i={1} />
            </div>
            <p className="text-base leading-6">Handle repetitive work. <span className="text-off-white-light">Manage translations, metadata, and bulk updates.</span></p>
          </div>
          <div className="flex flex-row items-start gap-6 md:flex-col">
            <div className="flex size-20 shrink-0 items-center justify-center md:aspect-[4/3] md:size-auto md:w-full md:border md:border-dark-grey">
              <WhereIcon i={2} />
            </div>
            <p className="text-base leading-6">Connect external systems. <span className="text-off-white-light">Add analytics, CRM, translation, or internal tools.</span></p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
