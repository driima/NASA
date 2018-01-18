<template>
    <div>
        <!--For each item in loadedResults-->
        <div class="results" v-if="loadedResults.length > 0">
            <!--If the item is loaded (audio is loaded by default; images are loaded on lazy-image@loaded)-->
            <div v-show="item.loaded"
                 v-for="item in loadedResults"
                 :class="{image: isFilterType(item, 'image'), audio: isFilterType(item, 'audio')}"
                 @click="showDetails(item)"
                 class="result"
            >
                <!--If the item is an image, display the item with lazy-image-->
                <!--LazyImage is a component which preloads the image before the component renders the img element-->
                <lazy-image v-if="isFilterType(item, 'image')"
                            :source="item.thumb"
                            @loaded="imageLoaded(item)">
                </lazy-image>

                <div v-else-if="isFilterType(item, 'audio')"
                     class="audio-wrapper"
                >
                    <i class="fa fa-headphones" aria-hidden="true"></i>
                    <p>{{ item.data[0].title }}</p>
                </div>
            </div>
        </div>
        <div class="loading" v-else-if="results.length > 0 || searchStatus"></div>

        <!--Modal Preview Window-->

        <!--Fade Transition-->
        <transition name="fade">
            <!--Only show if there is an active item-->
            <div class="modal is-active" v-if="activeItem">
                <!--Close the modal if it clicking outside-->
                <div class="modal-background" @click="hideDetails"></div>
                <div class="modal-card">
                    <section class="modal-card-body">
                        <lazy-image v-if="activeItem.data[0].media_type === 'image'"
                                    :source="activeItem.sources[0].link"></lazy-image>
                        <audio :id="activeItem.data[0].nasa_id" v-else-if="activeItem.data[0].media_type === 'audio'"
                               controls>
                            <source v-for="audio in activeItem.audioLinks" :src="audio.link" :type="audio.type">
                        </audio>
                    </section>
                    <footer class="modal-card-foot is-radiusless">
                        <article class="media" style="width: 100%">
                            <div class="media-content">
                                <div class="has-text-centered">
                                    <h1 class="is-size-4">
                                        {{ activeItem.data[0].title | truncate(64) }}
                                    </h1>
                                </div>
                                <br>
                                <div class="content">
                                    <p class="is-size-7">
                                        {{ activeItem.data[0].description | truncate(filterLength) }}
                                    </p>
                                    <div class="content has-text-centered"
                                         v-show="activeItem.data[0].description.length > 256">
                                        <a class="is-size-7 has-text-info" @click="toggleFilter">{{ filterText }}</a>
                                    </div>
                                </div>
                                <div class="field is-grouped is-grouped-multiline">
                                    <div class="control" v-for="keyword in activeItem.data[0].keywords">
                                        <a class="tag is-link is-pulled-right">{{ keyword }}</a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </footer>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: "results-list",

        props: ["results", "searchStatus"],

        data() {
            return {
                activeItem: false,
                filtering: true,
                // Used to ensure that metadata for each item is loaded before being rendered:
                loadedResults: []
            }
        },

        watch: {
            results(val) {
                this.loadedResults = [];

                _.each(val, (item) => {
                    item.thumb = "";
                    item.sources = [];
                    item.loaded = item.data[0].media_type === "audio";

                    axios
                        .get("https://images-api.nasa.gov/asset/" + item.data[0].nasa_id)
                        .then(function (response) {
                            _.each(response.data.collection.items, (link) => {
                                let filetype = link.href.split('.')
                                    .pop();

                                if (filetype.toLowerCase() === "json") {
                                    return;
                                }

                                item.sources.push({
                                    link: link.href,
                                    type: item.data[0].media_type + '/' + filetype
                                });
                            });

                            // Metadata indicates thumbnail quality images are the last in the collection
                            // But might not always end with ~thumb
                            item.thumb = item.sources[item.sources.length - 1].link;

                            this.loadedResults.push(item);
                            this.$forceUpdate();
                        }.bind(this));
                });
            }
        },

        computed: {
            filterText() {
                return this.filtering ? "Show more" : "Show less";
            },

            filterLength() {
                return this.filtering ? 256 : 2048;
            }
        },

        methods: {
            isFilterType(item, type) {
                return item.data[0].media_type === type;
            },

            showDetails(item) {
                this.activeItem = item;
                this.filtering = true;
            },

            hideDetails() {
                this.activeItem = false;
            },

            toggleFilter() {
                this.filtering = !this.filtering;
            },

            imageLoaded(item) {
                item.loaded = true;
                this.$forceUpdate();
            }
        }
    }
</script>

<!--FIXME: Some of these styles might be redundant-->
<style lang="scss">
    @keyframes slideUp {
        0% {
            transform: translateY(100%);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }



    .loading {
        position: relative;
        width: 100%;
        height: 128px;

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

    .results {
        display: flex;
        flex-wrap: wrap;
    }

    .result {
        animation: slideUp .2s ease-in-out;
        display: flex;
        flex-grow: 1;
        max-width: 512px;
        margin: 2px;
        cursor: pointer;
        border: 2px solid #000;

        background: #333;

        -webkit-transition: all .2s ease;
        -moz-transition: all .2s ease;
        -ms-transition: all .2s ease;
        -o-transition: all .2s ease;
        transition: all .2s ease;

        &.audio {
            max-width: 192px;
        }

        &:hover {
            -webkit-box-shadow: 0 0 8px #222;
            -moz-box-shadow: 0 0 8px #222;
            box-shadow: 0 0 8px #222;
            -webkit-transform: scale(1.025);
            -moz-transform: scale(1.025);
            -ms-transform: scale(1.025);
            -o-transform: scale(1.025);
            transform: scale(1.025);
            z-index: 9999;
        }
    }

    .result > .lazy-image,
    .result img {
        flex-grow: 1;
        height: 192px;
        max-width: 512px;
    }

    .audio-wrapper {
        position: relative;
        width: 192px;
        display: flex;
        flex-direction: column;
        color: #fff;
        justify-content: space-around;
        align-items: center;
        font-size: 2rem;

        p {
            font-size: 0.8rem;
        }

        &::before {
            content: "";
            display: block;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, .5);
            -webkit-transition: all .2s ease;
            -moz-transition: all .2s ease;
            -ms-transition: all .2s ease;
            -o-transition: all .2s ease;
            transition: all .2s ease;
        }

        &::after {
            content: "\f04b";
            position: absolute;
            font: normal normal normal 14px/1 FontAwesome;
            background: rgba(0, 0, 0, .5);
            width: 64px;
            height: 64px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
            text-rendering: auto;
            -webkit-transition: all .2s ease;
            -moz-transition: all .2s ease;
            -ms-transition: all .2s ease;
            -o-transition: all .2s ease;
            transition: all .2s ease;
        }

        &:hover {
            &::after {
                opacity: .25;
                -webkit-transform: scale(.75);
                -moz-transform: scale(.75);
                -ms-transform: scale(.75);
                -o-transform: scale(.75);
                transform: scale(.75);
            }
            &::before {
                opacity: 0;
            }
        }
    }

    .modal {
        z-index: 9999;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .1s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .pagination-link {
        color: #fff;
    }
</style>