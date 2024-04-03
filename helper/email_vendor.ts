

import { Utils } from '../utility/utils';
import { nodeMailer } from '../config/email';
import { RefStrings } from '../constants';



async function awsSesMethod(data: any) {

    try {
        // get data 

        const { emailTo, emailFrom, subject, message, filePathUrl = null, fileDetails = null, fileAttachmentUrl = null, uploadedFiles = null } = data;

        uploadedFiles?.reduce((acc: any, curr: { fileUrl: any; fileName: any; }) => [...acc, { path: curr.fileUrl, filename: curr.fileName }], [])


        const resp = await nodeMailer.sendMail({
            from: emailFrom,
            to: emailTo,
            subject: subject,
            html: message,
            attachments: uploadedFiles ? uploadedFiles.map((ele: { fileName: any; fileUrl: any; }) => ({ filename: ele.fileName, path: ele.fileUrl })) : []
        });

        return resp;
    } catch (error) {
        await Utils.updateVendorPriority(RefStrings.provider.AWS_SES);
        throw error;
    }

}

export { awsSesMethod }



