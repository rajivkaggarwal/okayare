<template>

    <a class="button is-small is-success" @click="onClick">
        <span class="icon is-small">
            <i class="material-icons" style="font-size: 16px"><slot></slot></i>
        </span>
    </a>

</template>



<script>

export default {
    name:"EditButton",
    props: {
        onEdit: Function,
    },
    data: function () {
        return {
        }
    },
    methods: {
        onClick() {
            this.onEdit();
        }
    }
}

</script>