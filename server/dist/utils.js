"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tick = () => new Promise(resolve => setImmediate(resolve));
exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Redirect with push (nginx)
exports.redirect = (res, code, url) => {
    if (!url.startsWith("http"))
        res.setHeader("Link", `<${url}>;rel=preload;as=document`);
    res.redirect(code, url);
};
//# sourceMappingURL=utils.js.map