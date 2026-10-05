import { track } from "@vercel/analytics/server";
import { redirect } from "next/navigation";

// TODO: confirm the Sanity booking link with the team (currently the tonik team page on cal.com).
const sanityContactLink = "https://cal.com/team/wearetonik";

export const GET = async () => {
  track("book-call", { offer: "sanity" });
  redirect(sanityContactLink);
};
