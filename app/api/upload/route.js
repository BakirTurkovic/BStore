import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSessionUser, SESSION_COOKIE } from '../../../src/lib/auth.js';
import { getS3Client, getS3Config } from '../../../src/lib/s3.js';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = {
  'image/jpeg': { extension: 'jpg', matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  'image/png': {
    extension: 'png',
    matches: (bytes) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes) =>
      bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
  },
  'image/avif': {
    extension: 'avif',
    matches: (bytes) =>
      bytes.toString('ascii', 4, 8) === 'ftyp' && bytes.toString('ascii', 8, 12).startsWith('avif'),
  },
};

function getS3ErrorDetails(error) {
  const candidateCode = error?.Code || error?.code || error?.name;
  const code =
    typeof candidateCode === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(candidateCode)
      ? candidateCode
      : 'UnknownS3Error';
  const metadata = error?.$metadata || {};

  return {
    code,
    message: error instanceof Error ? error.message : String(error),
    httpStatusCode: metadata.httpStatusCode,
    requestId: metadata.requestId,
    extendedRequestId: metadata.extendedRequestId,
    cfId: metadata.cfId,
  };
}

function getS3FailureMessage(code) {
  switch (code) {
    case 'InvalidAccessKeyId':
      return 'AWS rejected the access key. Check AWS_ACCESS_KEY_ID in the server environment.';
    case 'SignatureDoesNotMatch':
      return 'AWS rejected the request signature. Check the secret key, region, and server clock.';
    case 'AccessDenied':
      return 'AWS denied the upload. Check that the configured IAM identity has s3:PutObject access to this bucket path.';
    case 'NoSuchBucket':
      return 'AWS could not find the configured bucket. Check AWS_S3_BUCKET_NAME.';
    case 'PermanentRedirect':
    case 'AuthorizationHeaderMalformed':
      return 'The S3 bucket region does not match AWS_REGION.';
    case 'CredentialsProviderError':
      return 'The AWS SDK could not load valid credentials. Check the server AWS environment variables.';
    default:
      return 'S3 rejected the image upload. Check the server logs for the AWS error details.';
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const user = getSessionUser(token);
    if (!user) {
      return NextResponse.json({ message: 'Sign in to upload images.' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only administrators can upload product images.' }, { status: 403 });
    }

    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 65536) {
      return NextResponse.json({ message: 'Image must be no larger than 5 MB.' }, { status: 413 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ message: 'Upload must use multipart form data.' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ message: 'Choose an image file to upload.' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'Image must be greater than 0 bytes and no larger than 5 MB.' }, { status: 400 });
    }

    const imageType = IMAGE_TYPES[file.type];
    if (!imageType) {
      return NextResponse.json(
        { message: 'Unsupported image type. Use JPEG, PNG, WebP, or AVIF.' },
        { status: 415 }
      );
    }

    const body = Buffer.from(await file.arrayBuffer());
    if (!imageType.matches(body)) {
      return NextResponse.json({ message: 'The selected file does not match its image type.' }, { status: 400 });
    }

    const { bucket, region } = getS3Config();
    const key = `products/${randomUUID()}.${imageType.extension}`;
    try {
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentLength: body.length,
          ContentType: file.type,
        })
      );
    } catch (error) {
      const details = getS3ErrorDetails(error);
      console.error('S3 PutObject failed:', details, error);

      return NextResponse.json(
        {
          message: getS3FailureMessage(details.code),
          code: details.code,
          requestId: details.requestId,
        },
        { status: 502 }
      );
    }

    const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    console.error('S3 image upload request failed:', error);
    if (
      error instanceof Error &&
      (error.message.startsWith('Missing required S3 environment variables:') ||
        error.message.startsWith('JWT_SECRET must be set'))
    ) {
      console.error('S3 upload configuration error:', error.message);
      return NextResponse.json(
        {
          message: 'Image uploads are not configured. Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, and JWT_SECRET in the server environment.',
          code: 'UploadConfigurationError',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: 'Image upload failed. Please try again.' }, { status: 502 });
  }
}
