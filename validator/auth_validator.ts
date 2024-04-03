import validate from "jsonschema";

let Validator = validate.Validator;
let valid = new Validator();

export const authValidator = (headerData: any) => {
  return valid.validate(headerData, {
    type: "object",
    properties: {
      servicename: { type: "string", required: true },
      emailauthkey: { type: "string", required: true },
    },
  });
};
