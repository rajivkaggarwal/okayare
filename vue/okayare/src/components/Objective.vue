<template>
    <div style="padding-bottom:8px;">
        <div class="box" style="position: relative;">
            <div class="columns">
                <div class="column">
                    <h1 class="title">
                        <span>Objective&nbsp;-&nbsp;</span>
                        <input id="ob_title_input" type="text" style="font-size: inherit;" v-model="objective.title" v-show="whenEditing">
                        <span id="ob_title_show" v-show="!whenEditing">{{ objective.title }}</span>
                    </h1>
                    Description:&nbsp;
                    <input id="ob_description_input" type="text" v-model="objective.description" v-show="whenEditing">
                    <span id="ob_description_show" v-show="!whenEditing"> {{ objective.description }} </span>

                    <div id="ob_key_results" style="margin-top: 15px;" v-show="!isNew">
                        <key-results :keyResults=objective.keyResults :document=documentWithObjective :show-controls="showControls && !whenEditing" @keyResults-reordered="keyResultsReordered" ></key-results>
                    </div>

                </div>
                <edit-button id="ob_edit_button"  :on-edit="startEditing" v-show="showControls && !whenEditing">
                    edit
                </edit-button>
                <delete-confirm-button id="ob_delete_button" :on-confirm="deleteMe" confirm-text="Are you sure?" v-show="showControls && !whenEditing">
                    delete
                </delete-confirm-button>
                <save-button id="ob_save_button" :on-save="saveObjective" v-show="showControls && whenEditing">Save</save-button>
                <cancel-button id="ob_cancel_button"  :on-cancel="cancelEdit" v-show="showControls && whenEditing">Cancel</cancel-button>
            </div>
        </div>
    </div>
</template>



<script>
import Vue from 'vue'
import EditButton from '@/components/EditButton.vue';
import DeleteConfirmButton from '@/components/DeleteConfirmButton.vue';
import SaveButton from '@/components/SaveButton.vue';
import CancelButton from '@/components/CancelButton.vue';

import { CREATE_OBJECTIVE, UPDATE_OBJECTIVE, SET_KEY_RESULT_ORDER } from '@/graphql/mutations'

import KeyResults from '@/components/KeyResults.vue';
import EventBus from '@/components/event-bus.js';

export default {
    name: 'Objective',
    components: {
        KeyResults, EditButton, SaveButton, CancelButton, DeleteConfirmButton
    },
    props: {
        objective: Object,
        document: Object,
        showControls: Boolean
    },
    data () {
        return {
            objectiveEdit: null,
            isEditing: false
       }
    },
    computed: {
        documentWithObjective: function() {
            return {
                cycleId: this.document.cycleId,
                objectiveId: this.objective.id
            };
        },
        isNew: function() { return (!this.objective.id) },
        whenEditing: function() { return (this.isNew || this.isEditing) }
    },
    methods: {
        keyResultsReordered(newOrder) {
            this.objective.keyResults = newOrder;
            let keyResultIds = this.objective.keyResults.map(o => o.id);

            this.$apollo.mutate({
                mutation: SET_KEY_RESULT_ORDER,
                variables: {
                    cycle_id: this.document.cycleId,
                    objective_id: this.objective.id,
                    keyResultIds: keyResultIds,
                }
            })
            .then(response => {
                console.log("SET_KEY_RESULT_ORDER Success:", response.data.setKeyResultOrder);
                this.$noty.success("Key Result Order saved")
                this.showSaveKeyResultOrder = false;
            })
            .catch(error => {
                console.error("SET_KEY_RESULT_ORDER Failure:", error)
                this.$noty.error("Failed to Save Key Result Order")
            })

        },
        startEditing() {
            this.isEditing = true;
            this.objectiveEdit = Vue.util.extend({}, this.objective);
        },
        stopEditing() {
            this.isEditing = false;
        },
        deleteMe() {
            EventBus.$emit('delete-objective', {cycleId: this.document.cycleId, objective: this.objective});
        },
        saveObjective() {
            this.stopEditing();

            if (this.isNew) {
                // create
                this.$apollo.mutate({
                    mutation: CREATE_OBJECTIVE,
                    variables: {
                        cycle_id: this.document.cycleId,
                        title: this.objective.title,
                        description: this.objective.description
                    }
                })
                .then(response => {
                    console.log("CREATE_OBJECTIVE Success:", response.data);
                    this.$noty.success("New Objective saved")
                    this.objective.id = response.data.createObjective.id;
                })
                .catch(error => {
                    console.error("CREATE_OBJECTIVE Failure:", error)
                    this.$noty.error("Failed to Save New Objective")
                })
            } else {
                // update
                this.$apollo.mutate({
                    mutation: UPDATE_OBJECTIVE,
                    variables: {
                        cycle_id: this.document.cycleId,
                        id: this.objective.id,
                        title: this.objective.title,
                        description: this.objective.description
                    }
                })
                .then(response => {
                    console.log("UPDATE_OBJECTIVE Success:", response.data);
                    this.$noty.success("Objective Updated")
               })
                .catch(error => {
                    console.error("UPDATE_OBJECTIVE Failure:", error)
                    this.$noty.error("Failed to save Objective")
                })

            }
        },
        cancelEdit() {
            this.stopEditing();

            if (this.isNew) {
                this.deleteMe();
            } else {
                // restore state
                this.objective.title = this.objectiveEdit.title;
                this.objective.description = this.objectiveEdit.description;
            }
        }
    }

}

</script>