import { RefStrings } from "./ref_strings"

export class Errors {

    public static errorMessage(message: string, httpStatus: number, customErrorNumber: number) {
        return {
            message: message,
            httpStatus: httpStatus,
            customErrorNumber: customErrorNumber,
        }
    }

    public static systemError: any = {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        message: "Not Found",
        httpStatus: 404,
        customErrorNumber: -1000000,
        invalidRequestFormat: Errors.errorMessage("Invalid Request Format", 400, -999999),
        invalidRequest: Errors.errorMessage("Invalid Request", 401, 0),
        oopsSomethingWentWrong: Errors.errorMessage("Oops! Something went wrong", 500, -1),
        externalProviderIssue: Errors.errorMessage("Please try in some time!", 401, -2),
        captchaVerificationFailed: Errors.errorMessage("Google chapcha verification failed", 401, -2),
        fileMissing: Errors.errorMessage("File is missing", 400, -3),
        fileInvalid: Errors.errorMessage("File is invalid", 400, -4),
        unAuthorized: Errors.errorMessage("Unauthorized, you do not have permission to access this service.", 400, -5),
        fileSizeLimit:Errors.errorMessage(`The maxiumum file limit is ${RefStrings.fileSize}.`, 400, -6),
        fileContentEmpty:Errors.errorMessage(`The file content is empty.`, 400, -7),
        fileFormat:Errors.errorMessage("File format is unsupported", 400, -8),
        debouncedMailIo:Errors.errorMessage("Please try later, email services are affected", 400, -9),
        debouncedMail:Errors.errorMessage("The email is not valid", 400, -10),
        mailToLimit:Errors.errorMessage("Please take a moment before sending another email", 400, -11),
        fileField:Errors.errorMessage("Please ensure you have the necessary file(s) ready for the 'files' field", 400, -12),
        noOfFilesLimit:Errors.errorMessage(`You can upload only ${process.env.NO_OF_MAX_FILES_ATTACHMENTS} file(s)`, 400, -13),
        domainMissing:Errors.errorMessage(`The domain is missing`, 400, -14),
        domainNotFound:Errors.errorMessage(`The domain is not registered`, 400, -15),
        domainNotAllowed:Errors.errorMessage(`This domain is not allowed`, 400, -16),
        rabbitMqIssue:Errors.errorMessage(`RabbitMq connection issue`, 400, -17)
    } // -1000000 to 99999


    public static smsGatewayError: any = {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        message: "Not Found",
        httpStatus: 404,
        customErrorNumber: -2000000,
        invalidRequestFormat: Errors.errorMessage("Invalid Request Format", 400, -2000001),
        invalidRequest: Errors.errorMessage("Invalid Request", 401, -2000002),
        unAuthorized: Errors.errorMessage("Unauthorized, you do not have permission to access this service.", 400, -2000003)
    } // -2000000 to -3000000


}