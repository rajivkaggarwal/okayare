<template>

    <a class="button is-small is-success" @click="onClick">
        <slot></slot>
    </a>

</template>



<script>

export default {
    name:"SaveButton",
    props: {
        onSave: Function,
    },
    data: function () {
        return {
        }
    },
    methods: {
        onClick() {
            this.onSave();
        }
    }
}

</script>