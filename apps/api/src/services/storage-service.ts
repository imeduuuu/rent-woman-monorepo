import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../config/env";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
});

export async function createSignedUploadUrl(fileName: string, contentType: string): Promise<{
  key: string;
  uploadUrl: string;
  publicUrl: string;
}> {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  const key = `uploads/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 10
  });

  return {
    key,
    uploadUrl,
    publicUrl: `${env.AWS_S3_PUBLIC_BASE_URL}/${key}`
  };
}
