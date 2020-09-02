var String = (global.ContrastString || String);var Object = (global.ContrastObject || Object);var Function = (global.ContrastFunction || Function);var JSON = (global.ContrastJSON || JSON);var ContrastMethods = (global.ContrastMethods || (() => { throw new SyntaxError('ContrastMethods undefined during compilation'); })());(function (exports, require, module, __filename, __dirname) {
    "use strict";

    /**
 * @param {Object} params
 * @param {string} params.input user input string
 * @param {Object} opts
 * @param {boolean=} opts.safe are we calling the sink safely?
 * @param {boolean=} opts.noop are we calling the sink as a noop?
 */
    module.exports["redirect(path)"] = async function redirect({input}, {safe = false, noop = false} = {}) {
        if (noop)
            return { path: "http:\/\/www.example.com" };

        const path = safe ? encodeURIComponent(input) : input;

        return { path };
    };

    /**
 * @param {Object} params
 * @param {string} params.input user input string
 * @param {Object} opts
 * @param {boolean=} opts.safe are we calling the sink safely?
 * @param {boolean=} opts.noop are we calling the sink as a noop?
 */
    module.exports["redirect(status, path)"] = async function redirect({input}, {safe = false, noop = false} = {}) {
        if (noop)
            return { path: "http:\/\/www.example.com" };

        const path = safe ? encodeURIComponent(input) : input;

        return {
            status: true,
            path
        };
    };

}.apply(this, arguments));