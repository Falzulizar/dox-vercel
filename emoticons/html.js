//DOX//EMOTICONS//HTML.JS
const i = require('./icons');

module.exports = Object.fromEntries(
    Object.entries(i).map(([key, value]) => [
        key,
        `<tg-emoji emoji-id="${value.id}">${value.emoji}</tg-emoji>`
    ])
);