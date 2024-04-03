import axios from "axios"
import { Errors, RefStrings } from "../constants";
import { queryEmailTemplate, subscriberEmailTemplate } from "../external/templates/quiryEmail";
import { EmailHelper } from "./email";
import "dotenv/config"
import { publishToQueue } from "../controller/rabbit";
export class EnquiryEmail {


    static async sendenquiryemail(reqBody: any) {
        try {
            const {
                cname, fname, lname, email, enquiryMessage, capchaToken
            } = reqBody

            const url = `${process.env.SEND_QUERY_CAPTCHA}${process.env.GOOGLE_CAPTCHA_SECRET}&response=${capchaToken}`;
            let response = await axios.post(url);
            if (response.data?.success) {
                const message = queryEmailTemplate({ cname, fname, lname, email, enquiryMessage })

                const payload = {
                    subject: RefStrings.emails.p2eWebsiteSubject,
                    emailFrom: email,
                    emailTo: process.env.MAIL_SENT_TO,
                    message
                }

                EmailHelper.sendEmail(payload)
                return { success: true }
            } else {
                throw (Errors.systemError.captchaVerificationFailed)

            }
        } catch (error) {
            console.log(error);
            return error
        }

    }
    static async addnewsubscriber(reqBody: any) {
        try {
            const { email, capchaToken } = reqBody

            const url = `${process.env.SEND_QUERY_CAPTCHA}${process.env.GOOGLE_CAPTCHA_SECRET}&response=${capchaToken}`;
            let response = await axios.post(url);
            if (response.data?.success) {
                const msgText = subscriberEmailTemplate(email)

                const params = {
                    subject: RefStrings.emails.p2eWebsiteSubject,
                    emailFrom: email,
                    emailTo: process.env.MAIL_SENT_TO,
                    message: msgText
                }
                EmailHelper.sendEmail(params)
                return { success: true }
            } else {
                throw (Errors.systemError.captchaVerificationFailed)

            }

        } catch (error) {
            console.log(error);
            return error
        }

    }

    static async sendiprenquiryemail(reqBody: any) {
        try {
            const {
                name, phoneNo, email, subject = RefStrings.emails.myIprSubject, message, capchaToken, servicName, isTermsConditions
            } = reqBody

            const updatedMessage = `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        border: 1px solid black;
                    }

                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td><b>Name<b></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><b>Email<b></td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td><b>Phone No<b></td>
                        <td>${phoneNo}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><b>Message<b></td>
                    </tr>
                    <tr>
                        <td colspan="2">${message}</td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            const url = `${process.env.SEND_QUERY_CAPTCHA}${process.env.GOOGLE_CAPTCHA_SECRET}&response=${capchaToken}`;
            let response = await axios.post(url);
            if (response.data?.success) {

                const payload = {
                    subject,
                    emailFrom: RefStrings.emails.emailsAddress.myipr,
                    emailTo: RefStrings.emails.emailsAddress.marketing,
                    message: updatedMessage,
                    emailType: RefStrings.emails.emailType.enquiry,
                    servicName,
                    isTermsConditions
                }

                publishToQueue({ ...payload });

                return { success: true }
            } else {
                throw (Errors.systemError.captchaVerificationFailed)
            }
        } catch (error) {
            console.log(error);
            return error
        }

    }

    static async contactMail(reqBody: any) {
        try {

            const { name, email, subject, message = '', serviceName = null, user } = reqBody;

            const updatedMessage = `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        border: 1px solid black;
                    }

                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td><b>Name<b></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><b>Email<b></td>
                        <td>${email}</td>
                    </tr>
                    ${message ?
                    `<tr>
                        <td colspan="2"><b>Message<b></td>
                    </tr>
                    <tr>
                        <td colspan="2">${message}</td>
                    </tr>` : ''
                    }
                </table>
            </body>
            </html>
            `;

            const payload = {
                subject,
                emailFrom: process.env.MAI_FROM,
                emailTo: process.env.MAI_CONTACT_TO,
                message: updatedMessage,
                emailType: 'contact',
                catagory: 'contact_us',
                user
            }

            publishToQueue({ ...payload });

            return { success: true }

        } catch (error) {
            console.log("contactMail Error", error);
            return error
        }
    }

    static async careerMail(reqBody: any) {
        try {

            const { name, email, yoe, subject, url, serviceName = null, user, uploadedFiles = null } = reqBody;

            const updatedMessage = `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        border: 1px solid black;
                    }

                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td><b>Name<b></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><b>Email<b></td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td><b>Year of Experience<b></td>
                        <td>${yoe}</td>
                    </tr>
                    <tr>
                        <td><b>LinkedIn url<b></td>
                        <td>${url}</td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            const payload = {
                subject,
                emailFrom: process.env.MAI_FROM,
                emailTo: process.env.MAI_TO,
                message: updatedMessage,
                catagory: 'career',
                user,
                emailType:'career',
                uploadedFiles
            }

            publishToQueue({ ...payload });

            return { success: true }

        } catch (error) {
            console.log("contactMail Error", error);
            return error
        }
    }

    static async subscribeEmailUser(reqBody: any) {
        try {

            const { email, subject, serviceName = null, user } = reqBody;


            const updatedMessage = `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        border: 1px solid black;
                    }

                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td><b>Email<b></td>
                        <td>${email}</td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            const payload = {
                subject,
                emailFrom: process.env.MAI_FROM,
                emailTo: process.env.MAI_TO,
               message: updatedMessage,
                emailType: 'subscribe',
                catagory: 'subscribe',
                user
            }

            publishToQueue({ ...payload });

            return { success: true }

        } catch (error) {
            console.log("contactMail Error", error);
            return error
        }
    }
}