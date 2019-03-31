import gql from 'graphql-tag'

export const GET_ALL_CYCLES = gql`
    query GetAllCycles {
        getAllCycles {
            id title description
            objectives {
                id title description
                keyResults {
                    id title description
                }
            }
        } 
    }
`

export const GET_CYCLE = gql`
    query GetCycle($id: String!) {
        getCycle(id: $id) {
            id title description
            objectives {
                id title description
                keyResults {
                    id title description
                }
            } 
        }
    }
`

