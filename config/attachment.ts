import multer from "multer";
import path from 'path';
import { s3 } from "../config/email";
import { Utils } from "../utility/utils";
import { RefStrings } from "../constants";
const dirname = path.resolve();


const storage = multer.diskStorage({
    destination(req: any, file: any, cb: (arg0: null, arg1: string) => void) {
      cb(null, RefStrings.filePaths.uploadFiles);
    },
    filename(req: any, file: { originalname: any; }, cb: (arg0: null, arg1: string) => void) {
      const date = Date.now()
      cb(null, `${date}_${file.originalname}`);
    },
  });
  
  const upload = multer({ storage, 
    fileFilter: Utils.fileFilter,
    limits: {
    fileSize: RefStrings.fileSize // 6 MB (in bytes)
  }, }).array("file",process.env.NO_OF_MAX_FILES_ATTACHMENTS);


  const uploadLoadToS3 = async(file: { filename: any; })=>{
    try{

      const filePathUrl = path.join(dirname, `${RefStrings.filePaths.uploadFiles}/${file.filename}`);

      const data = await Utils.readFileAttachment(filePathUrl);

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: file.filename,
        Body: data,
      };

      const awsFileUpload = new Promise<any>((resolve, reject) => {
        s3.upload(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });

      });

      return awsFileUpload;


    }catch(err){

    }
  }
    
  
  const getFileUploaded = async(req: { files: string | any[]; })=>{
    try{

      let uploadPromises = [];
      let uploadedFiles = [];
  
      for(const element of req.files){
        const file = element;
        uploadPromises.push(uploadLoadToS3(file));
      }

      await Promise.all(uploadPromises).then((data)=>{
        data = data.map((ele,idx)=>{return {fileUrl:ele.Location,fileName:req.files[idx].filename}});
        uploadedFiles = data;
      })

      return uploadedFiles;

    }catch(err){
      console.log("uploading file to Aws error : ",err);
      throw err
    }
  }


  export {upload, getFileUploaded}