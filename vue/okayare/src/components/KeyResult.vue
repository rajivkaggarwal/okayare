<template>
    <div>
        <table width=100%><tr>
            <td>
                <b-icon icon="unfold-more-horizontal handle" size="is-small" v-show="showControls"></b-icon>
            </td><td>
                <div class="box" style="position: relative; margin-top: 8px;">
                    <div class="columns is-gapless">
                        <div class="column">
                            <p>
                                Title:
                                <input id="kr_title_input" type="text" v-model="keyResult.title" v-show="whenEditing">
                                <span id="kr_title_show" v-show="!whenEditing"> {{ keyResult.title }} </span>
                            </p>
                            <p>
                                Description:
                                <input id="kr_description_input" type="text" v-model="keyResult.description" v-show="whenEditing">
                                <span id="kr_description_show" v-show="!whenEditing"> {{ keyResult.description }} </span>
                            </p>
                        </div>
                        <div class="columns is-gapless">
                            <div class="column">
                                <edit-button id="kr_edit_button" :on-edit="startEditing" v-show="showControls && !whenEditing">edit</edit-button>
                            </div>
                            <div class="column">
                                <delete-confirm-button id="kr_delete_button" :on-confirm="deleteMe" confirm-text="Are you sure?" v-show="showControls && !whenEditing">
                                    delete
                                </delete-confirm-button>
                            </div>
                        </div>
                        <save-button id="kr_save_button" :on-save="saveKeyResult" v-show="showControls && whenEditing">Save</save-button>
                        <cancel-button id="kr_cancel_button" :on-cancel="cancelEdit" v-show="showControls && whenEditing">Cancel</cancel-button>
                    </div>
                </div>
            </td>
        </tr></table>
    </div>
</template>



<script>
import Vue from 'vue'
import DeleteConfirmButton from '@/components/DeleteConfirmButton.vue';
import EditButton from '@/components/EditButton.vue';
import SaveButton from '@/components/SaveButton.vue';
import CancelButton from '@/components/CancelButton.vue';
import { CREATE_KEY_RESULT, UPDATE_KEY_RESULT } from '@/graphql/mutations'


export default {
    name: 'KeyResult',
    components: {
        EditButton, SaveButton, CancelButton, DeleteConfirmButton
    },
    props: {
      keyResult: Object,
      document: Object,
      showControls: Boolean,
    },
    data: function () {
        return {
            keyResultEdit: null,
            isEditing: false,
        }
    },
    computed: {
        isNew: function() { return (!this.keyResult.id) },
        whenEditing: function() { return (this.isNew || this.isEditing) }
    },
    methods: {
        startEditing() {
            this.isEditing = true;
            this.keyResultEdit = Vue.util.extend({}, this.keyResult);
        },
        stopEditing() {
            this.isEditing = false;
        },
        deleteMe() {
            this.$emit('delete-key-result', this.keyResult);
        },
        saveKeyResult() {
            this.stopEditing();

            if (this.isNew) {
                // create
                this.$apollo.mutate({
                    mutation: CREATE_KEY_RESULT,
                    variables: {
                        cycle_id: this.document.cycleId,
                        objective_id: this.document.objectiveId,
                        title: this.keyResult.title,
                        description: this.keyResult.description
                    }
                })
                .then(response => {
                    console.log("CREATE_KEY_RESULT Success:", response.data);
                    this.$noty.success("New Key Result Saved")
                    this.keyResult.id = response.data.createKeyResult.id;
                })
                .catch(error => {
                    console.error("CREATE_KEY_RESULT Failure:", error)
                    this.$noty.error("Failed to Save Key result")
                })
            } else {
                // update
                this.$apollo.mutate({
                    mutation: UPDATE_KEY_RESULT,
                    variables: {
                        cycle_id: this.document.cycleId,
                        objective_id: this.document.objectiveId,
                        id: this.keyResult.id,
                        title: this.keyResult.title,
                        description: this.keyResult.description
                    }
                })
                .then(response => {
                    console.log("UPDATE_KEY_RESULT Success:", response.data);
                    this.$noty.success("Key Result Saved")
                })
                .catch(error => {
                    console.error("UPDATE_KEY_RESULT Failure:", error)
                    this.$noty.error("Failed to Save Key result")
                })
            }
        },
        cancelEdit() {
            this.stopEditing();
            if (this.isNew) {
                this.deleteMe();
            } else {
                this.keyResult.title = this.keyResultEdit.title;
                this.keyResult.description = this.keyResultEdit.description;
            }
        }
    }
}

</script>