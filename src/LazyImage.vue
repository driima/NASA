<!--
    Component: LazyImage
    Description:
        Load an image in the background.
        When the image is fully loaded, emit a "loaded" event and display the image.
        This ensures that images are fully loaded before being displayed.

-->
<template>
    <transition name="fade">
        <div class="lazy-image" :class="{loaded:hasLoaded}">
            <img :src="source" @load="loaded" v-show="hasLoaded">
        </div>
    </transition>
</template>

<script>
    export default {
        name: "lazy-image",

        props: ["source"],

        data() {
            return {
                hasLoaded: false
            }
        },

        methods: {
            loaded() {
                this.hasLoaded = true;
                this.$emit('loaded');
            }
        },
    }
</script>

<style lang="scss">
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    .lazy-image {
        position: relative;
        width: 100%;
        min-height: 192px;
        background: #333;

        &:not(.loaded) {
            &::after {
                content: "\f110";
                color: #fff;
                font-family: FontAwesome;
                font-size: 2rem;
                position: absolute;
                -webkit-animation: fa-spin 2s infinite linear;
                animation: fa-spin 2s infinite linear;
                top: calc(50% - 1rem);
                left: calc(50% - 1rem);
            }
        }
        
        &.loaded {
            background: none;
        }
    }

    .lazy-image img {
        -webkit-animation: fadeIn .2s ease;
        -o-animation: fadeIn .2s ease;
        animation: fadeIn .2s ease;
    }

    .fade-enter-active {
        transition: opacity .2s ease;
    }

    .fade-enter-to {
        opacity: 1;
    }

    .fade-enter {
        opacity: 0;
    }
</style>