// //DOX//EMOTICONS//BUTTON.JS
const i = require('./icons');

const STYLE = {
      default: {},
      primary: { style: "primary" },
      success: { style: "success" },
      danger: { style: "danger" }
};

function button(icon, text, callback, style = "default") {
    return {
        text,
        callback_data: callback,
        icon_custom_emoji_id: i[icon].id,
        ...(STYLE[style] || STYLE.default)
    };
}

function urlbutton(icon, text, url, style = "default") {
    return {
        text,
        url,
        icon_custom_emoji_id: i[icon].id,
        ...(STYLE[style] || STYLE.default)
    };
}

function toggle(unactiveText, activeText, active, callback, activeStyle = "default", unactiveStyle = "default") {
    return {
        text: active ? activeText : unactiveText,
        callback_data: callback,
        ...(active
            ? (STYLE[activeStyle] || STYLE.default)
            : (STYLE[unactiveStyle] || STYLE.default))
    };
}

module.exports = { button, urlbutton, toggle };

