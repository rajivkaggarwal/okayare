const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const typeDefs = `
  type Note {
    title: String
    description: String
    id: Int
  }
  type Query {
    notes: [Note],
    note(id: Int): Note
  }
`;

/* Test data */
const notes = [
  { id: 1, title: "1", description: 'Introduction to GraphQL'},
  { id: 2, title: "2", description: 'Welcome to Meteor'},
  { id: 3, title: "3", description: 'Advanced GraphQL'},
  { id: 4, title: "4", description: 'Launchpad is Cool'},
];

const resolvers = {
  Query: {
    notes: () => notes,
    note: (id) => notes[id],
  },
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});