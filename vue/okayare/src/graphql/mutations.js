  // src/graphql/mutations.js
  import gql from 'graphql-tag'

  export const SET_CYCLE_ORDER = gql`
    mutation SetCycleOrder($cycleOrder:[String]!) {
          setCycleOrder(cycleOrder: $cycleOrder) {
          id cycleOrder
      }
    }
  `
  export const CREATE_CYCLE = gql`
    mutation CreateCycle($title:String!, $description:String) {
        createCycle(title: $title, description: $description) {
        id title description
      }
    }
  `
  export const UPDATE_CYCLE= gql`
    mutation UpdateCycle($id: String!
                              $title:String, $description:String) {
          updateCycle(id: $id,
                          title: $title, description: $description) {
          id title description
      }
    }
  `
    export const DELETE_CYCLE = gql`
    mutation DeleteCycle($id: String!) {
          deleteCycle(id: $id) {
          id title description
      }
    }
  `

    export const CREATE_OBJECTIVE = gql`
      mutation CreateObjective($cycle_id: String!,
                                $title:String!, $description:String) {
            createObjective(cycle_id: $cycle_id,
                            title: $title, description: $description) {
            id title description
        }
      }
    `
    export const UPDATE_OBJECTIVE = gql`
    mutation UpdateObjective($cycle_id: String!, $id: String!
                              $title:String, $description:String) {
          updateObjective(cycle_id: $cycle_id, id: $id,
                          title: $title, description: $description) {
          id title description
      }
    }
  `
    export const DELETE_OBJECTIVE = gql`
    mutation DeleteObjective($cycle_id: String!, $id: String!) {
          deleteObjective(cycle_id: $cycle_id, id: $id) {
          id title description
      }
    }
  `
    export const SET_OBJECTIVE_ORDER = gql`
    mutation SetObjectiveOrder($cycle_id: String!, $objectiveIds: [String]!) {
      setObjectiveOrder(cycle_id: $cycle_id, objectiveIds: $objectiveIds) {
        id title description objectives {id title description keyResults {id title description}}
      }
    }
    `
    export const MOVE_OBJECTIVE = gql`
    mutation MoveObjective($from_cycle_id: String!, $to_cycle_id: String!, $objective_id: String!, $insert_at: Int!) {
      moveObjective(from_cycle_id: $from_cycle_id, to_cycle_id: $to_cycle_id, objective_id: $objective_id, insert_at: $insert_at) {
        id title description keyResults {id title description}
      }
    }
    `

    export const CREATE_KEY_RESULT = gql`
    mutation CreateKeyResult($cycle_id: String!, $objective_id: String!,
                              $title:String!, $description:String) {
          createKeyResult(cycle_id: $cycle_id, objective_id: $objective_id,
                          title: $title, description: $description) {
          id title description
      }
    }
  `
  export const UPDATE_KEY_RESULT = gql`
  mutation UpdateKeyResult($cycle_id: String!, $objective_id: String!, $id: String!
                            $title:String, $description:String) {
        updateKeyResult(cycle_id: $cycle_id, objective_id: $objective_id, id: $id,
                        title: $title, description: $description) {
        id title description
    }
  }
`
  export const DELETE_KEY_RESULT = gql`
  mutation DeleteKeyResult($cycle_id: String!, $objective_id: String!, $id: String!) {
        deleteKeyResult(cycle_id: $cycle_id, objective_id: $objective_id, id: $id) {
        id title description
    }
  }
`
export const SET_KEY_RESULT_ORDER = gql`
mutation SetKeyResultOrder($cycle_id: String!, $objective_id: String!, $keyResultIds: [String]!) {
        setKeyResultOrder(cycle_id: $cycle_id, objective_id: $objective_id, keyResultIds: $keyResultIds) {
        id title description objectives {id title description keyResults {id title description}}
  }
}
`

