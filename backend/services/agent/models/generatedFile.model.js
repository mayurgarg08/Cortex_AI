import mongoose from "mongoose";

const generatedFileSchema=new mongoose.Schema({
    key:{
        type:String,
        required:true,
        unique:true
    },
    filename:String,
    contentType:String,
    data:Buffer,
    expiresAt:{
        type:Date,
        required:true
    }
},{
    timestamps:true
})

// MongoDB deletes each file automatically once expiresAt has passed
generatedFileSchema.index({expiresAt:1},{expireAfterSeconds:0})

const GeneratedFile=mongoose.model("GeneratedFile",generatedFileSchema)
export default GeneratedFile
