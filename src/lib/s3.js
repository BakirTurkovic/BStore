import { S3Client } from '@aws-sdk/client-s3';

let client;

export function getS3Config() {
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
    region: process.env.AWS_REGION?.trim(),
    bucket: process.env.AWS_S3_BUCKET_NAME?.trim(),
  };
  const variableNames = {
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    region: 'AWS_REGION',
    bucket: 'AWS_S3_BUCKET_NAME',
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => variableNames[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missing.join(', ')}`);
  }

  return config;
}

export function getS3Client() {
  const { accessKeyId, secretAccessKey, region } = getS3Config();

  if (!client) {
    client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return client;
}
