import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getBucketName, s3 } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getFromS3=async (filename,expiresIn=600)=>{
  const bucket=getBucketName()

  return await getSignedUrl(
    s3,
    new GetObjectCommand({
        Bucket:bucket,
        Key:filename
    }
    ),
    {expiresIn}
  )
}
