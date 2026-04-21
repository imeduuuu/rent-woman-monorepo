
import { prisma } from "@repo/db";
import type { ListingCard, ListingDetail } from "@repo/types";
import { Router } from "express";

import { env } from "../config/env";
import { cacheGet, cacheSet } from "../lib/cache";

interface ListingReview {
  rating: number;
}

interface ListingMedia {
  id: string;
  storageKey: string;
  mediaType: ListingDetail["media"][number]["type"];
  moderationStatus: ListingDetail["media"][number]["moderationStatus"];
}

interface ListingOwner {
  name: string | null;
  image: string | null;
  profile: {
    bio: string | null;
    languages: string[];
    tags: string[];
  } | null;
}

interface ListingRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string;
  country: string;
  baseRate: number;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
  status: string;
  owner: ListingOwner;
  reviews: ListingReview[];
  media: ListingMedia[];
}

function averageRating(reviews: ListingReview[]): number {
  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum: number, review: ListingReview) => sum + review.rating, 0);
  return total / reviews.length;
}

export const listingRouter = Router();

listingRouter.get("/", async (_request, response, next) => {
  try {
    const cacheKey = "listings:public";
    const cached = await cacheGet<ListingCard[]>(cacheKey);

    if (cached) {
      response.json({ data: cached, error: null });
      return;
    }

    const listings = (await prisma.listing.findMany({
      where: {
        isPublished: true,
        status: "ACTIVE"
      },
      include: {
        owner: {
          include: {
            profile: true
          }
        },
        reviews: true,
        media: {
          where: {
            moderationStatus: "APPROVED"
          },
          take: 1
        }
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }]
    })) as ListingRecord[];

    const payload: ListingCard[] = listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      city: listing.city,
      country: listing.country,
      baseRate: listing.baseRate,
      currency: listing.currency,
      isFeatured: listing.isFeatured,
      ownerName: listing.owner.name,
      ownerImage: listing.owner.image,
      coverUrl: listing.media[0] ? `${env.AWS_S3_PUBLIC_BASE_URL}/${listing.media[0].storageKey}` : null,
      rating: averageRating(listing.reviews),
      reviewCount: listing.reviews.length
    }));

    await cacheSet(cacheKey, payload, 60);

    response.json({ data: payload, error: null });
  } catch (error) {
    next(error);
  }
});

listingRouter.get("/:slug", async (request, response, next) => {
  try {
    const listing = (await prisma.listing.findUnique({
      where: {
        slug: request.params.slug
      },
      include: {
        owner: {
          include: {
            profile: true
          }
        },
        reviews: true,
        media: {
          where: {
            moderationStatus: "APPROVED"
          }
        }
      }
    })) as ListingRecord | null;

    if (!listing || !listing.isPublished || listing.status !== "ACTIVE") {
      response.status(404).json({
        data: null,
        error: "Listing not found"
      });
      return;
    }

    const payload: ListingDetail = {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      city: listing.city,
      country: listing.country,
      baseRate: listing.baseRate,
      currency: listing.currency,
      isFeatured: listing.isFeatured,
      ownerName: listing.owner.name,
      ownerImage: listing.owner.image,
      coverUrl: listing.media[0] ? `${env.AWS_S3_PUBLIC_BASE_URL}/${listing.media[0].storageKey}` : null,
      rating: averageRating(listing.reviews),
      reviewCount: listing.reviews.length,
      bio: listing.owner.profile?.bio ?? null,
      languages: listing.owner.profile?.languages ?? [],
      tags: listing.owner.profile?.tags ?? [],
      media: listing.media.map((item: ListingMedia) => ({
        id: item.id,
        url: `${env.AWS_S3_PUBLIC_BASE_URL}/${item.storageKey}`,
        type: item.mediaType,
        moderationStatus: item.moderationStatus
      }))
    };

    response.json({ data: payload, error: null });
  } catch (error) {
    next(error);
  }
});
