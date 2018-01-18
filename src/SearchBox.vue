<template>
    <div class="field">
        <div class="control">
            <input
                    id="search"
                    class="input is-medium"
                    type="text"

                    v-model="query"

                    :placeholder="placeholder"

                    @blur="initPlaceholder"
                    @change="initPlaceholder"
                    @input="search(1)"
            >
        </div>
        <div class="tabs">
            <ul>
                <li>
                    <label class="switch">
                        <input type="checkbox" class="is-link" value="image" v-model="filter">
                        <span>Images</span>
                    </label>
                </li>
                <li>
                    <label class="switch">
                        <input type="checkbox" class="is-link" value="audio" v-model="filter">
                        <span>Audio</span>
                    </label>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: "search-box",

        props: ["page"],

        data() {
            return {
                placeholder: "",
                // A collection of simple space-related keywords used to retrieve a random placeholder title:
                placeholderKeywords: [
                    "Shuttle", "Probe", "Apollo", "Moon", "Earth", "Jupiter", "Saturn", "Uranus", "Mars", "Pluto",
                    "Neptune", "Venus", "Mercury", "Sun", "Milky Way", "Andromeda", "Hubble"
                ],
                // The interval ID for the placeholder randomsiation interval:
                placeholderInterval: 0,
                // Search query:
                query: "",
                filter: ['image'],
            }
        },

        computed: {

        },

        watch: {
            page() {
                if (this.query !== "") {
                    this.search();
                }
            },

            filter(newVal, oldVal) {
                // Prevent the filter from having no values
                if (newVal.length === 0) {
                    this.filter = oldVal;
                }

                if (this.query !== "") {
                    this.search();
                }
            }
        },

        mounted() {
            this.randomisePlaceholder();
        },

        created() {
            this.search = _.debounce(this.search, 750);
        },

        methods: {
            // Randomise the placeholder to provide search suggestions
            randomisePlaceholder() {
                let vm = this;

                if (this.query !== "" || this.placeholderInterval > 0) {
                    return;
                }

                function initRandomise() {

                    // Feed the API a sample from the predefined keywords
                    axios
                        .get("https://images-api.nasa.gov/search", {
                            params: {
                                q: _.sample(vm.placeholderKeywords)
                            }
                        })
                        .then((response) => {
                            // Set the placeholder to the title of a sample of one of the results.
                            const sample = _.sample(response.data.collection.items);

                            vm.placeholder = "Try '" + sample.data[0].title + "'";
                        });

                    // Randomise the placeholder every 15 seconds
                    vm.placeholderInterval = setTimeout(initRandomise, 15000);
                }

                initRandomise();
            },

            initPlaceholder() {
                if (this.query === "") {
                    this.randomisePlaceholder();
                } else {
                    this.clearPlaceholder();
                }
            },

            clearPlaceholder() {
                if (this.placeholderInterval > 0) {
                    clearInterval(this.placeholderInterval);
                    this.placeholderInterval = 0;
                    this.placeholder = "";
                }
            },

            search(page) {
                // Ensure that no results are retrieved if there is no search query
                if (this.query === "") {
                    this.initPlaceholder();
                    return;
                }

                if (page) {
                    this.page = page;
                }

                this.$emit('searching');

                axios
                    .get("https://images-api.nasa.gov/search", {
                        params: {
                            q: this.query,
                            page: this.page,
                            media_type: this.filter.join(",")
                        }
                    })
                    .then((response) => {
                        this.$emit('resultsFound', response.data.collection);
                    });
            },
        }
    }
</script>

<style lang="scss">

    #search {
        border-radius: 0;

        &::placeholder {
            color: #000;
        }
    }

    .tabs {
        input[type="checkbox"],
        input[type="checkbox"] + span {
            opacity: .5;
        }

        input[type="checkbox"]:checked,
        input[type="checkbox"]:checked + span {
            font-weight: bold;
            opacity: 1;
        }
    }

    .switch input[type="checkbox"] {
        display: none;
    }
    .switch input[type="checkbox"] + span {
        position: relative;
        display: inline-block;
        cursor: pointer;
        font-weight: 500;
        text-align: left;
        margin: 0px;
        padding: 0px 44px;
    }
    .switch input[type="checkbox"] + span:before, .switch input[type="checkbox"] + span:after {
        content: "";
        position: absolute;
        margin: 0;
        outline: 0;
        top: 50%;
        transform: translate(0, -50%);
        transition: all 0.1s ease-in-out;
    }
    .switch input[type="checkbox"] + span:before {
        left: 1px;
        width: 34px;
        height: 14px;
        background-color: #333;
        border-radius: 8px;
    }
    .switch input[type="checkbox"] + span:after {
        left: 0;
        width: 20px;
        height: 20px;
        background-color: #444;
        border-radius: 50%;
        box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.14), 0 2px 2px 0 rgba(0, 0, 0, 0.098), 0 1px 5px 0 rgba(0, 0, 0, 0.084);
    }
    .switch input[type="checkbox"]:checked + span:after {
        transform: translate(80%, -50%);
    }
    .switch input[type="checkbox"].is-link {
        display: none;
    }
    .switch input[type="checkbox"].is-link:checked + span:before {
        background-color: rgba(50, 115, 220, 0.5);
    }
    .switch input[type="checkbox"].is-link:checked + span:after {
        background-color: #3273dc;
        transform: translate(80%, -50%);
    }



</style>