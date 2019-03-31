<template>
  <div class="cycle-editor container" style="height: 100vh; position: relative;">

    <Split direction="horizontal" :gutterSize="6">

      <SplitArea :size="20" :minSize="150">
        <cycle-navigation :cycles=this.cycles :selectedCycle=this.selectedCycle :selectedObjective=this.selectedObjective
              @cycle-selected="cycleSelected" @objective-selected="objectiveSelected" @objective-create="objectiveCreate"
              @cycles-reordered="cyclesReordered" @objective-moved="objectiveMoved"
              @cycle-create="cycleCreate">
        </cycle-navigation>
      </SplitArea>

      <SplitArea :size="80" :minSize="200" style="padding-left:3px; padding-right:3px; padding-top:1px;">
        <cycle v-if="this.selectedCycle && !this.selectedObjective" :cycle=this.selectedCycle :show-controls=true />
        <objective v-if="this.selectedObjective" :objective=this.selectedObjective :document=document :show-controls=true />
      </SplitArea>

    </Split>
    <div class="button is-warning is-loading is-large" v-show="isLoading" style="position: absolute; top:0; left:0; width: 100%; height:100%; background-color: #d0d0d0; opacity: 0.7;"></div>

  </div>

</template>



<script>
// @ is an alias to /src
import Cycle from '@/components/Cycle.vue';
import Objective from '@/components/Objective.vue';
import CycleNavigation from '@/components/CycleNavigation.vue';
import { GET_ALL_CYCLES } from '@/graphql/queries'
import { SET_CYCLE_ORDER, SET_OBJECTIVE_ORDER, MOVE_OBJECTIVE, DELETE_OBJECTIVE, DELETE_CYCLE } from '@/graphql/mutations'

import EventBus from '@/components/event-bus.js';



export default {
  name: 'cycle-editor',
  components: {
    CycleNavigation, Cycle, Objective
  },
  data () {
    return {
      isLoading: true,
      cycles: [],
      selectedCycle: null,
      selectedObjective: null
    }
  },
  created() {
    this.getCycles();
  },
  mounted() {
    EventBus.$on('delete-objective', params => {
      this.deleteObjective(params.cycleId, params.objective);
    });
    EventBus.$on('delete-cycle', params => {
      this.deleteCycle(params.cycle);
    });
  },
  computed: {
      document: function() {
          return {
              cycleId: this.selectedCycle.id,
          };
      }
  },
  methods: {
    getCycles() {
      this.$apollo.query({
        query: GET_ALL_CYCLES,
        variables: {
        }
      })
      .then(response => {
          this.cycles = response.data.getAllCycles;
          this.lastRetrievedAt = Date.now();
          this.selectedCycle = this.cycles.length > 0 ? this.cycles[0] : null;
          this.$noty.success("Finished Loading")
      })
      .catch(error => {
        console.error("GET_ALL_CYCLES Failure:", error)
        this.$noty.error("Initial Loading Failed")
      })
      this.isLoading = false;
    },
    cyclesReordered(newOrder) {
      this.cycles = newOrder;

      let cycleOrder = this.cycles.map(c => c.id);
      console.log("Saving Order of Cycles", cycleOrder);

      this.$apollo.mutate({
        mutation: SET_CYCLE_ORDER,
        variables: {
          cycleOrder: cycleOrder
        }
      })
      .then(response => {
          console.log("SET_CYCLE_ORDER Success:", response.data.setCycleOrder);
          this.$noty.success("New Order Saved")
      })
      .catch(error => {
        console.error("SET_CYCLE_ORDER Failure:", error)
        this.$noty.error("Save Cycle Ordering Failed")
      })
    },
    objectiveMoved(event) {
      console.log(event.change, event.objective.title, event.from.title, event.to.title);

      if (event.change == 'reorder') {
        let cycle = event.from;
        let objectiveIds = cycle.objectives.map(o => o.id);
        this.$apollo.mutate({
            mutation: SET_OBJECTIVE_ORDER,
            variables: {
                cycle_id: cycle.id,
                objectiveIds: objectiveIds
            }
        })
        .then(response => {
            console.log("SET_OBJECTIVE_ORDER Success:", response.data.setObjectiveOrder);
            this.$noty.success("New Order Saved")
        })
        .catch(error => {
          console.error("SET_OBJECTIVE_ORDER Failure:", error)
          this.$noty.error("Save Objective Ordering Failed")
        })
      } else if (event.change == "moved") {
        let insert_at = event.to.objectives.indexOf(event.objective);
        this.$apollo.mutate({
            mutation: MOVE_OBJECTIVE,
            variables: {
                from_cycle_id: event.from.id,
                to_cycle_id: event.to.id,
                objective_id: event.objective.id,
                insert_at: insert_at,
            }
        })
        .then(response => {
            console.log("MOVE_OBJECTIVE Success:", response.data.moveObjective);
            this.$noty.success("Saved Objective Move")
        })
        .catch(error => {
          console.error("MOVE_OBJECTIVE Failure:", error)
          this.$noty.error("Objective Move Failed to Save")
        })

      }
    },
    cycleSelected(id) {
        // show that cycle on the right side
        this.selectedCycle = this.cycles.find((e) => e.id == id);
        this.selectedObjective = null;
    },
    objectiveSelected(cycleId, objectiveId) {
        // show that objective on the right side
        this.selectedCycle = this.cycles.find((e) => e.id == cycleId);
        this.selectedObjective = this.selectedCycle.objectives.find((e) => e.id == objectiveId);
        console.log("objectiveSelected", cycleId, objectiveId, "isEdit", this.selectedObjective.isEdit);
    },
    cycleCreate() {
      let newCycle = {id: null, title: "New Cycle", description: "All about this cycle", objectives: []};
      this.cycles.unshift(newCycle);
      this.selectedCycle = newCycle;
      this.selectedObjective = null;
    },
    objectiveCreate(cycleId) {
        this.selectedCycle = this.cycles.find((e) => e.id == cycleId);
        let newObjective = {id: null, title: "New Objective", description: "All about this objective", keyResults: []};
        this.selectedCycle.objectives.unshift(newObjective);
        this.selectedObjective = newObjective; 
    },
    deleteObjective(cycleId, objective) {
      let cycle = this.cycles.find((e) => e.id == cycleId);
      cycle.objectives.splice(cycle.objectives.indexOf(objective), 1);

      if (objective.id) {
        this.$apollo.mutate({
            mutation: DELETE_OBJECTIVE,
            variables: {
                cycle_id: cycle.id,
                id: objective.id,
            }
        })
        .then(response => {
            console.log("DELETE_OBJECTIVE Success:", response.data);
            this.$noty.success("Objective Deleted")
        })
        .catch(error => {
            console.error("DELETE_OBJECTIVE Failure:", error)
            this.$noty.error("Failed to Delete Objective")
        })
      }

      this.selectedObjective = null;
    },
    deleteCycle(cycle) {
      this.cycles.splice(this.cycles.indexOf(cycle), 1);

      if (cycle.id) {
        this.$apollo.mutate({
            mutation: DELETE_CYCLE,
            variables: {
                id: cycle.id,
            }
        })
        .then(response => {
            console.log("Success:", response.data);
            this.$noty.success("Cycle Deleted")
        })
        .catch(error => {
            console.error("DELETE_CYCLE Failure:", error)
            this.$noty.error("Failed to Delete Cycle")
        })
      }

      this.selectedCycle = null;
      this.selectedObjective = null;
      if (this.cycles.length > 0) {
        this.selectedCycle = this.cycles[0];
      }
    },
  }
}
</script>
