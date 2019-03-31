<template>
    <span>
        <a class="button is-small is-warning" @click="onClick" v-show="!isConfirming">
        <span class="icon is-small">
            <i class="material-icons column" style="font-size: 16px"><slot></slot></i>
        </span>
        </a>
        <div class="notification is-danger" v-show="isConfirming">
            <div class="is-size-7">Are you sure?</div>
            <a class="button is-small is-warning" style="margin-right: 4px;" @click="onDelete">
                Delete
            </a>
            <a class="button is-small is-light" @click="onKeep">
                Keep
            </a>
        </div>
    </span>
</template>



<script>

export default {
    name:"DeleteConfirmButton",
    props: {
        onConfirm: Function,
        confirmText: String
    },
    data: function () {
        return {
            isConfirming: false
        }
    },
    methods: {
        onClick() {
            this.isConfirming = true;
        },
        onDelete() {
            this.onConfirm();
            this.isConfirming = false;
        },
        onKeep() {
            this.isConfirming = false;
        }
    }
}

</script>