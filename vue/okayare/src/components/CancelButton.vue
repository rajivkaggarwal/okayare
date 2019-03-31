<template>

    <a class="button is-small is-danger" @click="onClick">
        <slot></slot>
    </a>

</template>



<script>

export default {
    name:"CancelButton",
    props: {
        onCancel: Function,
    },
    data: function () {
        return {
        }
    },
    methods: {
        onClick() {
            this.onCancel();
        }
    }
}

</script>