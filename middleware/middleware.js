import mongoose from "mongoose";
const connectToMongo = handler => async (req, res ) => {
  if (mongoose.connections[0].readyState) {
    return handler(req, res)
    console.log('connected')
  }
  await mongoose.connect(process.env.MONGODB_URI)
  return handler(req, res)
}
export default connectToMongo;
