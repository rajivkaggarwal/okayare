<template>
    <div>
        <objective v-for="objective in objectives" :key=objective.id :objective=objective :document=document :show-controls=showControls />
   </div>
</template>



<script>
import Objective from '@/components/Objective.vue';


export default {
    name: 'Objectives',
    components: {
      Objective
    },
    props: {
      objectives: Array,
      document: Object,
      showControls: Boolean
    },
    methods: {
   },
    data: function () {
        return {
        }
    },
}

</script>