import { DetectModerationLabelsCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { prisma } from "@repo/db";

import { env } from "../config/env";

const rekognition = new RekognitionClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
});

export async function reviewMediaAsset(mediaAssetId: string, storageKey: string): Promise<{
  approved: boolean;
  labels: Array<{ name: string; confidence: number }>;
}> {
  const result = await rekognition.send(
    new DetectModerationLabelsCommand({
      Image: {
        S3Object: {
          Bucket: env.AWS_S3_BUCKET,
          Name: storageKey
        }
      },
      MinConfidence: env.AWS_REKOGNITION_MIN_CONFIDENCE
    })
  );

  const labels = (result.ModerationLabels ?? []).map((label) => ({
    name: label.Name ?? "Unknown",
    confidence: label.Confidence ?? 0
  }));

  const approved = labels.length === 0;

  await prisma.moderationJob.create({
    data: {
      mediaAssetId,
      provider: "aws-rekognition",
      status: approved ? "APPROVED" : "FLAGGED",
      labels
    }
  });

  await prisma.mediaAsset.update({
    where: { id: mediaAssetId },
    data: {
      moderationStatus: approved ? "APPROVED" : "FLAGGED"
    }
  });

  return {
    approved,
    labels
  };
}
