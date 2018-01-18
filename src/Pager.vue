<template>
    <section class="section" v-if="hits > 0">
        <div class="container">
            <nav class="pagination is-centered" role="navigation" aria-label="pagination">
                <a class="pagination-previous has-text-white" v-if="page > 1" @click="previous"><i class="fa fa-chevron-left" aria-hidden="true"></i>
                </a>
                <a class="pagination-next has-text-white" v-if="page < lastPage" @click="next"><i class="fa fa-chevron-right" aria-hidden="true"></i>
                </a>
                <!--The pager is complex and can probably be simplified-->
                <ul class="pagination-list">
                    <!--Always show page 1-->
                    <li v-if="page > 2 && lastPage > 3"><a class="pagination-link" @click="goto(1)">1</a></li>
                    <!--Show ellipsis if we are on page >3-->
                    <li v-if="page > 3"><span class="pagination-ellipsis">&hellip;</span></li>

                    <!--Show lastPage-2 if we are on lastPage-->
                    <li v-if="hits > 100 && page > 2 && page === lastPage"><a class="pagination-link" @click="goto(lastPage-2)">{{lastPage-2}}</a></li>
                    <!--Show page-1-->
                    <li v-if="page > 1" ><a class="pagination-link"@click="previous">{{page-1}}</a></li>

                    <!--Show current page-->
                    <li><a class="pagination-link is-current" aria-current="page">{{page}}</a></li>

                    <!--Show page+1-->
                    <li v-if="hits > 100 && page < lastPage"><a class="pagination-link" @click="next">{{page+1}}</a></li>
                    <!--Show page 3 if we are on page 1-->
                    <li v-if="hits > 100 && page < lastPage && page === 1 && lastPage > 3"><a class="pagination-link" @click="goto(3)">3</a></li>

                    <!--Show ellipsis if we are on <lastPage -2-->
                    <li v-if="page < lastPage-2"><span class="pagination-ellipsis">&hellip;</span></li>
                    <!--Always show lastPage-->
                    <li v-if="page < lastPage-1"><a class="pagination-link" @click="goto(lastPage)">{{lastPage}}</a></li>
                </ul>
            </nav>
        </div>
    </section>
</template>

<script>
    export default {
        name: "pager",
        props: ["page", "hits"],
        computed: {
            lastPage() {
                let lastPage = Math.ceil(this.hits / 100);

                if (lastPage > 100) {
                    lastPage = 100;
                }

                return lastPage;
            }
        },
        methods: {
            previous() {
                this.goto(this.page-1);
            },

            next() {
                this.goto(this.page+1);
            },

            goto(page) {
                this.$emit('pageChanged', page);
            }
        }
    }
</script>

<style lang="scss">

</style>