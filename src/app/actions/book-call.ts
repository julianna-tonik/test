'use server';

import { track } from "@vercel/analytics/server";
import { redirect } from "next/navigation";

const calendlyContactLink =
  "https://cal.com/team/wearetonik/vibe-fixer";

export const bookCall = async () => {
  track("book-call");

  redirect(calendlyContactLink);
}
