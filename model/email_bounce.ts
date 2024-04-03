
import { Document, model, Schema } from "mongoose";


export interface IEmailProvider extends Document {
    email: string;
    isBounced: boolean;
    debounce:object;
    userId:string;
}

const emailBounceSchema: Schema = new Schema({
    email: {
        type: String,
        unique:true
    },
    isBounced: {
        type: Boolean,
        default:false
    },
    debounce: {
        type: Object,
    },
    userId:{
        type:String
    }

},{
    timestamps: true
  }
);

const BounceMails = model<IEmailProvider>("bouncemails", emailBounceSchema);

export default BounceMails;
