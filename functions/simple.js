require("dotenv").config();
exports.handler = async function (event, context) {
  const myVar = process.env.VAR_NAME;
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "And so it begins " + myVar }),
  };
};
