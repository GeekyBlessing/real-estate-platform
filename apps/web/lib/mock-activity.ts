/**
 * ActivityItem is the real shape an activity endpoint would return
 * (an icon kind, a title, a detail line, a timestamp, an optional
 * linked listing). There is no messaging or inspection backend behind
 * it yet, so mockActivity stays empty rather than populated with
 * invented enquiries, replies, and inspection confirmations: an
 * earlier version filled it with named fake people, fabricated
 * quoted messages, and made-up price drops, shown to a real signed-in
 * user as if it were their own history with no indication anywhere
 * in the UI that none of it was real. That crossed the line from "an
 * illustrative empty layout" into fabricated data, which this build
 * does not do. The Activity screen renders a genuine empty state
 * until a real feed exists to populate this from.
 */

export type ActivityKind =
  | "inspection"
  | "message"
  | "price"
  | "review"
  | "verification"
  | "match";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
  listingSlug?: string;
  listingCategory?: "property" | "vehicle";
}

export const mockActivity: ActivityItem[] = [];
