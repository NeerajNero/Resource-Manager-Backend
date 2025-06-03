import mongoose from "mongoose";

const initializeDatabase = async () => {
    try{
       await mongoose.connect(process.env.MONGO_URI)
       console.log("database connection successfull!")
    }catch(error){
        console.error(error.message);
        process.exit(1);
    }
}

export default initializeDatabase