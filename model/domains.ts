
import { Document, model, Schema } from "mongoose";


export interface IEmailDomain extends Document {
    domain: string;
    isActive:string
}

const domainSchema: Schema = new Schema({
    domain: {
        type: String,
        unique:true
    },
    isActive: {
        type: Boolean,
        default:true
    }
},{
    timestamps: true
  }
);

const DomainsSchema = model<IEmailDomain>("domains", domainSchema);

export default DomainsSchema;
