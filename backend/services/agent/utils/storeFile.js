import crypto from "crypto"
import GeneratedFile from "../models/generatedFile.model.js"
import { uploadToS3 } from "./uploadToS3.js"
import { getFromS3 } from "./getFromS3.js"

// MongoDB documents are limited to 16MB
const MAX_FILE_SIZE=15*1024*1024

// Saves a generated file and returns a download URL valid for expiresIn seconds.
// Files are stored in MongoDB by default; set FILE_STORAGE=s3 to use the S3 bucket instead.
export const storeFile=async (filename,buffer,contentType,expiresIn)=>{
    if(process.env.FILE_STORAGE==="s3"){
        await uploadToS3(filename,buffer,contentType)
        return await getFromS3(filename,expiresIn)
    }

    if(buffer.length>MAX_FILE_SIZE){
        throw new Error("The generated file is too large to store.")
    }

    const key=crypto.randomUUID()
    await GeneratedFile.create({
        key,
        filename,
        contentType,
        data:buffer,
        expiresAt:new Date(Date.now()+expiresIn*1000)
    })

    const apiUrl=(process.env.PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/,"")
    return `${apiUrl}/api/files/${key}`
}
