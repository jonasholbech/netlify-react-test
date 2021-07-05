require("dotenv").config();
exports.handler = async function (event, context) {
  console.log(event);
  console.log(context);
  const uri = process.env.A;
  return {
    statusCode: 200,
    body: JSON.stringify([
      { name: "Jonas " + uri, status: "Married" },
      { name: "Dannie", status: "In a relationship" },
    ]),
  };
};
