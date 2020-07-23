import axios from 'axios';

export default {
    send: (options) => {
        console.log(options.data)
        fetch('https://qa.sendawish.net/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Headers': '*'
            },
            mode: 'cors',
            body: JSON.stringify({
                query: `
                mutation ($input: DanmakuTextInput!) {
                    createDanmakuText(input: $input) {
                        id
                        showtimeInSecond
                        transition
                        color
                        creator {
                            id
                            fullname
                        }
                        body
                    }
                }`,
                variables: {
                    "input": options.data
                }
            }),
        })
            .then(res => res.json())
            .then(res => {
                console.log('AL: res', res)
            })
            .catch(err => {
                console.error(err);
                options.error && options.error();
            });
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
                query: `
                query danmakuQuery($id: String!, $token: String!) {
                    thingInvite(id: $id, token: $token) {
                        id
                        danmakus {
                            id
                            showtimeInSecond
                            transition
                            color
                            body
                            creator {
                                id
                                email
                                fullname
                            }
                        }
                    }
                }`,
                variables: {
                    ...options.data
                }
            }),
        })
            .then(res => res.json())
            .then(res => {
                options.success && options.success(
                    res.data.thingInvite.danmakus.map(d =>
                        ({
                            time: d.showtimeInSecond,
                            type: d.transition,
                            color: d.color,
                            author: d.creator.id,
                            text: d.body,
                        })
                    )
                )
            })
            .catch(err => {
                console.error(err);
                options.error && options.error();
            });
    },
};