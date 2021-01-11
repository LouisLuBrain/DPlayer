import utils from './utils';

class Setting {
    constructor(player) {
        this.player = player;
        this.dWidth = 200;
        this.hover = [false, false];

        this.player.template.danmakuOpacityThumb.setAttribute('aria-label', (this.player.user.get('opacity') * 100).toFixed(0) + '%');

        this.player.template.mask.addEventListener('click', () => {
            this.hide();
        });
        // hover icon 2 show panel
        this.player.template.settingButton.addEventListener('mouseover', () => {
            this.show();
            this.hover[0] = true;
        });
        this.player.template.settingButtonMobile.addEventListener('mouseover', () => {
            this.show();
            this.hover[0] = true;
        });

        this.player.template.speed.addEventListener('mouseover', () => {
            this.showSpeed();
            this.hover[1] = true;
        });
        // auto disappear
        this.player.template.settingButton.addEventListener('mouseleave', () => {
            this.hover[0] = setTimeout(() => {
                this.hover[0] && this.hide();
            }, 300);
        });
        this.player.template.settingButtonMobile.addEventListener('mouseleave', () => {
            this.hover[0] = setTimeout(() => {
                this.hover[0] && this.hide();
            }, 300);
        });

        this.player.template.speed.addEventListener('mouseleave', () => {
            this.hover[1] = setTimeout(() => {
                this.hover[1] && this.hideSpeed();
            }, 300);
        });
        // enter & clear timer
        this.player.template.settingBox.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[0]);
        });
        this.player.template.settingBoxMobile.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[0]);
        });

        this.player.template.speedBox.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[1]);
        });
        // disapper when leave
        this.player.template.settingBox.addEventListener('mouseleave', () => {
            this.hide();
        });
        this.player.template.settingBoxMobile.addEventListener('mouseleave', () => {
            this.hide();
        });

        this.player.template.speedBox.addEventListener('mouseleave', () => {
            this.hideSpeed();
        });


        // loop
        this.loop = this.player.options.loop;
        this.player.template.loopToggle.checked = this.loop;
        this.player.template.loop.addEventListener('click', () => {
            this.player.template.loopToggle.checked = !this.player.template.loopToggle.checked;
            if (this.player.template.loopToggle.checked) {
                this.loop = true;
            } else {
                this.loop = false;
            }
            // this.hide();
        });

        this.player.template.loopToggleMobile.checked = this.loop;
        this.player.template.loopMobile.addEventListener('click', () => {
            this.player.template.loopToggleMobile.checked = !this.player.template.loopToggleMobile.checked;
            if (this.player.template.loopToggleMobile.checked) {
                this.loop = true;
            } else {
                this.loop = false;
            }
            // this.hide();
        });

        // show danmaku
        this.showDanmaku = this.player.user.get('danmaku');
        if (!this.showDanmaku) {
            this.player.danmaku && this.player.danmaku.hide();
        }
        this.player.template.showDanmakuToggle.checked = this.showDanmaku;
        this.player.template.showDanmaku.addEventListener('click', () => {
            this.player.template.showDanmakuToggle.checked = !this.player.template.showDanmakuToggle.checked;
            if (this.player.template.showDanmakuToggle.checked) {
                this.showDanmaku = true;
                this.player.danmaku.show();
            } else {
                this.showDanmaku = false;
                this.player.danmaku.hide();
            }
            this.player.user.set('danmaku', this.showDanmaku ? 1 : 0);
            // this.hide();
        });

        // unlimit danmaku
        this.unlimitDanmaku = this.player.user.get('unlimited');
        this.player.template.unlimitDanmakuToggle.checked = this.unlimitDanmaku;
        this.player.template.unlimitDanmaku.addEventListener('click', () => {
            this.player.template.unlimitDanmakuToggle.checked = !this.player.template.unlimitDanmakuToggle.checked;
            if (this.player.template.unlimitDanmakuToggle.checked) {
                this.unlimitDanmaku = true;
                this.player.danmaku.unlimit(true);
            } else {
                this.unlimitDanmaku = false;
                this.player.danmaku.unlimit(false);
            }
            this.player.user.set('unlimited', this.unlimitDanmaku ? 1 : 0);
            // this.hide();
        });

        // danmaku range
        if (this.player.danmaku) {
            this.player.on('danmaku_range', (range) => {
                this.player.user.set('range', range);
            });
            this.player.danmaku.range(this.player.user.get('range'));
            const selector = document.querySelector(`.dplayer-setting .dplayer-selector-option[data-range="${this.player.danmaku.getRange()}"]`);
            selector && selector.classList.add('range-selected');

            const selectorMobile = document.querySelector(`.dplayer-settingmobile .dplayer-selector-option[data-range="${this.player.danmaku.getRange()}"]`);
            selectorMobile && selectorMobile.classList.add('range-selected');

            for (let i = 0; i < this.player.template.commentRangeSelector.length; i++) {
                this.player.template.commentRangeSelector[i].addEventListener('click', () => {
                    const rangeSelectedBefore = document.querySelectorAll('.dplayer-selector-option.range-selected');
                    rangeSelectedBefore && rangeSelectedBefore.forEach((selected) => selected.classList.remove('range-selected'));

                    const range = this.player.template.commentRangeSelector[i].dataset.range;

                    const rangeSelected = document.querySelectorAll(`.dplayer-selector-option[data-range="${range}"]`);
                    rangeSelected && rangeSelected.forEach((selected) => selected.classList.add('range-selected'));

                    this.player.danmaku.range(range);
                });
            }
        }

        // speed
        this.player.template.speed.addEventListener('click', () => {
            if (this.player.template.speed.classList.contains('active')) {this.hideSpeed();}
            else {this.showSpeed();}
        });
        for (let i = 0; i < this.player.template.speedItem.length; i++) {
            this.player.template.speedItem[i].addEventListener('click', () => {
                const speedSelected = document.querySelector('.dplayer-setting-speed-item.speed-selected');
                speedSelected && speedSelected.classList.remove('speed-selected');

                this.player.speed(this.player.template.speedItem[i].dataset.speed);
                const num = this.player.template.speedItem[i].dataset.speed;
                this.player.template.speed.innerText = (num.length === 1 ? num + '.0' : num) + 'x';
                this.player.template.speedItem[i].classList.add('speed-selected');
                utils.isMobile || this.hide();
            });
        }

        // danmaku opacity
        if (this.player.danmaku) {
            this.player.on('danmaku_opacity', (percentage) => {
                this.player.bar.set('danmaku', percentage, 'width');
                this.player.bar.set('danmakuMobile', percentage, 'width');
                this.player.user.set('opacity', 0.9 * percentage + 0.1);
                this.player.template.danmakuOpacityThumb.setAttribute('aria-label', (percentage * 90 + 10).toFixed(0) + '%');
            });
            this.player.danmaku.opacity(this.player.user.get('opacity'));

            const danmakuMove = (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrap)) / this.player.template.danmakuOpacityBarWrap.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
            };
            const danmakuMoveMobile = (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrapMobile)) / this.player.template.danmakuOpacityBarWrapMobile.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
            };
            const danmakuUp = () => {
                document.removeEventListener(utils.nameMap.dragEnd, danmakuUp);
                document.removeEventListener(utils.nameMap.dragMove, danmakuMove);
                document.removeEventListener(utils.nameMap.dragMove, danmakuMoveMobile);
                this.player.template.danmakuOpacityBox.classList.remove('dplayer-setting-danmaku-active');
                this.player.template.danmakuOpacityBoxMobile.classList.remove('dplayer-setting-danmaku-active');
            };

            this.player.template.danmakuOpacityBarWrapWrap.addEventListener('click', (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrap)) / this.player.template.danmakuOpacityBarWrap.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
                this.player.template.danmakuOpacityThumb.setAttribute('aria-label', (percentage * 90 + 10).toFixed(0) + '%');
            });
            this.player.template.danmakuOpacityBarWrapWrapMobile.addEventListener('click', (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrapMobile)) / this.player.template.danmakuOpacityBarWrapMobile.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
                this.player.template.danmakuOpacityThumbMobile.setAttribute('aria-label', (percentage * 90 + 10).toFixed(0) + '%');
            });
            this.player.template.danmakuOpacityBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
                document.addEventListener(utils.nameMap.dragMove, danmakuMove);
                document.addEventListener(utils.nameMap.dragEnd, danmakuUp);
                this.player.template.danmakuOpacityBox.classList.add('dplayer-setting-danmaku-active');
            });
            this.player.template.danmakuOpacityBarWrapWrapMobile.addEventListener(utils.nameMap.dragStart, () => {
                document.addEventListener(utils.nameMap.dragMove, danmakuMove);
                document.addEventListener(utils.nameMap.dragEnd, danmakuUp);
                this.player.template.danmakuOpacityBoxMobile.classList.add('dplayer-setting-danmaku-active');
            });
        }

        // danmaku speed
        if (this.player.danmaku) {
            this.player.on('danmaku_speed', (speed) => {
                this.player.bar.set('speed',  (speed - 5000) / 15000, 'width');
                this.player.bar.set('speedMobile',  (speed - 5000) / 15000, 'width');
                this.player.user.set('speed', speed);
            });
            this.player.danmaku.speed(this.player.user.get('speed'));

            const danmakuSpeedMove = (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuSpeedBarWrap)) / this.player.template.danmakuSpeedBarWrap.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.speed(percentage.toFixed(2) * 15000 + 5000);
            };
            const danmakuSpeedMoveMobile = (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuSpeedBarWrapMobile)) / this.player.template.danmakuSpeedBarWrapMobile.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.speed(percentage.toFixed(2) * 15000 + 5000);
            };
            const danmakuSpeedUp = () => {
                document.removeEventListener(utils.nameMap.dragEnd, danmakuSpeedUp);
                document.removeEventListener(utils.nameMap.dragMove, danmakuSpeedMove);
                document.removeEventListener(utils.nameMap.dragMove, danmakuSpeedMoveMobile);
                this.player.template.danmakuSpeedBox.classList.remove('dplayer-setting-danmaku-active');
                this.player.template.danmakuSpeedBoxMobile.classList.remove('dplayer-setting-danmaku-active');
            };

            this.player.template.danmakuSpeedBarWrapWrap.addEventListener('click', (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuSpeedBarWrap)) / this.player.template.danmakuSpeedBarWrap.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.speed(percentage.toFixed(2) * 15000 + 5000);
            });
            this.player.template.danmakuSpeedBarWrapWrapMobile.addEventListener('click', (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuSpeedBarWrapMobile)) / this.player.template.danmakuSpeedBarWrapMobile.offsetWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.speed(percentage.toFixed(2) * 15000 + 5000);
            });

            this.player.template.danmakuSpeedBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
                document.addEventListener(utils.nameMap.dragMove, danmakuSpeedMove);
                document.addEventListener(utils.nameMap.dragEnd, danmakuSpeedUp);
                this.player.template.danmakuSpeedBox.classList.add('dplayer-setting-danmaku-active');
            });
            this.player.template.danmakuSpeedBarWrapWrapMobile.addEventListener(utils.nameMap.dragStart, () => {
                document.addEventListener(utils.nameMap.dragMove, danmakuSpeedMoveMobile);
                document.addEventListener(utils.nameMap.dragEnd, danmakuSpeedUp);
                this.player.template.danmakuSpeedBoxMobile.classList.add('dplayer-setting-danmaku-active');
            });
        }
        this.resize();
    }

    hide() {
        this.player.template.settingBox.classList.remove('dplayer-setting-box-open');
        this.player.template.settingBoxMobile.classList.remove('dplayer-setting-box-open');
        // this.player.template.mask.classList.remove('dplayer-mask-show');

        this.player.controller.disableAutoHide = false;
    }

    show() {
        // this.dWidth = this.player.template.danmakuOpacityBarWrap.offsetWidth

        this.player.template.settingBox.classList.add('dplayer-setting-box-open');
        this.player.template.settingBoxMobile.classList.add('dplayer-setting-box-open');
        // this.player.template.mask.classList.add('dplayer-mask-show');

        this.player.controller.disableAutoHide = true;
        this.hideSpeed();
    }

    hideSpeed() {
        this.player.template.speed.classList.remove('active');
    }

    showSpeed() {
        this.player.template.speed.classList.add('active');
        this.player.controller.disableAutoHide = true;
        this.hide();
    }

    resize() {
        if (utils.orientationAngle() === 0 || utils.orientationAngle() === 180) {
            this.player.template.settingBoxMobile.classList.add('vertical');
        } else {
            this.player.template.settingBoxMobile.classList.remove('vertical');
        }

    }
}

export default Setting;
