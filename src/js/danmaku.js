import utils from './utils';
import Icons from './icons';

class Danmaku {
    constructor(options) {
        this.options = options;
        this.container = this.options.container;
        this.danTunnel = {
            "right_to_left": {},
            "top": {},
            "bottom": {},
            "render": {},
        };
        this.danIndex = 0;
        this.dan = [];
        this.showing = true;
        this._opacity = this.options.opacity;
        this.events = this.options.events;
        this.unlimited = this.options.unlimited;
        this._range = 1;
        this._danmakuSpeed = this.options.danmakuSpeed;
        this._measure('');
        this._extraWidth = 3 + (this.options.likeEnable ? 31 : 0) + (this.options.reportEnable ? 31 : 0);

        this.load();
    }

    load() {
        let apiurl;
        if (this.options.api.maximum) {
            apiurl = `${this.options.api.address}?max=${this.options.api.maximum}`;
        } else {
            apiurl = `${this.options.api.address}`;
        }

        const endpoints = (this.options.api.addition || []).slice(0);
        endpoints.push(apiurl);
        this.events && this.events.trigger('danmaku_load_start', endpoints);

        this._readGraphQLEndPoint(endpoints, this.options.api.id, this.options.api.token, (results) => {
            this.dan = [].concat.apply([], results).sort((a, b) => a.time - b.time);
            window.requestAnimationFrame(() => {
                this.frame();
            });

            this.options.callback();

            this.events && this.events.trigger('danmaku_load_end');
        });
    }

    reload(newAPI) {
        this.options.api = newAPI;
        this.dan = [];
        this.clear();
        this.load();
    }

    /**
     * Asynchronously read danmaku from all API endpoints
     */
    _readAllEndpoints(endpoints, callback) {
        const results = [];
        let readCount = 0;

        for (let i = 0; i < endpoints.length; ++i) {
            this.options.apiBackend.read({
                url: endpoints[i],
                success: (data) => {
                    results[i] = data;

                    ++readCount;
                    if (readCount === endpoints.length) {
                        callback(results);
                    }
                },
                error: (msg) => {
                    this.options.error(msg || this.options.tran('Danmaku load failed'));
                    results[i] = [];

                    ++readCount;
                    if (readCount === endpoints.length) {
                        callback(results);
                    }
                },
            });
        }
    }

    /*
    * read from gql
    */
    _readGraphQLEndPoint(endpoints, id, token, callback) {
        const result = [];
        endpoints.map((url) => {
            url && this.options.apiBackend.read({
                url: url,
                data: {},
                success: (data) => {
                    result.push(data);
                    callback(result);
                },
                error: (msg) => {
                    this.options.error(msg || this.options.tran('Danmaku load failed'));
                    callback(result);
                }
            });
            return url;
        });
    }

    send(dan, successCallBack, errorCallBack, finallyCallBack) {
        const danmakuData = {
            id: this.options.api.id,
            time: this.options.time(),
            text: dan.text,
            color: dan.color,
            type: dan.type,
        };

        this.options.apiBackend.send({
            url: this.options.api.address,
            data: {
                "showtimeInSecond": this.options.time() + 0.01,
                "transition": utils.number2Type(danmakuData.type),
                "color": danmakuData.color,
                "body": danmakuData.text
            },
            success: (msg) => {
                successCallBack && successCallBack(msg);
                this.dan.splice(this.danIndex, 0, danmakuData);
                this.danIndex++;
                const danmaku = {
                    id: msg.data.createDanmakuText.id,
                    text: this.htmlEncode(danmakuData.text),
                    color: danmakuData.color,
                    type: danmakuData.type,
                    border: `2px solid ${this.options.borderColor}`,
                };
                this.draw(danmaku);

                this.events && this.events.trigger('danmaku_send', danmakuData);
            },
            error: (msg) => {
                errorCallBack && errorCallBack(msg);
            },
            finally: (msg) => {
                finallyCallBack && finallyCallBack(msg);
            }
        });
    }

    frame() {
        if (this.dan.length && !this.paused && this.showing) {
            let item = this.dan[this.danIndex];
            const dan = [];
            while (item && this.options.time() > parseFloat(item.time)) {
                dan.push(item);
                item = this.dan[++this.danIndex];
            }
            this.draw(dan);
        }
        window.requestAnimationFrame(() => {
            this.frame();
        });
    }

    opacity(percentage) {
        if (percentage !== undefined) {
            const items = this.container.getElementsByClassName('dplayer-danmaku-item-text');
            for (let i = 0; i < items.length; i++) {
                items[i].style.opacity = 0.9 * percentage + 0.1;
            }
            this._opacity = 0.9 * percentage + 0.1;

            this.events && this.events.trigger('danmaku_opacity', percentage);
        }
        return this._opacity;
    }

    speed(speed) {
        if (speed !== undefined) {
            const items = this.container.getElementsByClassName('dplayer-danmaku-item');
            for (let i = 0; i < items.length; i++) {
                items[i].style.animationDuration = speed + 'ms';
            }
            this._danmakuSpeed = speed;

            this.events && this.events.trigger('danmaku_speed', this._danmakuSpeed);
        }
        return this._danmakuSpeed;
    }

    range(select) {
        const range = {
            'full': 1,
            'half': 2,
            'quarter': 4,
        };
        this._range = typeof select === 'number' ? select : range[select];
        this.events && this.events.trigger('danmaku_range', this._range);
    }

    getRange() {
        const range = {
            1: 'full',
            2: 'half',
            4: 'quarter',
        };
        return range[this._range];
    }

    /**
     * Push a danmaku into DPlayer
     *
     * @param {Object Array} dan - {text, color, type}
     * text - danmaku content
     * color - danmaku color, default: `#fff`
     * type - danmaku type, `right` `top` `bottom`, default: `right`
     */
    draw(dan) {
        if (this.showing) {
            const itemHeight = this.options.height;
            const danWidth = this.container.offsetWidth;
            const danHeight = this.container.offsetHeight;
            const itemY = parseInt((danHeight / itemHeight) / this._range);

            const danItemRight = (ele) => {
                const eleWidth = ele.offsetWidth || parseInt(ele.style.width);
                const eleRight = ele.getBoundingClientRect().right || this.container.getBoundingClientRect().right + eleWidth;
                return this.container.getBoundingClientRect().right - eleRight;
            };

            const danSpeed = (width) => (danWidth + width) / 5;

            const getTunnel = (ele, type, width) => {
                const tmp = danWidth / danSpeed(width);

                for (let i = 0; this.unlimited || i < itemY; i++) {
                    const item = this.danTunnel[type][i + ''];
                    if (item && item.length) {
                        if (type !== 'right_to_left') {
                            continue;
                        }
                        for (let j = 0; j < item.length; j++) {
                            const danRight = danItemRight(item[j]) - 10;
                            if (danRight <= danWidth - tmp * danSpeed(parseInt(item[j].style.width)) || danRight <= 0) {
                                break;
                            }
                            if (j === item.length - 1) {
                                this.danTunnel[type][i + ''].push(ele);
                                ele.addEventListener('animationend', () => {
                                    this.danTunnel[type][i + ''].splice(0, 1);
                                }, false);
                                return i % itemY;
                            }
                        }
                    } else {
                        this.danTunnel[type][i + ''] = [ele];
                        ele.addEventListener('animationend', () => {
                            this.danTunnel[type][i + ''].splice(0, 1);
                        }, false);
                        return i % itemY;
                    }
                }
                return -1;
            };

            if (Object.prototype.toString.call(dan) !== '[object Array]') {
                dan = [dan];
            }

            const docFragment = document.createDocumentFragment();

            for (let i = 0; i < dan.length; i++) {
                const typeOfdan = utils.number2Type(dan[i].type);
                if (!dan[i].color) {
                    dan[i].color = 16777215;
                }
                const item = document.createElement('div');
                item.classList.add('dplayer-danmaku-item');
                item.classList.add(`dplayer-danmaku-${typeOfdan}`);
                item.setAttribute('data-id', dan[i].id);
                dan[i].iLiked && item.classList.add('iLiked');

                item.appendChild(this._renderText(dan[i]));

                // item.childNodes[0].style.opacity = this._opacity;
                item.style.color = utils.number2Color(parseInt(dan[i].color));
                item.addEventListener('animationend', () => {
                    this.container.removeChild(item);
                }, false);

                const itemWidth = this._measure(dan[i].text);
                let tunnel;

                // adjust
                switch (typeOfdan) {
                    case 'right_to_left':
                        tunnel = getTunnel(item, typeOfdan, itemWidth);
                        if (tunnel >= 0) {
                            item.style.width = itemWidth + this._extraWidth + 'px';
                            item.style.top = itemHeight * tunnel + 'px';
                            item.style.transform = `translateX(-${danWidth}px)`;
                        }
                        break;
                    case 'top':
                        tunnel = getTunnel(item, typeOfdan);
                        if (tunnel >= 0) {
                            item.style.top = itemHeight * tunnel + 'px';
                        }
                        break;
                    case 'bottom':
                        tunnel = getTunnel(item, typeOfdan);
                        if (tunnel >= 0) {
                            item.style.bottom = itemHeight * tunnel + 'px';
                        }
                        break;
                    default:
                        console.error(`Can't handled danmaku type: ${typeOfdan}`);
                }

                if (tunnel >= 0) {
                    // move
                    item.classList.add('dplayer-danmaku-move');
                    if (this.options.hoverEnable) { item.classList.add('hoverable'); }
                    item.style.animationDuration = this._danmakuSpeed + 'ms';
                    // add like & report
                    const danOp = document.createElement('div');

                    if (this.options.likeEnable) {
                        danOp.innerHTML += Icons.like;

                        danOp.addEventListener('animationend', (e) => {
                            danOp.classList.remove('ani');
                            e.stopPropagation();
                        }, false);
                        danOp.addEventListener('mouseleave', (e) => {
                            danOp.classList.remove('ani');
                            e.stopPropagation();
                        }, false);
                    }

                    if (this.options.reportEnable) {
                        danOp.innerHTML += Icons.report;
                    }

                    const like = danOp.querySelector('#icon-like');
                    like && like.addEventListener('click', (e) => {
                        this.options.apiBackend.like({
                            data: dan[i],
                            success: () => {
                                item.classList.toggle('iLiked');
                                if (item.classList.contains('iLiked')) { danOp.classList.add('ani'); }
                                dan[i].iLiked = !dan[i].iLiked;
                                item.replaceChild(this._renderText(dan[i]), item.childNodes[0]);
                            },
                            error: () => {
                                this.options.error('like failed.');
                            },
                            finally: () => { },
                        });
                        e.stopPropagation();
                    }, false);

                    const report = danOp.querySelector('#icon-report');
                    report && report.addEventListener('click', (e) => {
                        this.options.apiBackend.report(dan[i]);
                        e.stopPropagation();
                    }, false);

                    if (this.options.reportEnable || this.options.likeEnable) {
                        danOp.classList.add('dplayer-danmaku-report');
                        // insert report & like
                        item.appendChild(danOp);
                    }

                    // mobile hover fix
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                    }, false);
                    // insert dan
                    docFragment.appendChild(item);
                }
            }

            this.container.appendChild(docFragment);

            return docFragment;
        }
    }

    play() {
        this.paused = false;
    }

    pause() {
        this.paused = true;
    }

    _renderText(dan) {
        const { likes, iLiked, border, text } = dan;
        let fire;
        if (likes <= 0 || likes === undefined) { fire = 'none'; }
        else if (likes <= 50) { fire = 'xs'; }
        else if (likes <= 100) { fire = 'sm'; }
        else if (likes <= 150) { fire = 'md'; }
        else if (likes) { fire = 'lg'; }

        const node = document.createElement('span');
        node.classList.add('dplayer-danmaku-item-text');
        iLiked || node.classList.add(fire);
        border && (node.style.border = border);
        if (this.options.likeEnable) { node.innerHTML = `${text}${iLiked ? Icons.like : Icons.fire}`; }
        else { node.innerHTML = `${text}`; }
        node.style.opacity = this._opacity;

        return node;
    }

    _measure(text) {
        if (!this.context) {
            const measureStyle = getComputedStyle(this.container.getElementsByClassName('dplayer-danmaku-item')[0], null);
            this.context = document.createElement('canvas').getContext('2d');
            this.context.font = measureStyle.getPropertyValue('font');
        }
        return this.context.measureText(text).width;
    }
    /**
     * MARK: Seek video
     */
    seek() {
        this.clear();
        for (let i = 0; i < this.dan.length; i++) {
            if (this.dan[i].time >= this.options.time()) {
                this.danIndex = i;
                break;
            }
            this.danIndex = this.dan.length;
        }
    }

    clear() {
        this.danTunnel = {
            "right_to_left": {},
            "top": {},
            "bottom": {},
        };
        this.danIndex = 0;
        this.options.container.innerHTML = '';

        this.events && this.events.trigger('danmaku_clear');
    }

    htmlEncode(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2f;');
    }

    resize() {
        const danWidth = this.container.offsetWidth;
        const items = this.container.getElementsByClassName('dplayer-danmaku-item');
        for (let i = 0; i < items.length; i++) {
            items[i].style.transform = `translateX(-${danWidth}px)`;
        }
    }

    hide() {
        this.showing = false;
        this.pause();
        this.clear();

        this.events && this.events.trigger('danmaku_hide');
    }

    show() {
        this.seek();
        this.showing = true;
        this.play();

        this.events && this.events.trigger('danmaku_show');
    }

    unlimit(boolean) {
        this.unlimited = boolean;
    }
}

export default Danmaku;
