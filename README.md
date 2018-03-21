# reservations-api
A simple reservations API using Apollo GraphQL Express server with a MongoDB database.

## API Database Configuration
A `.env` file in the root of the project is required to run the API with the following content:

```
MONGO_URL=mongodb://<user>:<password>@<host>:<port>/<database_name>
DB_NAME=<database_name>
```

## Run API
For development:
`yarn start`

And production:
`yarn build`

There is also a `Dockerfile` included to build & run a docker container.
