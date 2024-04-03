import { RefStrings } from "../constants";
import { axiosClient } from "../common/axios";

export class ExternalService{

    static async checkCredentials(){
        try{

            const result = await axiosClient(process.env.BOUNCIFY_IO_URL, {apikey:process.env.BOUNCIFY_IO_API_KEY}, {}).get(RefStrings.endpoints.boucifyIo.checkCredentials);
            return result.data;
        }catch(err){
            console.log("checkCredentials Error",err);
        }
    }
}