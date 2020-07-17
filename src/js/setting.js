import utils from './utils';

class Setting {
    constructor(player) {
        this.player = player;
        this.dWidth = 200;
        this.hover = [false, false];

        this.player.template.mask.addEventListener('click', () => {
            this.hide();
        });
        // hover icon 2 show panel
        this.player.template.settingButton.addEventListener('mouseover', () => {
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

        this.player.template.speed.addEventListener('mouseleave', () => {
            this.hover[1] = setTimeout(() => {
                this.hover[1] && this.hideSpeed();
            }, 300);
        });
        // enter & clear timer
        this.player.template.settingBox.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[0]);
        });

        this.player.template.speedBox.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[1]);
        });
        // disapper when leave
        this.player.template.settingBox.addEventListener('mouseleave', () => {
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
        for (let i = 0; i < this.player.template.commentRangeSelector.length; i++) {
            this.player.template.commentRangeSelector[i].addEventListener('click', (event) => {
                const radio = event.target.previousElementSibling;
                radio.checked = true;
                this.player.danmaku.range(radio.value);
            });
        }

        // speed
        this.player.template.speed.addEventListener('click', () => {
            if (this.player.template.speed.classList.contains('active')) {this.hideSpeed();}
            else {this.showSpeed();}
        });
        for (let i = 0; i < this.player.template.speedItem.length; i++) {
            this.player.template.speedItem[i].addEventListener('click', () => {
                this.player.speed(this.player.template.speedItem[i].dataset.speed);
                const num = this.player.template.speedItem[i].dataset.speed;
                this.player.template.speed.innerText = (num.length === 1 ? num + '.0' : num) + 'x';
                this.hide();
            });
        }

        // danmaku opacity
        if (this.player.danmaku) {
            this.player.on('danmaku_opacity', (percentage) => {
                this.player.bar.set('danmaku', percentage, 'width');
                this.player.user.set('opacity', percentage);
            });
            this.player.danmaku.opacity(this.player.user.get('opacity'));

            const danmakuMove = (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrap)) / this.dWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
            };
            const danmakuUp = () => {
                document.removeEventListener(utils.nameMap.dragEnd, danmakuUp);
                document.removeEventListener(utils.nameMap.dragMove, danmakuMove);
                this.player.template.danmakuOpacityBox.classList.remove('dplayer-setting-danmaku-active');
            };

            this.player.template.danmakuOpacityBarWrapWrap.addEventListener('click', (event) => {
                const e = event || window.event;
                let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.danmakuOpacityBarWrap)) / this.dWidth;
                percentage = Math.max(percentage, 0);
                percentage = Math.min(percentage, 1);
                this.player.danmaku.opacity(percentage);
                console.log('AL: percentage', percentage);
            });
            this.player.template.danmakuOpacityBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
                document.addEventListener(utils.nameMap.dragMove, danmakuMove);
                document.addEventListener(utils.nameMap.dragEnd, danmakuUp);
                this.player.template.danmakuOpacityBox.classList.add('dplayer-setting-danmaku-active');
            });
        }
    }

    hide() {
        this.player.template.settingBox.classList.remove('dplayer-setting-box-open');
        // this.player.template.mask.classList.remove('dplayer-mask-show');

        this.player.controller.disableAutoHide = false;
    }

    show() {
        // this.dWidth = this.player.template.danmakuOpacityBarWrap.offsetWidth

        this.player.template.settingBox.classList.add('dplayer-setting-box-open');
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
}

export default Setting;
