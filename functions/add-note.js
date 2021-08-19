require("dotenv").config();
exports.handler = async function (event, context) {
  const { user } = context.clientContext;

  console.log(user);
  if (!user) {
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
  const note = await db
    .collection("notes")
    .insertOne({
      author: user.user_metadata.full_name,
      authorId: user.sub,
      note: body.note,
      created: Date.now(),
      updated: Date.now(),
    })
    .then(({ ops }) => ops[0]);
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(note),
  };
};
