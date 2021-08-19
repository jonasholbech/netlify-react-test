require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

exports.handler = async function (event, context) {
  const { user } = context.clientContext;
  if (!user || !user.email) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const MongoClient = require("mongodb").MongoClient;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const body = JSON.parse(event.body);
  const o_id = ObjectId(body._id);
  const all = await db
    .collection("notes")
    .deleteOne({ _id: o_id, authorId: user.sub });
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
