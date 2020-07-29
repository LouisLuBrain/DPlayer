import axios from 'axios';
import options from './options';
import { resolve, reject } from 'promise-polyfill';

export default {
    send: (options) => {
        fetch('https://qa.sendawish.net/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Headers': '*'
            },
            mode: 'cors',
            body: JSON.stringify({
                query: "mutation ($input: DanmakuTextInput!) { createDanmakuText(input: $input) { id showtimeInSecond transition color creator { id fullname } body } }",
                variables: {
                    "input": options.data
                }
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                options.success && options.success(res);
            })
            .catch((err) => {
                options.error && options.error(err);
            })
            .finally((msg) => {
                options.finally && options.finally(msg);
            })
    },

    read: (options) => {
        fetch(options.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Headers': '*'
            },
            mode: 'cors',
            body: JSON.stringify({
                query: "query danmakuQuery($id: String!, $token: String!) { thingInvite(id: $id, token: $token) { id danmakus { id showtimeInSecond transition color body creator { id email fullname } } } }",
                variables: {
                    ...options.data
                }
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                options.success && options.success(
                    res.data.thingInvite.danmakus.map((d) =>
                        ({
                            time: d.showtimeInSecond,
                            type: d.transition,
                            color: d.color,
                            author: d.creator.id,
                            text: d.body,
                        })
                    )
                );
            })
            .catch((err) => {
                options.error && options.error(err);
            });
    },

    readResponse: (options) => {
        fetch(options.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Headers': '*'
            },
            mode: 'cors',
            body: JSON.stringify({
                query: "query wishDanmaku($wishIds: [String!]){ wishes(wishIds: $wishIds) { id danmakus { id showtimeInSecond transition color body creator { id email fullname } } } }",
                variables: {
                    ...options.data
                }
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                options.success && options.success(
                    res.data.wishes[0].danmakus.map((d) =>
                        ({
                            time: d.showtimeInSecond,
                            type: d.transition,
                            color: d.color,
                            author: d.creator.id,
                            text: d.body,
                        })
                    )
                );
            })
            .catch((err) => {
                options.error && options.error(err);
            });
    },

    report: (options) => {
        return new Promise((resolve,reject) => {
            options.flag ? resolve('We will handle your report as soon as possible.') : reject('something went wrong, please try again.')
        })
            .then((res) => {
                options.success && options.success(res)
            })
            .catch((err) => {
                options.error && options.error(err);
            })
            .finally((msg) => {
                options.finally && options.finally(msg);
            })
    }
};