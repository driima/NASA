<!--
    Component: VideoControls
    Description:
        Display controls for integrated HTML5 video element.
-->

<template>
    <div class="video-wrapper" @mouseover="showControls" @mouseleave="hideControls" @click="togglePlay" @dblclick="toggleFullscreen">
        <slot></slot>
        <div class="controls-wrapper" v-bind:class="{ show: show }" @click.stop="">
            <div class="progress-bar clickable" @click="seek($event)">
                <div class="progress-bar-total"></div>
                <div class="progress-bar-buffered" :style="progressBarBufferedStyle"></div>
                <div class="progress-bar-played" :style="progressBarPlayedStyle">
                    <div class="progress-bar-scrubber" @mousedown.stop="onSlide(seek)"></div>
                </div>
            </div>
            <div class="buttons">
                <div class="buttons-left-side-wrapper">
                    <div class="control-element-wrapper">
                        <div class="play-pause-button clickable"
                             :class="{ pause: playing }"
                             @click="togglePlay">
                        </div>
                    </div>
                    <div class="volume-slider-wrapper control-element-wrapper clickable">
                        <div class="volume-slider">
                            <div class="volume-slider-volume" :style="volumeSliderStyle">
                                <div class="volume-scrubber"
                                     @mousedown.stop="onSlide(setVolumeByScrubberPosition)"></div>
                            </div>
                            <div class="volume-slider-total"></div>
                        </div>
                    </div>
                    <div class="time control-element-wrapper">
                        {{ video && video.currentTime | timestamp }} / {{ video && video.duration | timestamp }}
                    </div>
                </div>
                <div class="buttons-right-side-wrapper">
                    <div class="control-element-wrapper fullscreen-wrapper" @click="toggleFullscreen">
                        <div class="fullscreen clickable">
                            <div v-for="item in new Array(4)" class="corner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "video-controls",

        mounted() {
            this.video = this.$slots.default[0].elm;

            window.video = this.video;

            this.video.addEventListener('pause', this.showControls);

            this.setVolume();
            this.video.addEventListener('volumechange', this.setVolume);

            setInterval(() => {
                this.updatePlayedPercentage();
                this.updateBufferedPercentage()
            }, 100);
        },

        data() {
            return {
                show: true,
                video: undefined,
                playing: false,
                playedPercentage: 0,
                bufferedPercentage: 0,
                runningTime: 0,
                totalTime: 0,
                volumePercentage: 0
            }
        },

        computed: {
            progressBarBufferedStyle() {
                return {
                    width: `${this.bufferedPercentage}%`
                }
            },

            progressBarPlayedStyle() {
                return {
                    width: `${this.playedPercentage}%`
                }
            },

            volumeSliderStyle() {
                return {
                    width: `${this.volumePercentage}%`
                }
            },
        },

        methods: {
            showControls() {
                this.show = true;
            },

            hideControls() {
                if (this.video.paused) {
                    return;
                }

                this.show = false;
            },

            togglePlay() {
                this.video.paused ? this.video.play() : this.video.pause();
                this.playing = !this.video.paused;
            },

            toggleFullscreen() {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (document.webkitFullscreenElement) {
                    document.webkitExitFullscreen();
                } else if (this.$el.requestFullscreen) {
                    this.$el.requestFullscreen();
                } else if (this.$el.webkitRequestFullscreen) {
                    this.$el.webkitRequestFullscreen();
                } else {
                    console.log('Your browser does not support this feature.');
                }
            },

            updatePlayedPercentage() {
                const progress = this.video.currentTime / this.video.duration;
                this.playedPercentage = progress * 100;
            },

            updateBufferedPercentage() {
                try {
                    let progress = vid.buffered.end(0) / vid.duration;
                } catch (error) {
                    return;
                }

                this.bufferedPercentage = progress * 100;
            },

            onSlide(callback) {
                document.addEventListener('mousemove', callback);
                document.addEventListener('mouseup', () => {
                    document.removeEventListener('mousemove', callback)
                });
            },

            seek(event) {
                const playFromPercent =
                    this.getMousePositionFromLeftInPercentage('.progress-bar-total', event.clientX);

                this.video.currentTime = this.video.duration * playFromPercent;
            },

            setVolumeByScrubberPosition(event) {
                const volume =
                    this.getMousePositionFromLeftInPercentage('.volume-slider-total', event.clientX);

                if (volume >= 0 && volume <= 1) {
                    this.video.volume = volume;
                }
            },

            setVolume() {
                this.volumePercentage = this.video.muted ? 0 : this.video.volume * 100;
            },

            getMousePositionFromLeftInPercentage(selector, clientX) {
                const element = this.$el.querySelector(selector);
                const mouseFromElementLeft =
                    this.getMousePositionFromLeftInPixels(element, clientX);

                return mouseFromElementLeft / element.offsetWidth;
            },

            getMousePositionFromLeftInPixels(element, clientX) {
                const elementLeft = element.getBoundingClientRect().left;

                return clientX - elementLeft;
            }
        }
    }
</script>

<style lang="scss">
    * {
        box-sizing: border-box;
    }

    .clickable {
        cursor: pointer;
    }

    .video-wrapper {
        height: 360px; /* This is not sustainable */

        overflow: hidden;
        display: inline-block;
    }

    .controls-wrapper {
        height: 65px;
        position: relative;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
        transition: opacity 0.2s ease-out;
        top: -70px;
        opacity: 0;
        padding: 10px;
    }

    .controls-wrapper.show {
        opacity: 1;
    }

    /* PROGRESS BAR */

    .progress-bar {
        height: 25px;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 2;
        transition: top 0.2s ease-out;
    }

    .progress-bar-buffered,
    .progress-bar-played,
    .progress-bar-total {
        height: 3px;
        width: 0%;
        position: absolute;
        transition: width 0.1s
    }

    .progress-bar-total {
        width: 100%;
        background-color: white;
        opacity: 0.75;
    }

    .progress-bar-buffered {
        background-color: grey;
        opacity: 0.75;
    }

    .progress-bar-played {
        background-color: rgb(223, 30, 36);
        display: flex;
        align-items: center;
    }

    .progress-bar-scrubber {
        position: absolute;
        right: 0;
        z-index: 2;
        box-sizing: content-box;
        border: 0 solid rgb(223, 30, 36);
        -webkit-border-radius: 8px;
        -moz-border-radius: 8px;
        border-radius: 8px;
        background-clip: content-box;
        transition: border 0.1s ease-out, right 0.1s ease-out;
    }

    .progress-bar:hover .progress-bar-scrubber {
        border: 6px solid rgb(223, 30, 36);
        right: -5px;
    }

    /* END PROGRESS BAR */

    /* VOLUME SLIDER */

    .volume-slider-wrapper {
        display: flex;
        align-items: center;
        width: 96px;
        overflow: hidden;
        transition: width 0.2s ease-out;
    }

    .volume-slider {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .volume-slider-total, .volume-slider-volume {
        width: 100%;
        height: 3px;
        background: white;
        position: absolute;
    }

    .volume-slider-total {
        opacity: 0.5;
    }

    .volume-slider-volume {
        width: 50%;
        display: flex;
        align-items: center;
    }

    .volume-scrubber {
        position: absolute;
        right: -5px;
        background-color: white;
        z-index: 2;
        box-sizing: content-box;
        border: 5px solid #fff;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        background-clip: content-box;
        transition: left 0.2s ease-out;
    }

    /* END VOLUME SLIDER */

    .buttons {
        width: 100%;
        height: 100%;
        position: relative;
        top: -15px;
        display: flex;
        align-items: center;
    }

    .buttons-left-side-wrapper,
    .buttons-right-side-wrapper {
        display: flex;
        flex-grow: 1;
        margin-top: 4px;
    }

    .buttons-right-side-wrapper {
        justify-content: flex-end;
    }

    .control-element-wrapper {
        padding: 8px;
    }

    /* PLAY/PAUSE BUTTON */

    $size: 20px;
    $bar-ratio: 0.25;
    $color: #fff;
    $animation-time: .2s;

    .play-pause-button {
        position: relative;

        width: $size;
        height: $size;

        opacity: 0.75;

        -webkit-transition: opacity .2s;
        -moz-transition: opacity .2s;
        -ms-transition: opacity .2s;
        -o-transition: opacity .2s;
        transition: opacity .2s;

        &::before, &::after { /* Play state */
            content: "";
            position: absolute;
            left: 0; top: 50%; transform: translateY(-50%);
            height: 100%;
            border: 0px solid transparent;
            border-width: $size*0.25 0 $size*0.25 $size*0.5;
            border-left-color: $color;

            transition: all $animation-time ease;
        }

        &::after {
            left: auto; right: 0;
            height: 0%;
        }

        &.pause { /* Pause state */
            &::before, &::after {
                border-left-width: $size*0.5;
                height: 100%;
                border-width: 0 0 0 ($size - $size*$bar-ratio)/2;
            }
        }

        &:hover {
            opacity: 1;
        }
    }

    /* END PLAY/PAUSE BUTTON */

    /* FULL SCREEN BUTTON */

    .fullscreen-wrapper {

    }

    .fullscreen {
        width: 18px;
        height: 18px;
        position: relative;
    }

    .corner {
        position: absolute;
        width: 7px;
        height: 7px;
    }

    .corner:nth-child(1) {
        left: 0;
        top: 0;
        border-top: 2px solid white;
        border-left: 2px solid white
    }

    .corner:nth-child(2) {
        right: 0;
        top: 0;
        border-top: 2px solid white;
        border-right: 2px solid white
    }

    .corner:nth-child(3) {
        bottom: 0;
        right: 0;
        border-bottom: 2px solid white;
        border-right: 2px solid white
    }

    .corner:nth-child(4) {
        left: 0;
        bottom: 0;
        border-bottom: 2px solid white;
        border-left: 2px solid white
    }

    /* END FULL SCREEN BUTTON */

    /* TIMESTAMP */

    .time {
        color: white;
        font-size: .8rem;
        font-family: 'Source Sans Pro', sans-serif;
    }
</style>