import 'dotenv/config'
import app from "./config/app";
import connectDB from './config/connection';
const PORT = Number(process.env.PORT);

connectDB().
   then(async () => {
    
      app.listen(process.env.PORT, () => {
         console.log('Express server listening on port ' + PORT);
      });
   }).
   catch((err) => {
      console.log(err)
      console.log("DB : Connection error. Stopping")
   })
