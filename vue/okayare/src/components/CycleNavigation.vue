
 <template>
    <div>
        <aside class="menu">
            <p class="menu-label">
                Cycles
                <b-icon class="plus" icon="plus-box" size="is-small" type="is-primary" @click.native="createCycle"></b-icon>
            </p>
            <ul class="menu-list">
                <draggable v-model=cyclesEdit handle=".cycleHandle" group="cycles"  @start="drag=true" @end="drag=false">
                        <li v-for="cycle in cyclesEdit" :key=cycle.id>
                            
                            <b-icon icon="unfold-more-horizontal cycleHandle" size="is-small"></b-icon>
                            <input :id="cycle.id" class="toggle" type="checkbox" checked />
                            <label :for="cycle.id" class="lbl-toggle">
                                <span v-bind:class="cycleEntryClass(cycle.id)" style="cursor: pointer;" @click="onCycleClick(cycle.id)">{{ cycle.title }}</span>
                            </label>

                            
                            <ul :id="cycle.id" class="collapsible-content">
                                <draggable v-model=cycle.objectives group="objectives" handle=".objectiveHandle"
                                                            @start="drag=true" @end="drag=false" v-on:change="onObjectiveDragChange($event, cycle)">
                                    <li v-for="objective in cycle.objectives" :key=objective.id>
                                        <div v-bind:class="objectiveEntryClass(objective.id)" @click="onClickObjective(cycle.id, objective.id)">
                                            <b-icon icon="unfold-more-horizontal objectiveHandle" size="is-small"></b-icon>
                                            <span style="cursor: pointer;">{{ objective.title }}</span>
                                        </div>
                                    </li>
                                </draggable>
                                <b-icon v-show="!isCreatingObjective(cycle)" class="plus" icon="plus-box" size="is-small" type="is-primary" @click.native="addObjectiveToCycle(cycle.id)"></b-icon>

                            </ul>
        
                        </li>
                </draggable>
            </ul>
        </aside>
    </div>
 </template>



<script>
import draggable from 'vuedraggable'

export default {
    name: 'CycleNavigation',
    components: {
        draggable
    },
    props: {
        cycles: Array,
        selectedCycle: Object,
        selectedObjective: Object
    },
    data () {
        return {
            lastObjectiveCHangeEvent: null
        }
    },
    computed: {
        cyclesEdit: {
            get: function() {
                return this.cycles
            },
            set: function(newOrdering) {
                // Notify parennt to set and enable save button!
                this.$emit('cycles-reordered', newOrdering);
            }
        },
    },
    methods: {
        createCycle() {
            console.log("createCycle clicked");
            this.$emit('cycle-create');
        },
        addObjectiveToCycle(cycleId) {
            console.log("addObjectiveToCycle", cycleId);
            this.$emit('objective-create', cycleId);
        },
        isCreatingObjective(cycle) {
            return cycle.objectives.find((o) => o.id == null) ? true : false;
        },
        onCycleClick(id) {
            // highlight the clicked cycle
            // show only that cycle on right side
            this.$emit('cycle-selected', id);
        },
        onClickObjective(cycleId, objectiveId) {
            // highlight the clicked objective
            // show only that cycle on right side
            this.$emit('objective-selected', cycleId, objectiveId);
        },
        cycleEntryClass(id) {
            return {
                "selected-cycle": (this.selectedCycle && this.selectedCycle.id == id)
            }
        },
        objectiveEntryClass(id) {
            return {
                "selected-objective": (this.selectedObjective && this.selectedObjective.id == id)
            }
        },
        onObjectiveDragChange(event, cycle) {
            var eventToEmit=null;

            if (event.added || event.removed) {
                if (this.lastObjectiveChangeEvent) {
                    // combine into an event to emit
                    eventToEmit = {change: "moved"};
                    if (event.added) {
                        eventToEmit.objective = event.added.element;
                        eventToEmit.from = this.lastObjectiveChangeEvent.cycle;
                        eventToEmit.to = cycle;
                    } else {
                        eventToEmit.objective = event.removed.element;
                        eventToEmit.from = cycle;
                        eventToEmit.to = this.lastObjectiveChangeEvent.cycle;
                    }
                    this.lastObjectiveChangeEvent = null;
                } else {
                    // just assign and wait for the other event
                    this.lastObjectiveChangeEvent = event;
                    this.lastObjectiveChangeEvent.cycle = cycle;
                }
            } else if (event.moved) {
                eventToEmit = {change: "reorder", objective: event.moved.element, from: cycle, to: cycle};
            }

            if (eventToEmit) {
                this.$emit('objective-moved', eventToEmit);
            }
        }
    },

}

</script>

<style scoped>
    .selected-cycle {
        background-color: #b4cec2;
    }
    .selected-objective {
        background-color: #d9dfdb;
    }

    input[type='checkbox'] {
        display: none;
    }


    .lbl-toggle {
        margin-left: 5px;
        transition: all 0.25s ease-out;
    }

    .lbl-toggle::before {
        content: ' ';
        display: inline-block;

        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 6px solid currentColor;
        vertical-align: middle;
        margin-right: .5rem;
        transform: translateY(-2px);

        transition: transform .2s ease-out;
    }

    .toggle:checked + .lbl-toggle::before {
        transform: rotate(90deg) translateX(-3px);
    }

    .collapsible-content {
        max-height: 0px;
        overflow: hidden;
        transition: max-height .25s ease-in-out;
    }

    .toggle:checked + .lbl-toggle + .collapsible-content {
        max-height: 10000px;
    }

    .toggle:checked + .lbl-toggle {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }


</style>
