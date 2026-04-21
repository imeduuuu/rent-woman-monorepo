import bcrypt from "bcryptjs";

import { PrismaClient, ListingStatus, SubscriptionPlan, UserRole, VerificationStatus } from "../src/generated/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "[email protected]" },
    update: {},
    create: {
      email: "[email protected]",
      name: "Platform Admin",
      passwordHash,
      role: UserRole.ADMIN,
      verificationStatus: VerificationStatus.APPROVED
    }
  });

  const talentOne = await prisma.user.upsert({
    where: { email: "[email protected]" },
    update: {},
    create: {
      email: "[email protected]",
      name: "Ariana Moreau",
      passwordHash,
      role: UserRole.TALENT,
      verificationStatus: VerificationStatus.APPROVED,
      subscriptionPlan: SubscriptionPlan.ELITE,
      profile: {
        create: {
          headline: "Luxury event companion and brand-hosting specialist",
          bio: "Refined, polished, multilingual, and experienced with premium private events, luxury hospitality, and executive social appearances.",
          city: "Madrid",
          country: "Spain",
          hourlyRate: 450,
          languages: ["English", "Spanish", "French"],
          tags: ["vip-events", "fine-dining", "travel-ready"],
          isPublic: true
        }
      }
    }
  });

  const talentTwo = await prisma.user.upsert({
    where: { email: "[email protected]" },
    update: {},
    create: {
      email: "[email protected]",
      name: "Valentina Rossi",
      passwordHash,
      role: UserRole.TALENT,
      verificationStatus: VerificationStatus.APPROVED,
      subscriptionPlan: SubscriptionPlan.PREMIUM,
      profile: {
        create: {
          headline: "Elegant social hostess for luxury dinners and events",
          bio: "Warm, composed, highly presentable, and ideal for high-trust social settings requiring discretion and style.",
          city: "Barcelona",
          country: "Spain",
          hourlyRate: 380,
          languages: ["English", "Spanish", "Italian"],
          tags: ["social-hosting", "networking", "premium-events"],
          isPublic: true
        }
      }
    }
  });

  await prisma.listing.upsert({
    where: { slug: "ariana-moreau-madrid" },
    update: {},
    create: {
      ownerId: talentOne.id,
      slug: "ariana-moreau-madrid",
      title: "Ariana Moreau",
      description: "Polished luxury companion profile for events, dinners, and premium social appearances.",
      category: "Luxury Event Companion",
      baseRate: 450,
      city: "Madrid",
      country: "Spain",
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      status: ListingStatus.ACTIVE
    }
  });

  await prisma.listing.upsert({
    where: { slug: "valentina-rossi-barcelona" },
    update: {},
    create: {
      ownerId: talentTwo.id,
      slug: "valentina-rossi-barcelona",
      title: "Valentina Rossi",
      description: "Refined and versatile profile for elegant dinners, networking evenings, and luxury hospitality.",
      category: "Executive Social Hostess",
      baseRate: 380,
      city: "Barcelona",
      country: "Spain",
      isFeatured: false,
      isPublished: true,
      publishedAt: new Date(),
      status: ListingStatus.ACTIVE
    }
  });

  console.log("Seed completed", { adminId: admin.id, talentOneId: talentOne.id, talentTwoId: talentTwo.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
