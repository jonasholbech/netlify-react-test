require("dotenv").config();
const { MongoClient } = require("mongodb");
exports.handler = async function (event, context) {
  const { user } = context.clientContext;
  if (!user || !user.email) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const all = await db
    .collection("notes")
    //.find()
    .find({ authorId: user.sub })
    //.skip(0)
    //.limit(2)
    .toArray();
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
