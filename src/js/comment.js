import utils from './utils';
import Icons from './icons';

class Comment {
    constructor(player) {
        this.player = player;
        this.commentLength = 0;
        this.hover = [false];
        this.sendTimer = false;
        this.counterInter = null;
        this.counterNum = 4;

        this.showDanmaku = this.player.user.get('danmaku');
        if (!this.showDanmaku) {
            this.player.danmaku && this.player.danmaku.hide();
        }

        this.player.template.mask.addEventListener('click', () => {
            this.hide();
        });
        this.player.template.commentButton.addEventListener('click', () => {
            // this.show();
            this.toggleShowDanmaku();
        });
        // MARK:  ES2020 new features
        this.player.template.commentSettingButton?.addEventListener('mouseover', () => {
            this.showSetting();
            this.hover[0] = true;
        });
        this.player.template.commentSettingButton?.addEventListener('mouseleave', () => {
            this.hover[0] = setTimeout(() => {
                this.hover[0] && this.hideSetting();
            }, 300);
        });

        this.player.template.commentColorSettingBox?.addEventListener('click', () => {
            const sele = this.player.template.commentColorSettingBox.querySelector('input:checked+span');
            if (sele) {
                const color = this.player.template.commentColorSettingBox.querySelector('input:checked').value;
                this.player.template.commentSettingFill.style.fill = color;
                // this.player.template.commentInput.style.color = color;
                // this.player.template.commentSendFill.style.fill = color;
            }
        });

        this.player.template.commentSettingBox?.addEventListener('mouseenter', () => {
            clearTimeout(this.hover[0]);
        })

        this.player.template.commentSettingBox?.addEventListener('mouseleave', () => {
            this.hideSetting()
        })

        this.player.template.commentInput?.addEventListener('click', () => {
            this.hideSetting();
        });
        this.player.template.commentInput?.addEventListener('focus', () => {
            this.show();
        });
        this.player.template.commentInput?.addEventListener('keydown', (e) => {
            const event = e || window.event;
            if (event.keyCode === 13) {
                this.send();
            }
        });

        this.player.template.commentInput?.addEventListener('keyup', (e) => {
            const event = e || window.event;
            if (event.keyCode !== 13) {
                this.commentLength = this.player.template.commentInput.value.length;
            }
            if (this.commentLength > 100) {
                this.player.template.commentCounter.innerText = this.commentLength + '/100';
                this.player.template.commentCounter.style.width = 'auto';
                // this.player.template.commentInput.style.marginRight = '54px';
            } else {
                this.player.template.commentCounter.innerText = '';
                this.player.template.commentCounter.style.width = '0px';
                this.player.template.commentInput.style.marginRight = '0px';
            }
        });

        this.player.template.commentSendButton?.addEventListener('click', () => {
            this.send();
        });
        this.player.template.commentInputUnAuthLogin?.addEventListener('click', this.player.options.history?.login)
        this.player.template.commentInputUnAuthRegister?.addEventListener('click', this.player.options.history?.register)
    }

    toggleShowDanmaku() {
        this.player.template.showDanmakuToggle.checked = !this.player.template.showDanmakuToggle.checked;
        if (this.player.template.showDanmakuToggle.checked) {
            this.showDanmaku = true;
            this.player.danmaku.show();
            this.player.template.commentButton.setAttribute('aria-label',this.player.tran('Hide danmaku'));
            this.player.template.commentButton.innerHTML = Icons.comment;
        } else {
            this.showDanmaku = false;
            this.player.danmaku.hide();
            this.player.template.commentButton.setAttribute('aria-label',this.player.tran('Show danmaku'));
            this.player.template.commentButton.innerHTML = Icons.commentOff;
        }
        this.player.user.set('danmaku', this.showDanmaku ? 1 : 0);
    }

    show() {
        this.player.controller.disableAutoHide = true;
        // this.player.template.controller.classList.add('dplayer-controller-comment');
        // this.player.template.mask.classList.add('dplayer-mask-show');
        // this.player.container.classList.add('dplayer-show-controller');
        // this.player.template.commentInput.focus();
    }

    hide() {
        // this.player.template.controller.classList.remove('dplayer-controller-comment');
        // this.player.template.mask.classList.remove('dplayer-mask-show');
        // this.player.container.classList.remove('dplayer-show-controller');
        this.player.controller.disableAutoHide = false;
        this.hideSetting();
    }

    showSetting() {
        this.player.template.commentSettingBox?.classList.add('dplayer-comment-setting-open');
    }

    hideSetting() {
        this.player.template.commentSettingBox?.classList.remove('dplayer-comment-setting-open');
    }

    toggleSetting() {
        if (this.player.template.commentSettingBox.classList.contains('dplayer-comment-setting-open')) {
            this.hideSetting();
        } else {
            this.showSetting();
        }
    }

    send() {
        this.player.template.commentInput.blur();

        // text can't be empty
        if (!this.player.template.commentInput.value.replace(/^\s+|\s+$/g, '')) {
            this.player.notice(this.player.tran('Please input danmaku content!'));
            return;
        }

        if (this.player.template.commentInput.value.length > 100) {
            this.player.notice(this.player.tran('The number of words exceeds the limit!'));
            return;
        }
        if (this.counterInter) {
            this.player.notice(this.player.tran('You send it too often!'));
        }
        else {
            this.player.template.commentSendCounter.style.display = 'inline';
            this.player.template.commentSendButton.style.display = 'none';

            this.counterInter = setInterval(() => {
                this.player.template.commentSendCounter.innerText = this.counterNum + 's';
                this.counterNum === 0 && this._clearInterval();
                this.counterNum > 0 && this.counterNum--;
            }, 1000)
            this.player.template.commentSendCounter.innerText = 5 + 's';

            this.player.danmaku.send(
                {
                    text: this.player.template.commentInput.value,
                    color: utils.color2Number(this.player.container.querySelector('.dplayer-comment-setting-color input:checked').value),
                    type: parseInt(this.player.container.querySelector('.dplayer-comment-setting-type input:checked').value),
                },
                () => {
                    // console.log('success callback');
                    this.player.template.commentInput.value = '';
                    this.player.template.commentCounter.innerText = '';
                    this.player.template.commentCounter.style.width = '0px';

                    // this.sendTimer = setTimeout(() => {
                    //     clearTimeout(this.sendTimer)
                    //     clearInterval(this.counterInter)
                    //     this.counterNum = 4
                    //     this.player.template.commentSendCounter.style.display = 'none';
                    //     this.player.template.commentSendButton.style.display = 'inline';
                    //     this.player.template.commentSendCounter.innerText = this.counterNum + 's';
                    //     this.sendTimer = false
                    // }, 5000)
                },
                () => {
                    // console.log('error callback');
                    this.player.notice(this.player.tran('Danmaku send failed'));

                    this.player.template.commentSendCounter.style.display = 'inline';
                    this.player.template.commentSendButton.style.display = 'none';

                    this._clearInterval()
                },
                () => {
                    // console.log('always callback');
                }
            );
        }
    }

    _clearInterval() {
        clearInterval(this.counterInter)
        this.counterNum = 4;
        this.player.template.commentSendCounter.style.display = 'none';
        this.player.template.commentSendButton.style.display = 'inline';
        this.player.template.commentSendCounter.innerText = this.counterNum + 's';
        this.counterInter = false;
    }
}

export default Comment;
