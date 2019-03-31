<template>
    <div>

        <article class="message">
            <div class="message-header">
                <span style="text-align: center;">
                    <div v-show="whenEditing">
                        <i class="material-icons">schedule</i>
                        Cycle: <input id="cycle_title_input" type="text" style="font-size: inherit;" v-model="cycle.title">
                    </div>
                    <div id="cycle_title_show" v-show="!whenEditing">
                        <i class="material-icons">schedule</i>
                        Cycle: {{ cycle.title }}
                    </div>
                </span>
                <span v-show="showControls && whenEditing">
                    <save-button id="cycle_save_button" :on-save="saveCycle">Save</save-button>
                    <cancel-button id="cycle_cancel_button" :on-cancel="cancelEdit">Cancel</cancel-button>
                </span>
                <span v-show="showControls && !whenEditing">
                    <edit-button id="cycle_edit_button" :on-edit="startEditing">edit</edit-button>&nbsp;
                    <delete-confirm-button id="cycle_delete_button" :on-confirm="deleteMe" confirm-text="Are you sure?">delete</delete-confirm-button>
                </span>
            </div>
            <div class="message-body">
                <div v-show="whenEditing">
                    Description: <input id="cycle_description_input" type="text" v-model="cycle.description">
                </div>
                <div id="cycle_description_show" v-show="!whenEditing">
                    Description: {{cycle.description}}
                </div>
            </div>
        </article>

        <objectives id="cycle_objectives" :objectives=cycle.objectives :document=document :show-controls="showControls && !whenEditing"></objectives>
    </div>
</template>



<script>

import Vue from 'vue'
import Objectives from '@/components/Objectives.vue';
import SaveButton from '@/components/SaveButton.vue';
import CancelButton from '@/components/CancelButton.vue';
import EditButton from '@/components/EditButton.vue';
import DeleteConfirmButton from '@/components/DeleteConfirmButton.vue';

import { CREATE_CYCLE, UPDATE_CYCLE } from '@/graphql/mutations'
import EventBus from '@/components/event-bus.js';

export default {
    name: 'Cycle',
    components: {
      Objectives, SaveButton, CancelButton, EditButton, DeleteConfirmButton
    },
    props: {
      cycle: Object,
      showControls: Boolean
    },
    data() {
        return {
            cycleEdit: null,
            isEditing: false
        }
    },
    computed: {
        document: function() {
            return {
                cycleId: this.cycle.id,
            };
        },
        isNew: function() { return (!this.cycle.id) },
        whenEditing: function() { return (this.isNew || this.isEditing) }
    },
    methods: {
        startEditing() {
            this.isEditing = true;
            this.cycleEdit = Vue.util.extend({}, this.cycle);
        },
        stopEditing() {
            this.isEditing = false;
        },
        deleteMe() {
            EventBus.$emit('delete-cycle', {cycle: this.cycle});
        },
        saveCycle() {
            this.stopEditing();

            if (this.isNew) {
                // create
                this.$apollo.mutate({
                    mutation: CREATE_CYCLE,
                    variables: {
                        title: this.cycle.title,
                        description: this.cycle.description
                    }
                })
                .then(response => {
                    console.log("CREATE_CYCLE Success:", response.data);
                    this.$noty.success("Saved Cycle")

                    // update id
                    this.cycle.id = response.data.createCycle.id;
                })
                .catch(error => {
                    console.error("CREATE_CYCLE Failure:", error)
                    this.$noty.error("Failed to Save Cycle")
                })
            } else {
                // update
                this.$apollo.mutate({
                    mutation: UPDATE_CYCLE,
                    variables: {
                        id: this.cycle.id,
                        title: this.cycle.title,
                        description: this.cycle.description
                    }
                })
                .then(response => {
                    console.log("UPDATE_CYCLE Success:", response.data);
                    this.$noty.success("Saved Cycle")
                })
                .catch(error => {
                    console.error("UPDATE_CYCLE Failure:", error)
                    this.$noty.error("Failed to Save Cycle")
                })
            }
        },
        cancelEdit() {
            this.stopEditing();
            if (this.isNew) {
                // tell parent to remove from list
                EventBus.$emit('delete-cycle', {cycle: this.cycle});
            } else {
                this.cycle.title = this.cycleEdit.title
                this.cycle.description = this.cycleEdit.description
            }
        }
    }
}

</script>