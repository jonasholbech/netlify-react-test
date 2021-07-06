require("dotenv").config();
const { MongoClient } = require("mongodb");
exports.handler = async function (event, context) {
  //const { user } = context.clientContext;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("sample_restaurants");
  const all = await db
    .collection("restaurants")
    .find({ cuisine: "American" })
    .skip(0)
    .limit(20)
    .toArray();
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
