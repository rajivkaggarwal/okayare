<template>
    <div>
        <span style="margin-right:10px;" class="subtitle">Key Results</span>
        <b-icon  v-show="showControls" class="plus" icon="plus-box" size="is-small" type="is-primary" @click.native="createKeyResult"></b-icon>
        <draggable v-model=keyResultsEdit handle=".handle" group="keyResults" @start="drag=true" @end="drag=false">
                <key-result v-for="kr in keyResults" :key=kr.id :key-result=kr :document=document
                    :show-controls=showControls @delete-key-result="deleteKeyResult"></key-result>
        </draggable>
    </div>
</template>



<script>
import KeyResult from './KeyResult.vue';
import draggable from 'vuedraggable'

import { DELETE_KEY_RESULT } from '@/graphql/mutations'

export default {
    name: 'KeyResults',
    components: {
        KeyResult, draggable
    },
    props: {
      keyResults: Array,
      document: Object,
      showControls: Boolean
    },
    computed: {
        keyResultsEdit: {
            get: function() {
                return this.keyResults;
            },
            set: function(newOrdering) {
                // Notify parennt to set and enable save button!
                this.$emit('keyResults-reordered', newOrdering);
            }
        },
    },
    methods: {
        createKeyResult() {
            let newKeyResult = {id: null, title: "New Key Result", description: "All about this key result"};
            this.keyResults.unshift(newKeyResult);
        },
        deleteKeyResult(kr) {
            console.log("deleteKeyResult event recieved");
            this.keyResults.splice(this.keyResults.indexOf(kr), 1);

            if (kr.id) {
                this.$apollo.mutate({
                    mutation: DELETE_KEY_RESULT,
                    variables: {
                        cycle_id: this.document.cycleId,
                        objective_id: this.document.objectiveId,
                        id: kr.id,
                    }
                })
                .then(response => {
                    console.log("DELETE_KEY_RESULT Success:", response.data);
                    this.$noty.success("Key Result Deleted")
                })
                .catch(error => {
                    console.error("DELETE_KEY_RESULT Failure:", error)
                    this.$noty.error("Failed to Delete Key result")
                })
            }

        }
   },
    data: function () {
        return {
        }
    },
    events: {
    }

}

</script>