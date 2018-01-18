<template>

    <div id="app">
        <section
                class="hero is-info is-nasa-background"
        >
            <div class="hero-body">
                <div class="container has-text-centered">
                    <img src="./assets/logo.png">
                    <h1 class="title">
                        NASA Asset Search Assistant
                    </h1>

                    <search-box :page="page" @resultsFound="displayResults" @searching="toggleSearching"></search-box>

                </div>
            </div>
        </section>
        <results-list :results="results" :searchStatus="searching"></results-list>
        <pager :page="page" :hits="hits" @pageChanged="setPage"></pager>
    </div>

</template>

<script>
    export default {
        name: 'app',

        data() {
            return {
                results: [],
                page: 1,
                hits: 100,
                searching: false
            }
        },

        methods: {
            displayResults(results) {
                this.searching = false;
                this.results = results.items;
                this.hits = results.metadata.total_hits;
            },

            toggleSearching() {
                this.results = [];
                this.searching = true;

            },

            setPage(page) {
                this.page = page;
            }
        }
    }

</script>

<style lang="scss">

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        background: rgb(32, 32, 32);
    }

    .is-nasa-background {
        height: 100%;
        background-size:contain;
        background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(32, 32, 32, 1)), url("../src/assets/background.jpg") no-repeat center;
        background-color: black;
    }

    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }

</style>
