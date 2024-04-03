import { Request } from 'express';
import { ParsedQs } from 'qs';
import validate from 'jsonschema';


let Validator = validate.Validator;
let valid = new Validator();

export const sendEmail = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            // "serviceName": { "type": "string" ,"minLength": 1 },
            "emailTo": { "type": "string", "required": true ,"format": 'email', pattern:"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$" },
            "emailFrom": { "type": "string", "required": true ,"format": 'email', pattern:"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$" },
            "subject": { "type": "string", "required": true ,"minLength": 1 },
            "message": { "type": "string", "required": true ,"minLength": 1 },
            "category": { "type": "string", "required": true ,"minLength": 1 },
            "emailType": { "type": "string", "required": true ,"minLength": 1 },

        }
    })
}

export const quiryEmail = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "cname": { "type": "string", "required": true ,"minLength": 1 },
            "fname": { "type": "string", "required": true ,"minLength": 1 },
            "lname": { "type": "string", "required": true ,"minLength": 1 },
            "email": { "type": "string", "required": true ,"format": 'email'},
            "enquiryMessage": { "type": "string", "required": true ,"minLength": 1 },
            "capchaToken": { "type": "string", "required": true ,"minLength": 1  },

        }
    })
}

export const queryIprEmail = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "name": { "type": "string", "required": true ,"minLength": 1 },
            "subject": { "type": "string", "required": true ,"minLength": 1 },
            "phoneNo": { "type": "string", "required": true , "minLength": 1 },
            "email": { "type": "string", "required": true ,"format": 'email'},
            "message": { "type": "string", "required": true ,"minLength": 1 },
            "capchaToken": { "type": "string", "required": true ,"minLength": 1  },
            "isTermsConditions":{"type":"boolean"}

        }
    })
}

export const subscribeEmail = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "email": { "type": "string", "required": true ,"format": 'email'},
            "capchaToken": { "type": "string", "required": false ,"minLength": 1 }

        }
    })
}

export const subscribeEmailUser = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "email": { "type": "string", "required": true ,"format": 'email'},
            "subject": { "type": "string", "required": true, "minLength":5},
        }
    })
}

export const contactEmailValidate = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "email": { "type": "string", "required": true ,"format": 'email'},
            "name": { "type": "string", "required": true ,"minLength": 1 },
        }
    })
}



export const carrerEmailValidate = (reqBody: Request) => {
    return valid.validate(reqBody, {
        type: "object",
        "properties": {
            "email": { "type": "string", "required": true ,"format": 'email'},
            "name": { "type": "string", "required": true ,"minLength": 1 },
            "yoe": { "type": "string", "required": true ,"minLength": 1 },
            "url": { "type": "string", "required": true ,"minLength": 1 },
        }
    })
}

export const emailLogsPage = (reqQuery: ParsedQs) => {
    return valid.validate(reqQuery, {
        type: "object",
        "properties": {
            "pageNo": { "type": "string", "required": true ,"minLength": 1, pattern:/^[1-9]\d*$/},
            "pageSize": { "type": "string", "required": true ,"minLength": 1, pattern:/^[1-9]\d*$/  },
            "sortBy":{type:"string" , enum:['asc','desc']}

        }
    })
}