
import { Document, model, Schema } from "mongoose";


export interface IEmailProvider extends Document {
    name: string;
    priority: number;
    isActive: boolean;
}

const emailProviderScheema: Schema = new Schema({
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default:true
    },
    priority: {
        type: Number,
        default:1
    },

},{
    timestamps: true
  }
);

const EmailProvider = model<IEmailProvider>("emailproviders", emailProviderScheema);

export default EmailProvider;
