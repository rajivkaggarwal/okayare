const {ApolloServer, gql} = require('apollo-server-lambda');
const db = require('./db');


// Construct a schema, using GraphQL schema language
const typeDefs = gql`

  type KeyResult {
    id: String!
    title: String
    description: String
  }

  type Objective {
    id: String!
    title: String
    description: String
    keyResults: [KeyResult]
  }

  type Cycle {
    id: String!
    owner: String!
    title: String
    description: String
    objectives: [Objective]
  }

  type User {
    id: String!
    uid: String!          
    email: String         
    name: String         
    pictureUrl: String    
    cycleOrder: [String]
  }

  type Query {
    getAllCycles: [Cycle]
    getCycle(id: String!): Cycle
    getAllKeyResults(cycle_id: String!, objective_id: String!): [KeyResult]
    getKeyResult(cycle_id: String!, objective_id: String!, id: String!): KeyResult
    getAllObjectives(cycle_id: String!): [Objective]
    getObjective(cycle_id: String!, id: String): Objective

    getUserByUid(uid: String!): User
  }

  type Mutation {
    createUser(uid: String!, email: String, name: String, pictureUrl: String, cycleOrder: [String]): User

    setCycleOrder(cycleOrder: [String]!): User

    createCycle(title: String!, description: String): Cycle
    updateCycle(id: String!, title: String, description: String): Cycle
    deleteCycle(id: String): Cycle

    createKeyResult(cycle_id: String!, objective_id: String!, title: String!, description: String): KeyResult
    updateKeyResult(cycle_id: String!, objective_id: String!, id: String!, title: String, description: String): KeyResult
    deleteKeyResult(cycle_id: String!, objective_id: String!, id: String): KeyResult
    setKeyResultOrder(cycle_id: String!, objective_id: String!, keyResultIds:[String]!): Cycle

    createObjective(cycle_id: String!, title: String!, description: String): Objective
    updateObjective(cycle_id: String!, id: String!, title: String, description: String): Objective
    deleteObjective(cycle_id: String!, id: String): Objective
    setObjectiveOrder(cycle_id: String!, objectiveIds:[String]!): Cycle
    moveObjective(from_cycle_id: String!, to_cycle_id: String!, objective_id:String!, insert_at:Int!): Objective
  }
`;
  
// Provide resolver functions for your schema fields
// Pass in the owner as a parameter separate from the args as it cannot be sent by the client
const resolvers = {
    Query: {
        getAllCycles: (obj, args, context, info) => db.getAllCyclesOrderedWithPromise(context, context.uid),
        getCycle: (obj, args, context, info) => db.getCycleWithPromise(context, args, context.uid),
        getKeyResult: (obj, args, context, info) => db.getKeyResultWithPromise(context, args, context.uid),
        getAllKeyResults: (obj, args, context, info) => db.getAllKeyResultsWithPromise(context, args, context.uid),
    
        getAllObjectives: (obj, args, context, info) => db.getAllObjectivesWithPromise(context, args, context.uid),
        getObjective: (obj, args, context, info) => db.getObjectiveWithPromise(context, args, context.uid),

        getUserByUid: (obj, args, context, info) => db.getUserByUid(context, args),
    },
    Mutation: {
      createUser: (root, args, context,) => db.createUser(args),

      setCycleOrder: (root, args, context,) => db.setCycleOrderWithPromise(context, args, context.uid),

      createCycle: (root, args, context,) => db.createCycleWithPromise(context, args, context.uid),
      updateCycle: (root, args, context,) => db.updateCycleWithPromise(context, args, context.uid),
      deleteCycle: (root, args, context,) => db.deleteCycleWithPromise(context, args, context.uid),
  
      createKeyResult: (root, args, context,) => db.createKeyResultWithPromise(context, args, context.uid),
      updateKeyResult: (root, args, context,) => db.updateKeyResultWithPromise(context, args, context.uid),
      deleteKeyResult: (root, args, context,) => db.deleteKeyResultWithPromise(context, args, context.uid),
      setKeyResultOrder: (root, args, context,)=> db.setKeyResultOrder(context, args, context.uid),

      createObjective: (root, args, context,) => db.createObjectiveWithPromise(context, args, context.uid),
      updateObjective: (root, args, context,) => db.updateObjectiveWithPromise(context, args, context.uid),
      deleteObjective: (root, args, context,) => db.deleteObjectiveWithPromise(context, args, context.uid),
      setObjectiveOrder: (root, args, context,) => db.setObjectiveOrder(context, args, context.uid),
      moveObjective: (root, args, context,) => db.moveObjective(context, args, context.uid),

    }
  };
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ event, context }) => ({
      uid: event.requestContext.authorizer.principalId,
    })
  });
  
  exports.graphqlHandler = server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  })
  