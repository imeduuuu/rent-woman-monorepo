import type { ApiEnvelope, ListingCard, ListingDetail } from "@repo/types";

import { env } from "./env";

export async function fetchListings(): Promise<ListingCard[]> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/listings`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiEnvelope<ListingCard[]>;
    return payload.data;
  } catch {
    return [];
  }
}

export async function fetchListing(slug: string): Promise<ListingDetail | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/listings/${slug}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<ListingDetail>;
    return payload.data;
  } catch {
    return null;
  }
}
