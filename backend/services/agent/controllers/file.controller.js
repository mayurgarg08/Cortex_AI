import GeneratedFile from "../models/generatedFile.model.js"

export const getFile=async (req,res)=>{
    try {
        const file=await GeneratedFile.findOne({key:req.params.key})
        // The TTL cleanup runs periodically, so also check expiry here
        if(!file || file.expiresAt<new Date()){
            return res.status(404).json({message:"file not found or link expired"})
        }

        const disposition=file.contentType.startsWith("image/") ? "inline" : "attachment"
        res.set({
            "Content-Type":file.contentType,
            "Content-Disposition":`${disposition}; filename="${file.filename}"`,
            "Cache-Control":"private, max-age=3600"
        })
        return res.send(file.data)
    } catch (error) {
        return res.status(500).json({message:`get file error ${error}`})
    }
}
