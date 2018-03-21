import { makeExecutableSchema } from "graphql-tools";
import { GraphQLDateTime } from "graphql-iso-date";
import get from 'lodash.get';
import endOfDay from 'date-fns/end_of_day';
import startOfDay from 'date-fns/start_of_day';
import getCollection from './dbClient';

const gql = String.raw;

const typeDefs = gql`
  scalar DateTime

  type Reservation {
    id: String!
    name: String
    hotelName: String
    arrivalDate: DateTime
    departureDate: DateTime
  }

  type Query {
    getReservervationById(
      id: String!
    ): Reservation

    getReservations(
      hotelName: String
      arrivalDate: DateTime
      departureDate: DateTime
    ): [Reservation]
  }

  type Mutation {
    addReservation(
      name: String
      hotelName: String
      arrivalDate: DateTime
      departureDate: DateTime
    ): Reservation
  }
`

const getRezFromDb = (rez) => {
  return {
    id: rez._id,
    name: rez.name,
    hotelName: rez.hotelName,
    arrivalDate: rez.arrivalDate,
    departureDate: rez.departureDate
  }
}

const resolvers = {
  DateTime: GraphQLDateTime,
  
  Query: {
    getReservervationById: (root, args, context) => {
      return new Promise((resolve, reject) => {
        const { id } = args;

        if (!id) {
          return reject('getReservervationById requires: id')
        }

        getCollection('reservations')
          .then(reservations => {
            return reservations.findOne({ _id: id })
          })
          .then(rez => {
            if (rez) {
              const reservation = getRezFromDb(rez)
              resolve(reservation)
            } else {
              resolve(null)
            }
          })
          .catch(err => reject(err))
      });
    },

    getReservations: (root, args, context) => {
      return new Promise((resolve, reject) => {
        const { hotelName, arrivalDate, departureDate } = args;

        let filter = {}
        if (hotelName) {
          filter.hotelName = new RegExp(hotelName, "i");
        }
        if (arrivalDate) {
          filter.arrivalDate = {
            $gte: startOfDay(arrivalDate),
            $lt: endOfDay(arrivalDate)
          }
        }
        if (departureDate) {
          filter.departureDate = {
            $gte: startOfDay(departureDate),
            $lt: endOfDay(departureDate)
          }
        }

        console.log('getReservations args & filter', { args, filter })

        getCollection('reservations')
          .then(reservations => {
            return reservations.find(filter, { sort: { arrivalDate: 1 }}).toArray()
          })
          .then(rez => {
            if (rez) {
              const reservations = rez.map(r => getRezFromDb(r))
              resolve(reservations)
            } else {
              resolve(null)
            }
          })
          .catch(err => reject(err))
      });
    }
  },

  Mutation: {
    addReservation: (root, args, context) => {
      return new Promise((resolve, reject) => {
        console.log('addReservation args:', args)
        const { name, hotelName, arrivalDate, departureDate } = args;

        if (!name || !hotelName || !arrivalDate || !departureDate) {
          return reject('addReservation requires: name, hotelName, arrivalDate & departureDate')
        }

        let newRez = {
          name,
          hotelName,
          arrivalDate,
          departureDate
        }

        getCollection('reservations')
          .then(reservations => {
            return reservations.insert(newRez)
          })
          .then(res => {
            console.log('addReservation', res)
            let id = null
            const ops = res && res.ops
            if (Array.isArray(ops) && ops.length > 0) {
              newRez.id = ops[0]._id
            }
            resolve(newRez)
          })
          .catch(err => reject(err))
      });
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
