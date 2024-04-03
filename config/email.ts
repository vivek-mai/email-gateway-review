require('dotenv').config();
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';


const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

const SES_CONFIG = {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION,
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const nodeMailer = nodemailer.createTransport({
    SES: AWS_SES,
});


export {s3, AWS_SES, nodeMailer}