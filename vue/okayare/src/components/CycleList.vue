
 <template>
    <div>
        <Cycle v-for="cycle in cycles" :key=cycle.id :cycle=cycle />
    </div>
 </template>



<script>
import Cycle from './Cycle.vue';

export default {
  name: 'CycleList',
    components: {
      Cycle
    },

  props: {
    cycles: Array
  }
}

</script>
