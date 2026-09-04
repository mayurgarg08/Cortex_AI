import "dotenv/config"
import { S3Client} from "@aws-sdk/client-s3";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY)?.trim()

// When static credentials are absent, the AWS SDK automatically uses the ECS
// task role. Supplying an object with undefined credentials disables that flow.
export const s3 = new S3Client({
    region: process.env.AWS_REGION?.trim(),
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {})
})

export const getBucketName = () => {
    const bucket = process.env.AWS_BUCKET_NAME?.trim()
    if (!bucket) throw new Error("AWS_BUCKET_NAME is not configured.")
    return bucket
}
