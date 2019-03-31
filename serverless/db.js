'use strict';

const log = require("json-log").log;
const mongoose = require('mongoose');
const Objective = require('./models/Objective');
const Cycle = require('./models/Cycle');
const KeyResult = require('./models/KeyResult');
const User = require('./models/User');

// ------------------------------------------------------
//
// TODO: Need to determine if the db connection reuse is working properly
// We're not setting AWS Lambda ->  context.callbackWaitsForEmptyEventLoop = false
// Look at these articles if querying is slow due to db connection being
// recreated for every lookup:
//    https://mongoosejs.com/docs/lambda.html
//    https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
//
// ------------------------------------------------------

mongoose.Promise = global.Promise;
let isConnected;
 
const connectToDatabase =  (context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    if (isConnected) {
        log.info('=> using existing database connection');
        return Promise.resolve();
    }
 
    log.info('=> using new database connection');
    return mongoose.connect(process.env.MONGO_ACCESS_URI).then(db => {
        isConnected = db.connections[0].readyState;
    });
}

// To update a subdocument we need to have keys in our update object
// which contain the dotted names to the fields being updated.
// This method creates such dotted names using the given prefix
// You can optionally include a set of keys that you want removed.
function formSubDocumentUpdate(args, prefix, removal = []) {
  let a = { ...args };
  Object.keys(a).map(function(key, index) {
    if (!removal.includes(key)) {
      a[prefix + key] = a[key];
    }
    delete a[key];
  });
  return a;
}


/* ---------- User ---------- */
module.exports.createUser  = (context, args) => {
  const user = new User(args);
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      User.create(user, (err, user) => {
        if (err) reject(err); else resolve(user);
      });
    });
  });
}

module.exports.getUserByUid  = (context, args) => {
  console.log("getUserByUid", context, args)
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      User.findOne({uid: args.uid}, (err, user) => {
        if (err) reject(err); else resolve(user);
      });
    });
  });
}



/* ---------- Objective ---------- */

// Specify indexToInsertAt as null to insert at end
function insertObjectiveAt(context, cycle_id, owner, objective, indexToInsertAt) {
  const push = {
    objectives: {
      $each: [objective],
    }
  };

  if (indexToInsertAt != null) {
    push.objectives.$position = indexToInsertAt;
  }

  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate(
        {_id: cycle_id, owner: owner},
        {
          $push: push
        },
        (err, cycle) => { if (err) reject(err); else resolve(objective); }
      );
    });
  });
}

module.exports.createObjectiveWithPromise = (context, args, owner) => {
  const objective = new Objective(args);
  return insertObjectiveAt(context, args.cycle_id, owner, objective, null);
}

module.exports.updateObjectiveWithPromise = (context, args, owner) => {
  const objectiveUpdate = formSubDocumentUpdate(args, 'objectives.$[ob].', ['cycle_id', 'owner', 'id']);
  const arrayFilters = [{"ob._id": mongoose.Types.ObjectId(args.id)}];
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {

      Cycle.findOneAndUpdate({_id: args.cycle_id, owner: owner },
                              {$set: objectiveUpdate},
                              {arrayFilters: arrayFilters, /*multi: true, */new: true},
                              (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.id));
      });

    });
  });
}

module.exports.getObjectiveWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOne({_id: args.cycle_id, owner: owner}, (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.id));
      });
    });
  });
}

module.exports.getAllObjectivesWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOne({_id: args.cycle_id, owner: owner},(err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives);
      });
    });
  });
}

function deleteObjectiveFromCycle(context, cycle_id, owner, objective_id) {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate(
        {_id: cycle_id, owner: owner},
        {$pull: {objectives: {_id:objective_id}}},
        {new: false},
        (err, cycle) => {
          if (err) reject(err); else resolve(cycle.objectives.id(objective_id));
        }
      );

    });
  });
}

module.exports.deleteObjectiveWithPromise = (context, args, owner) => {
  return deleteObjectiveFromCycle(context, args.cycle_id, owner, args.id);
}

module.exports.setObjectiveOrder = (context, args, owner) => {
  args.id = args.cycle_id;    // since we will be looking for an id
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {

      getCycleWithPromise(context, args, owner).then(cycle => {
        // sort objectives by ID
        let sortOrder = args.objectiveIds;
        cycle.objectives.sort((a,b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id))

        cycle.save((err,cycle) => {
          if (err) reject(err); else resolve(cycle);
        });
      }).catch(error => {
        reject(error);
      });

    });
  });
}

module.exports.moveObjective = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    deleteObjectiveFromCycle(context, args.from_cycle_id, owner, args.objective_id)
      .then(objective => insertObjectiveAt(context, args.to_cycle_id, owner, objective, args.insert_at)
      .then(objective => resolve(objective)))
      .catch(error => reject(error));
  });
}

/* ---------- Cycle ---------- */

module.exports.setCycleOrderWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {

      let cycleIds = args.cycleOrder.map(s => mongoose.Types.ObjectId(s));
      User.findOneAndUpdate({uid: owner}, {$set: {cycleIds: cycleIds}}, {new: true}, (err, user) => {
        if (err) {log.error("Updaing user with cycle order", err); reject(err)} else resolve(user);
      });

    });
  });
}

module.exports.createCycleWithPromise = (context, args, owner) => {
  const cycle = new Cycle(args);
  cycle.owner = owner;
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.create(cycle, (err, cycle) => {
        if (err) reject(err); else resolve(cycle);
      });
    });
  });
}

module.exports.updateCycleWithPromise = (context, args, owner) => {
  const tempCycle = { ...args };
  delete tempCycle.id;
  delete tempCycle.owner;
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate({_id: args.id, owner: owner}, {$set: tempCycle}, {new: true}, (err, cycle) => {
        if (err) reject(err); else resolve(cycle);
      });
    });
  });
}

function getCycleWithPromise(context, args, owner) {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOne({_id: args.id, owner: owner}, (err, cycle) => {
        if (err) reject(err); else resolve(cycle);
      });
    });
  });
}

module.exports.getCycleWithPromise = getCycleWithPromise;

module.exports.getAllCyclesOrderedWithPromise = (context, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.find({owner: owner}, (err, cycles) => {
        if (err) {
          reject(err);
        } else {
          User.findOne({uid: owner}, (err, user) => {
            if (err) {
              reject(err);
            } else {
              if (user.cycleIds.length > 0) {
                let sortOrder = user.cycleIds;
                cycles.sort((a,b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id))
              }  
              resolve(cycles);
            }
          });
        }
      });
    });
  });
}

module.exports.deleteCycleWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndDelete({_id: args.id, owner: owner}, (err, cycle) => {
        if (err) reject(err); else resolve(cycle);
      });
    });
  });
}

/* ---------- Key Result ---------- */

module.exports.createKeyResultWithPromise = (context, args, owner) => {
  const keyResult = new KeyResult(args);
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate(
        {_id: args.cycle_id, owner: owner, 'objectives._id': args.objective_id},
        {$push: {'objectives.$.keyResults': keyResult}},
        (err, cycle) => { if (err) reject(err); else resolve(keyResult); }
      );
    });
  });
}


module.exports.updateKeyResultWithPromise = (context, args, owner) => {
  const keyResultUpdate = formSubDocumentUpdate(args, 'objectives.$[ob].keyResults.$[kr].', ['cycle_id', 'owner', 'objective_id', 'id']);
  const arrayFilters = [{"ob._id": mongoose.Types.ObjectId(args.objective_id)}, {"kr._id": mongoose.Types.ObjectId(args.id)}];
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate({_id: args.cycle_id, owner: owner},
                              {$set: keyResultUpdate},
                              {arrayFilters: arrayFilters, /*multi: true, */new: true},
                              (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.objective_id).keyResults.id(args.id));
      });
    });
  });
}

module.exports.getKeyResultWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOne({_id: args.cycle_id, owner: owner},
                    (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.objective_id).keyResults.id(args.id));
      });
    });
  });
}

module.exports.getAllKeyResultsWithPromise = (context, args, owner) => {
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOne({_id: args.cycle_id, owner: owner},
                    (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.objective_id).keyResults);
      });
    });
  });
}

module.exports.deleteKeyResultWithPromise = (context, args, owner) => {
  const arrayFilters = [{'ob._id': mongoose.Types.ObjectId(args.objective_id)}];
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {
      Cycle.findOneAndUpdate({_id: args.cycle_id, owner: owner},
        {$pull: {'objectives.$[ob].keyResults': {'_id': mongoose.Types.ObjectId(args.id)}}},
        {arrayFilters: arrayFilters, /*multi:true, */new: false},
        (err, cycle) => {
        if (err) reject(err); else resolve(cycle.objectives.id(args.objective_id).keyResults.id(args.id));
      });
    });
  });
}

module.exports.setKeyResultOrder = (context, args, owner) => {
  args.id = args.cycle_id;    // since we will be looking for an id
  return new Promise((resolve, reject) => {
    connectToDatabase(context).then(() => {

      getCycleWithPromise(context, args, owner).then(cycle => {
        // find objective within this cycle
        let objective = cycle.objectives.find((o) => o.id == args.objective_id);

        // sort keyResults by ID
        let sortOrder = args.keyResultIds;
        objective.keyResults.sort((a,b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id))

        cycle.save((err,cycle) => {
          if (err) reject(err); else resolve(cycle);
        });
      }).catch(error => {
        reject(error);
      });

    });
  });
}


