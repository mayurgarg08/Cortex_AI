import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getBucketName, s3 } from "../config/s3.js"

export const uploadToS3=async (filename,buffer,contentType)=>{
 const bucket=getBucketName()

 await s3.send(
    new PutObjectCommand({
        // Environment-variable editors can accidentally add whitespace.
        // S3 rejects the resulting bucket name, so normalize it here.
        Bucket:bucket,
        Body:buffer,
        Key:filename,
        ContentType:contentType
    })

 )

 return filename
}
