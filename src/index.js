import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import bodyParser from "body-parser";
import schema from "./schema";

const cors = require('cors')
const app = express();
const PORT = 3000;

app.use(cors())

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({ schema }),
);
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(PORT, () => {
  console.log(`GraphiQL is now running on http://localhost:${PORT}/graphiql`);
});
