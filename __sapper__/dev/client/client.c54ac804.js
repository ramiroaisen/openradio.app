function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if (typeof $$scope.dirty === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function claim_element(nodes, name, attributes, svg) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeName === name) {
            let j = 0;
            while (j < node.attributes.length) {
                const attribute = node.attributes[j];
                if (attributes[attribute.name]) {
                    j++;
                }
                else {
                    node.removeAttribute(attribute.name);
                }
            }
            return nodes.splice(i, 1)[0];
        }
    }
    return svg ? svg_element(name) : element(name);
}
function claim_text(nodes, data) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeType === 3) {
            node.data = '' + data;
            return nodes.splice(i, 1)[0];
        }
    }
    return text(data);
}
function claim_space(nodes) {
    return claim_text(nodes, ' ');
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function add_resize_listener(element, fn) {
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    const object = document.createElement('object');
    object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
    object.setAttribute('aria-hidden', 'true');
    object.type = 'text/html';
    object.tabIndex = -1;
    let win;
    object.onload = () => {
        win = object.contentDocument.defaultView;
        win.addEventListener('resize', fn);
    };
    if (/Trident/.test(navigator.userAgent)) {
        element.appendChild(object);
        object.data = 'about:blank';
    }
    else {
        object.data = 'about:blank';
        element.appendChild(object);
    }
    return {
        cancel: () => {
            win && win.removeEventListener && win.removeEventListener('resize', fn);
            element.removeChild(object);
        }
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
function query_selector_all(selector, parent = document.body) {
    return Array.from(parent.querySelectorAll(selector));
}

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
}

function create_animation(node, from, fn, params) {
    if (!from)
        return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
        return noop;
    const { delay = 0, duration = 300, easing = identity, 
    // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
    start: start_time = now() + delay, 
    // @ts-ignore todo:
    end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
    let running = true;
    let started = false;
    let name;
    function start() {
        if (css) {
            name = create_rule(node, 0, 1, duration, delay, easing, css);
        }
        if (!delay) {
            started = true;
        }
    }
    function stop() {
        if (css)
            delete_rule(node, name);
        running = false;
    }
    loop(now => {
        if (!started && now >= start_time) {
            started = true;
        }
        if (started && now >= end) {
            tick(1, 0);
            stop();
        }
        if (!running) {
            return false;
        }
        if (started) {
            const p = now - start_time;
            const t = 0 + 1 * easing(p / duration);
            tick(t, 1 - t);
        }
        return true;
    });
    start();
    tick(0, 1);
    return stop;
}
function fix_position(node) {
    const style = getComputedStyle(node);
    if (style.position !== 'absolute' && style.position !== 'fixed') {
        const { width, height } = style;
        const a = node.getBoundingClientRect();
        node.style.position = 'absolute';
        node.style.width = width;
        node.style.height = height;
        add_transform(node, a);
    }
}
function add_transform(node, a) {
    const b = node.getBoundingClientRect();
    if (a.left !== b.left || a.top !== b.top) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined' ? window : global);
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = new Set();
    for (let i = 0; i < list.length; i++) {
        const key = get_key(get_context(ctx, list, i));
        if (keys.has(key)) {
            throw new Error(`Cannot have duplicate keys in a keyed each`);
        }
        keys.add(key);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

const preload = () => ({});

/* src/Components/CountryFlag.svelte generated by Svelte v3.18.2 */

const file = "src/Components/CountryFlag.svelte";

function create_fragment(ctx) {
	let img;
	let img_src_value;

	const block = {
		c: function create() {
			img = element("img");
			this.h();
		},
		l: function claim(nodes) {
			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
			this.h();
		},
		h: function hydrate() {
			if (img.src !== (img_src_value = /*legacy*/ ctx[1])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", /*countryCode*/ ctx[0]);
			attr_dev(img, "class", "svelte-1neb7v0");
			add_location(img, file, 17, 0, 374);
		},
		m: function mount(target, anchor) {
			insert_dev(target, img, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*countryCode*/ 1) {
				attr_dev(img, "alt", /*countryCode*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(img);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { size } = $$props;
	let { style = "shiny" } = $$props; // or flat
	let { countryCode } = $$props;
	const legacy = `/static/img/countryflags/legacy/${style}.${countryCode}.${size}.png`;
	const writable_props = ["size", "style", "countryCode"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CountryFlag> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(2, size = $$props.size);
		if ("style" in $$props) $$invalidate(3, style = $$props.style);
		if ("countryCode" in $$props) $$invalidate(0, countryCode = $$props.countryCode);
	};

	$$self.$capture_state = () => {
		return { size, style, countryCode };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(2, size = $$props.size);
		if ("style" in $$props) $$invalidate(3, style = $$props.style);
		if ("countryCode" in $$props) $$invalidate(0, countryCode = $$props.countryCode);
	};

	return [countryCode, legacy, size, style];
}

class CountryFlag extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { size: 2, style: 3, countryCode: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "CountryFlag",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*size*/ ctx[2] === undefined && !("size" in props)) {
			console.warn("<CountryFlag> was created without expected prop 'size'");
		}

		if (/*countryCode*/ ctx[0] === undefined && !("countryCode" in props)) {
			console.warn("<CountryFlag> was created without expected prop 'countryCode'");
		}
	}

	get size() {
		throw new Error("<CountryFlag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<CountryFlag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get style() {
		throw new Error("<CountryFlag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set style(value) {
		throw new Error("<CountryFlag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get countryCode() {
		throw new Error("<CountryFlag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set countryCode(value) {
		throw new Error("<CountryFlag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var stringFormat = createCommonjsModule(function (module) {
void function(global) {

  //  ValueError :: String -> Error
  function ValueError(message) {
    var err = new Error(message);
    err.name = 'ValueError';
    return err;
  }

  //  create :: Object -> String,*... -> String
  function create(transformers) {
    return function(template) {
      var args = Array.prototype.slice.call(arguments, 1);
      var idx = 0;
      var state = 'UNDEFINED';

      return template.replace(
        /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
        function(match, literal, _key, xf) {
          if (literal != null) {
            return literal;
          }
          var key = _key;
          if (key.length > 0) {
            if (state === 'IMPLICIT') {
              throw ValueError('cannot switch from ' +
                               'implicit to explicit numbering');
            }
            state = 'EXPLICIT';
          } else {
            if (state === 'EXPLICIT') {
              throw ValueError('cannot switch from ' +
                               'explicit to implicit numbering');
            }
            state = 'IMPLICIT';
            key = String(idx);
            idx += 1;
          }

          //  1.  Split the key into a lookup path.
          //  2.  If the first path component is not an index, prepend '0'.
          //  3.  Reduce the lookup path to a single result. If the lookup
          //      succeeds the result is a singleton array containing the
          //      value at the lookup path; otherwise the result is [].
          //  4.  Unwrap the result by reducing with '' as the default value.
          var path = key.split('.');
          var value = (/^\d+$/.test(path[0]) ? path : ['0'].concat(path))
            .reduce(function(maybe, key) {
              return maybe.reduce(function(_, x) {
                return x != null && key in Object(x) ?
                  [typeof x[key] === 'function' ? x[key]() : x[key]] :
                  [];
              }, []);
            }, [args])
            .reduce(function(_, x) { return x; }, '');

          if (xf == null) {
            return value;
          } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
            return transformers[xf](value);
          } else {
            throw ValueError('no transformer named "' + xf + '"');
          }
        }
      );
    };
  }

  //  format :: String,*... -> String
  var format = create({});

  //  format.create :: Object -> String,*... -> String
  format.create = create;

  //  format.extend :: Object,Object -> ()
  format.extend = function(prototype, transformers) {
    var $format = create(transformers);
    prototype.format = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this);
      return $format.apply(global, args);
    };
  };

  /* istanbul ignore else */
  {
    module.exports = format;
  }

}.call(commonjsGlobal, commonjsGlobal);
});

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isobject = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

/*!
 * get-value <https://github.com/jonschlinkert/get-value>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */



var getValue = function(target, path, options) {
  if (!isobject(options)) {
    options = { default: options };
  }

  if (!isValidObject(target)) {
    return typeof options.default !== 'undefined' ? options.default : target;
  }

  if (typeof path === 'number') {
    path = String(path);
  }

  const isArray = Array.isArray(path);
  const isString = typeof path === 'string';
  const splitChar = options.separator || '.';
  const joinChar = options.joinChar || (typeof splitChar === 'string' ? splitChar : '.');

  if (!isString && !isArray) {
    return target;
  }

  if (isString && path in target) {
    return isValid(path, target, options) ? target[path] : options.default;
  }

  let segs = isArray ? path : split(path, splitChar, options);
  let len = segs.length;
  let idx = 0;

  do {
    let prop = segs[idx];
    if (typeof prop === 'number') {
      prop = String(prop);
    }

    while (prop && prop.slice(-1) === '\\') {
      prop = join([prop.slice(0, -1), segs[++idx] || ''], joinChar, options);
    }

    if (prop in target) {
      if (!isValid(prop, target, options)) {
        return options.default;
      }

      target = target[prop];
    } else {
      let hasProp = false;
      let n = idx + 1;

      while (n < len) {
        prop = join([prop, segs[n++]], joinChar, options);

        if ((hasProp = prop in target)) {
          if (!isValid(prop, target, options)) {
            return options.default;
          }

          target = target[prop];
          idx = n - 1;
          break;
        }
      }

      if (!hasProp) {
        return options.default;
      }
    }
  } while (++idx < len && isValidObject(target));

  if (idx === len) {
    return target;
  }

  return options.default;
};

function join(segs, joinChar, options) {
  if (typeof options.join === 'function') {
    return options.join(segs);
  }
  return segs[0] + joinChar + segs[1];
}

function split(path, splitChar, options) {
  if (typeof options.split === 'function') {
    return options.split(path);
  }
  return path.split(splitChar);
}

function isValid(key, target, options) {
  if (typeof options.isValid === 'function') {
    return options.isValid(key, target);
  }
  return true;
}

function isValidObject(val) {
  return isobject(val) || Array.isArray(val) || typeof val === 'function';
}

var ar = {
	code: "ar",
	native: "اللغة العربية",
	en: "Arabic"
};
var az = {
	code: "az",
	native: "azərbaycan dili",
	en: "Azerbaijani"
};
var be = {
	code: "be",
	native: "беларуская мова",
	en: "Belarusian"
};
var bg = {
	code: "bg",
	native: "български език",
	en: "Bulgarian"
};
var bs = {
	code: "bs",
	native: "bosanski jezik",
	en: "Bosnian"
};
var ca = {
	code: "ca",
	native: "català",
	en: "Catalan"
};
var cs = {
	code: "cs",
	native: "čeština",
	en: "Czech"
};
var da = {
	code: "da",
	native: "dansk",
	en: "Danish"
};
var de = {
	code: "de",
	native: "Deutsch",
	en: "German"
};
var el = {
	code: "el",
	native: "Ελληνικά",
	en: "Greek"
};
var en = {
	code: "en",
	native: "English",
	en: "English"
};
var es = {
	code: "es",
	native: "Español",
	en: "Spanish"
};
var et = {
	code: "et",
	native: "eesti",
	en: "Estonian"
};
var fa = {
	code: "fa",
	native: "فارسی",
	en: "Persian"
};
var fi = {
	code: "fi",
	native: "suomi",
	en: "Finnish"
};
var fr = {
	code: "fr",
	native: "Français",
	en: "French"
};
var he = {
	code: "he",
	native: "עברית",
	en: "Hebrew"
};
var hr = {
	code: "hr",
	native: "hrvatski jezik",
	en: "Croatian"
};
var hu = {
	code: "hu",
	native: "magyar",
	en: "Hungarian"
};
var hy = {
	code: "hy",
	native: "Հայերեն",
	en: "Armenian"
};
var id = {
	code: "id",
	native: "Indonesian",
	en: "Indonesian"
};
var it = {
	code: "it",
	native: "Italiano",
	en: "Italian"
};
var ja = {
	code: "ja",
	native: "日本語",
	en: "Japanese"
};
var ka = {
	code: "ka",
	native: "ქართული",
	en: "Georgian"
};
var kk = {
	code: "kk",
	native: "қазақ тілі",
	en: "Kazakh"
};
var ko = {
	code: "ko",
	native: "한국어",
	en: "Korean"
};
var ky = {
	code: "ky",
	native: "Кыргызча",
	en: "Kyrgyz"
};
var lt = {
	code: "lt",
	native: "lietuvių kalba",
	en: "Lithuanian"
};
var lv = {
	code: "lv",
	native: "latviešu valoda",
	en: "Latvian"
};
var mk = {
	code: "mk",
	native: "македонски јазик",
	en: "Macedonian"
};
var mn = {
	code: "mn",
	native: "Монгол хэл",
	en: "Mongolian"
};
var nb = {
	code: "nb",
	native: "Norsk bokmål",
	en: "Norwegian Bokmål"
};
var nl = {
	code: "nl",
	native: "Nederlands",
	en: "Dutch"
};
var nn = {
	code: "nn",
	native: "Norsk nynorsk",
	en: "Norwegian Nynorsk"
};
var pl = {
	code: "pl",
	native: "język polski",
	en: "Polish"
};
var pt = {
	code: "pt",
	native: "Português",
	en: "Portuguese"
};
var ro = {
	code: "ro",
	native: "Română",
	en: "Romanian"
};
var ru = {
	code: "ru",
	native: "Русский",
	en: "Russian"
};
var sk = {
	code: "sk",
	native: "slovenčina",
	en: "Slovak"
};
var sl = {
	code: "sl",
	native: "slovenski jezik",
	en: "Slovene"
};
var sr = {
	code: "sr",
	native: "српски језик",
	en: "Serbian"
};
var sv = {
	code: "sv",
	native: "svenska",
	en: "Swedish"
};
var th = {
	code: "th",
	native: "ไทย",
	en: "Thai"
};
var tr = {
	code: "tr",
	native: "Türkçe",
	en: "Turkish"
};
var uk = {
	code: "uk",
	native: "Українська",
	en: "Ukrainian"
};
var ur = {
	code: "ur",
	native: "اردو",
	en: "Urdu"
};
var uz = {
	code: "uz",
	native: "Ўзбек",
	en: "Uzbek"
};
var vi = {
	code: "vi",
	native: "Tiếng Việt",
	en: "Vietnamese"
};
var zh = {
	code: "zh",
	native: "中文",
	en: "Chinese"
};
var map = {
	ar: ar,
	az: az,
	be: be,
	bg: bg,
	bs: bs,
	ca: ca,
	cs: cs,
	da: da,
	de: de,
	el: el,
	en: en,
	es: es,
	et: et,
	fa: fa,
	fi: fi,
	fr: fr,
	he: he,
	hr: hr,
	hu: hu,
	hy: hy,
	id: id,
	it: it,
	ja: ja,
	ka: ka,
	kk: kk,
	ko: ko,
	ky: ky,
	lt: lt,
	lv: lv,
	mk: mk,
	mn: mn,
	nb: nb,
	nl: nl,
	nn: nn,
	pl: pl,
	pt: pt,
	ro: ro,
	ru: ru,
	sk: sk,
	sl: sl,
	sr: sr,
	sv: sv,
	th: th,
	tr: tr,
	uk: uk,
	ur: ur,
	uz: uz,
	vi: vi,
	zh: zh
};

const notFoundKeys = new Set();

const formatter = locale => (key, params = {}) => {
  //console.log(locale.lang, key);
  const o = getValue(locale, key);
  
  if(typeof o !== "string"){
    if(!notFoundKeys.has()){
      notFoundKeys.add(key);
      console.log("[$trans] key not found:" + JSON.stringify(key));
    }
    return key;
  }

  return stringFormat(o, params);
};

// return always the same stores for the same session
// instead of creating new stores every time
const memo = new WeakMap();

const stores = () => {
  const { page, session } = stores$1$1();
  
  if(memo.has(session))
    return memo.get(session);
  
  const $session = get_store_value(session);
  const $page = get_store_value(page);
  
  const $lang = $session.lang;
  const $trans = formatter($session.locale);

  const $countryCode = $page.params.langCountry && $page.params.langCountry.split("-")[1];
  const countryCode = writable($countryCode);

  const $country = $session.country;

  const cache = {
    trans: {[$lang]: $trans},
    countries: $countryCode && $country ? {[$countryCode]: $country} : {},
  };

  const lang = writable($lang);

  const trans = readable($trans, set => {
    lang.subscribe(async $lang => {
      if(cache.trans.hasOwnProperty($lang))
        set(cache.trans[$lang]);
      else {
        // never run in server
        console.log("loading locale ", $lang);
        const res = await fetch(`/i18n/locales/${$lang}.json`);
        const locale = await res.json();
        const $trans = formatter(locale);
        cache[$lang] = $trans;
        set($trans);
        console.log("setted $trans", $lang);
      }
    });
  });
  
  page.subscribe($page => {
    if($page.params.lang){
      if(map.hasOwnProperty($page.params.lang)){
        lang.set($page.params.lang);
        countryCode.set(null);
      }
    } else if($page.params.langCountry) {
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      if(map.hasOwnProperty($lang)){
        lang.set($lang);
      }
      countryCode.set($countryCode);
    }
  });


  const country = writable($country);
  countryCode.subscribe(async $countryCode => {
    if(!$countryCode){
      country.set(null);
    } else if(cache.countries.hasOwnProperty($countryCode)){
      country.set(cache.countries[$countryCode]);
    } else {
      // client side only
      const $country = await fetch(`/api/countries/${$countryCode}`).then(res => res.json());
      cache.countries[$countryCode] = $country;
      country.set($country);
    }
  });


  const helper = {lang, trans, countryCode, country};

  memo.set(session, helper);

  return helper;
};

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

const defs = {
  delay: 0,
  duration: 400,
  easing: cubicOut
};

const commonStyle = "position: relative; z-index: -1;"; 


const flyRight = (node, params = {}) => {
  const {easing, duration, delay} = {...defs, ...params};
  const width = node.clientWidth;
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const marginLeft = parseFloat(style.marginLeft);
  const marginRight = parseFloat(style.marginRight);
  
  const total = width + marginRight + marginLeft;

  const css = (t, u) => `
    ${commonStyle}
    margin-left: ${marginLeft - total * u}px; 
    opacity: ${t * opacity};`;
  
  return {
    easing,
    duration,
    delay,
    css
  }
};

const canonical = url => `https://openradio.app${url}`; 

const indexUrl = ({lang}) => `/${lang}`;

const countryUrl = ({lang, countryCode}) => `/${lang}-${countryCode}`;

const searchActionUrl = ({lang, countryCode}) => {
  return (
    countryCode ? 
      countryUrl({lang, countryCode}) :
      indexUrl({lang})
    ) + "/search";
};

const searchUrl = ({lang, countryCode, q}) => searchActionUrl({lang, countryCode}) + "?q=" + encodeURIComponent(q);

const stationUrl = ({lang, station}) => countryUrl({lang, countryCode: station.countryCode}) + "/radio/" + station.slug;

const stationImgUrl = (size, station) => station.origin != "mt" ? [
  `/static/img/stations/rw/webp/${size}/${station.countryCode}.${station.slug}.png.webp`,
  `/static/img/stations/rw/png/${size}/${station.countryCode}.${station.slug}.png`
] : [
  `/static/img/stations/mt/webp/${size}/${station.mt.img.lt}.webp`,
  `/static/img/stations/mt/jpg/${size}/${station.mt.img.lt}.jpg`,
];

const langsUrl = ({lang}) => indexUrl({lang}) + "/languages";

const recentsUrl = ({lang}) => indexUrl({lang}) + "/recents";

const signalListUrl = ({lang, countryCode, type}) => {
  return (countryCode ? countryUrl({lang, countryCode}) : indexUrl({lang}))
         + "/radio-" + type;
};

const signalUrl = ({lang, countryCode, type, frec}) => {
  return signalListUrl({lang, countryCode, type}) + "/" + frec;
};

/* src/Components/TopbarTitle.svelte generated by Svelte v3.18.2 */
const file$1 = "src/Components/TopbarTitle.svelte";

// (53:2) {#if $countryCode}
function create_if_block(ctx) {
	let a;
	let a_href_value;
	let a_title_value;
	let a_transition;
	let current;

	const countryflag = new CountryFlag({
			props: {
				size: 24,
				countryCode: /*$countryCode*/ ctx[0]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			a = element("a");
			create_component(countryflag.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			a = claim_element(nodes, "A", { class: true, href: true, title: true });
			var a_nodes = children(a);
			claim_component(countryflag.$$.fragment, a_nodes);
			a_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(a, "class", "no-a svelte-1o1khzl");

			attr_dev(a, "href", a_href_value = countryUrl({
				lang: /*$lang*/ ctx[1],
				countryCode: /*$countryCode*/ ctx[0]
			}));

			attr_dev(a, "title", a_title_value = /*$trans*/ ctx[2](`countries.${/*$countryCode*/ ctx[0]}`));
			add_location(a, file$1, 53, 4, 844);
		},
		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			mount_component(countryflag, a, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const countryflag_changes = {};
			if (dirty & /*$countryCode*/ 1) countryflag_changes.countryCode = /*$countryCode*/ ctx[0];
			countryflag.$set(countryflag_changes);

			if (!current || dirty & /*$lang, $countryCode*/ 3 && a_href_value !== (a_href_value = countryUrl({
				lang: /*$lang*/ ctx[1],
				countryCode: /*$countryCode*/ ctx[0]
			}))) {
				attr_dev(a, "href", a_href_value);
			}

			if (!current || dirty & /*$trans, $countryCode*/ 5 && a_title_value !== (a_title_value = /*$trans*/ ctx[2](`countries.${/*$countryCode*/ ctx[0]}`))) {
				attr_dev(a, "title", a_title_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(countryflag.$$.fragment, local);

			if (local) {
				add_render_callback(() => {
					if (!a_transition) a_transition = create_bidirectional_transition(a, flyRight, {}, true);
					a_transition.run(1);
				});
			}

			current = true;
		},
		o: function outro(local) {
			transition_out(countryflag.$$.fragment, local);

			if (local) {
				if (!a_transition) a_transition = create_bidirectional_transition(a, flyRight, {}, false);
				a_transition.run(0);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			destroy_component(countryflag);
			if (detaching && a_transition) a_transition.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(53:2) {#if $countryCode}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let div;
	let t0;
	let a;
	let t1;
	let span;
	let t2;
	let a_href_value;
	let current;
	let if_block = /*$countryCode*/ ctx[0] && create_if_block(ctx);

	const block = {
		c: function create() {
			div = element("div");
			if (if_block) if_block.c();
			t0 = space();
			a = element("a");
			t1 = text("openradio");
			span = element("span");
			t2 = text(".app");
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true });
			var div_nodes = children(div);
			if (if_block) if_block.l(div_nodes);
			t0 = claim_space(div_nodes);
			a = claim_element(div_nodes, "A", { class: true, href: true });
			var a_nodes = children(a);
			t1 = claim_text(a_nodes, "openradio");
			span = claim_element(a_nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			t2 = claim_text(span_nodes, ".app");
			span_nodes.forEach(detach_dev);
			a_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "lite svelte-1o1khzl");
			add_location(span, file$1, 57, 58, 1130);
			attr_dev(a, "class", "no-a svelte-1o1khzl");
			attr_dev(a, "href", a_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }));
			add_location(a, file$1, 57, 2, 1074);
			attr_dev(div, "class", "topbar-title svelte-1o1khzl");
			add_location(div, file$1, 51, 0, 792);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append_dev(div, t0);
			append_dev(div, a);
			append_dev(a, t1);
			append_dev(a, span);
			append_dev(span, t2);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$countryCode*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, t0);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (!current || dirty & /*$lang*/ 2 && a_href_value !== (a_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }))) {
				attr_dev(a, "href", a_href_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block) if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let $countryCode;
	let $lang;
	let $trans;
	const { trans, lang, countryCode } = stores();
	validate_store(trans, "trans");
	component_subscribe($$self, trans, value => $$invalidate(2, $trans = value));
	validate_store(lang, "lang");
	component_subscribe($$self, lang, value => $$invalidate(1, $lang = value));
	validate_store(countryCode, "countryCode");
	component_subscribe($$self, countryCode, value => $$invalidate(0, $countryCode = value));

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		if ("$countryCode" in $$props) countryCode.set($countryCode = $$props.$countryCode);
		if ("$lang" in $$props) lang.set($lang = $$props.$lang);
		if ("$trans" in $$props) trans.set($trans = $$props.$trans);
	};

	return [$countryCode, $lang, $trans, trans, lang, countryCode];
}

class TopbarTitle extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "TopbarTitle",
			options,
			id: create_fragment$1.name
		});
	}
}

function fade(node, { delay = 0, duration = 400, easing = identity }) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}

const playerState = writable({});

function store(key, value){
  
  const _get = () => {
    const json = localStorage.getItem(key);
    if(json != null){
      return JSON.parse(json);
    } else {
      return null;
    }
  };

  const _set = (value) => localStorage.setItem(key, JSON.stringify(value));

  let current = _get();
  
  if(current == null){
    _set(value);
    current = value;
  }

  const store = writable(current);

  const set = (newValue) => {
    current = newValue;
    _set(newValue);
    store.set(newValue);
  };

  const update = (callback) => set(callback(current));

  const get = () => current;

  const subscribe = (...args) => store.subscribe(...args);

  window.addEventListener("storage", (event) => {
    if(event.key !== key) return;
    current = JSON.parse(event.newValue);
    store.set(current);
  });

  return {get, set, update, subscribe, key}
}

let recentList;

{
  recentList = store("recent-stations-v1", []);
}

/* src/Components/Slider.svelte generated by Svelte v3.18.2 */

const file$2 = "src/Components/Slider.svelte";

function create_fragment$2(ctx) {
	let div1;
	let div0;
	let dispose;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true, style: true });
			children(div0).forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "thumb svelte-gvsne5");
			set_style(div0, "left", /*value*/ ctx[0] * 100 + "%");
			add_location(div0, file$2, 49, 2, 1169);
			attr_dev(div1, "class", "slider svelte-gvsne5");
			add_location(div1, file$2, 48, 0, 1084);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			/*div1_binding*/ ctx[3](div1);
			dispose = listen_dev(div1, "pointerdown", prevent_default(/*handleDown*/ ctx[2]), false, true, false);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*value*/ 1) {
				set_style(div0, "left", /*value*/ ctx[0] * 100 + "%");
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			/*div1_binding*/ ctx[3](null);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { value = 0 } = $$props;
	let slider;

	const handleDown = event => {
		const handleEnd = event => {
			document.removeEventListener("pointercancel", handleEnd);
			document.removeEventListener("pointerup", handleEnd);
			document.removeEventListener("pointermove", handleMove);
		};

		const handleMove = event => {
			const rect = slider.getBoundingClientRect();
			$$invalidate(0, value = Math.max(0, Math.min(1, (event.x - rect.x) / rect.width)));
		};

		document.addEventListener("pointermove", handleMove);
		document.addEventListener("pointercancel", handleEnd);
		document.addEventListener("pointerup", handleEnd);
		handleMove(event);
	};

	const writable_props = ["value"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(1, slider = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
	};

	$$self.$capture_state = () => {
		return { value, slider };
	};

	$$self.$inject_state = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("slider" in $$props) $$invalidate(1, slider = $$props.slider);
	};

	return [value, slider, handleDown, div1_binding];
}

class Slider extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Slider",
			options,
			id: create_fragment$2.name
		});
	}

	get value() {
		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/VolumeOff.svelte generated by Svelte v3.18.2 */

const file$3 = "node_modules/svelte-material-icons/VolumeOff.svelte";

function create_fragment$3(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$3, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$3, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VolumeOff> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class VolumeOff extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "VolumeOff",
			options,
			id: create_fragment$3.name
		});
	}

	get size() {
		throw new Error("<VolumeOff>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<VolumeOff>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<VolumeOff>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<VolumeOff>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<VolumeOff>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<VolumeOff>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<VolumeOff>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<VolumeOff>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<VolumeOff>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<VolumeOff>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons-0/dist/VolumeUp.svelte generated by Svelte v3.18.2 */

const file$4 = "node_modules/svelte-material-icons-0/dist/VolumeUp.svelte";

function create_fragment$4(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					xmlns: true,
					viewBox: true,
					width: true,
					height: true,
					fill: true,
					stroke: true
				},
				1
			);

			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z");
			add_location(path, file$4, 9, 83, 300);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "fill", /*fill*/ ctx[2]);
			attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			add_location(svg, file$4, 9, 0, 217);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*viewBox*/ 16) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*fill*/ 4) {
				attr_dev(svg, "fill", /*fill*/ ctx[2]);
			}

			if (dirty & /*stroke*/ 8) {
				attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { size = "1.5em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { fill = color } = $$props;
	let { stroke = color } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "fill", "stroke", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VolumeUp> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return {
			size,
			width,
			height,
			color,
			fill,
			stroke,
			viewBox
		};
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	return [width, height, fill, stroke, viewBox, size, color];
}

class VolumeUp extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			size: 5,
			width: 0,
			height: 1,
			color: 6,
			fill: 2,
			stroke: 3,
			viewBox: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "VolumeUp",
			options,
			id: create_fragment$4.name
		});
	}

	get size() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get fill() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set fill(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get stroke() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stroke(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<VolumeUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<VolumeUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Volume.svelte generated by Svelte v3.18.2 */
const file$5 = "src/Components/Volume.svelte";

// (70:4) {:else}
function create_else_block(ctx) {
	let current;

	const volumeup = new VolumeUp({
			props: { size: /*size*/ ctx[1] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(volumeup.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(volumeup.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(volumeup, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const volumeup_changes = {};
			if (dirty & /*size*/ 2) volumeup_changes.size = /*size*/ ctx[1];
			volumeup.$set(volumeup_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(volumeup.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(volumeup.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(volumeup, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(70:4) {:else}",
		ctx
	});

	return block;
}

// (68:4) {#if volume === 0}
function create_if_block$1(ctx) {
	let current;

	const volumeoff = new VolumeOff({
			props: { size: /*size*/ ctx[1] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(volumeoff.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(volumeoff.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(volumeoff, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const volumeoff_changes = {};
			if (dirty & /*size*/ 2) volumeoff_changes.size = /*size*/ ctx[1];
			volumeoff.$set(volumeoff_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(volumeoff.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(volumeoff.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(volumeoff, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(68:4) {#if volume === 0}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let div3;
	let div0;
	let updating_value;
	let t0;
	let div1;
	let t1;
	let div2;
	let current_block_type_index;
	let if_block;
	let current;
	let dispose;

	function slider_value_binding(value) {
		/*slider_value_binding*/ ctx[4].call(null, value);
	}

	let slider_props = {};

	if (/*volume*/ ctx[0] !== void 0) {
		slider_props.value = /*volume*/ ctx[0];
	}

	const slider = new Slider({ props: slider_props, $$inline: true });
	binding_callbacks.push(() => bind(slider, "value", slider_value_binding));
	const if_block_creators = [create_if_block$1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*volume*/ ctx[0] === 0) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			div0 = element("div");
			create_component(slider.$$.fragment);
			t0 = space();
			div1 = element("div");
			t1 = space();
			div2 = element("div");
			if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			div3 = claim_element(nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			div0 = claim_element(div3_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			claim_component(slider.$$.fragment, div0_nodes);
			div0_nodes.forEach(detach_dev);
			t0 = claim_space(div3_nodes);
			div1 = claim_element(div3_nodes, "DIV", { class: true });
			children(div1).forEach(detach_dev);
			t1 = claim_space(div3_nodes);
			div2 = claim_element(div3_nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			if_block.l(div2_nodes);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "slider svelte-s1ipwy");
			add_location(div0, file$5, 60, 2, 1259);
			attr_dev(div1, "class", "spacer");
			add_location(div1, file$5, 64, 2, 1327);
			attr_dev(div2, "class", "icon svelte-s1ipwy");
			add_location(div2, file$5, 66, 2, 1357);
			attr_dev(div3, "class", "volume svelte-s1ipwy");
			add_location(div3, file$5, 58, 0, 1235);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);
			mount_component(slider, div0, null);
			append_dev(div3, t0);
			append_dev(div3, div1);
			append_dev(div3, t1);
			append_dev(div3, div2);
			if_blocks[current_block_type_index].m(div2, null);
			current = true;
			dispose = listen_dev(div2, "click", /*toggle*/ ctx[2], false, false, false);
		},
		p: function update(ctx, [dirty]) {
			const slider_changes = {};

			if (!updating_value && dirty & /*volume*/ 1) {
				updating_value = true;
				slider_changes.value = /*volume*/ ctx[0];
				add_flush_callback(() => updating_value = false);
			}

			slider.$set(slider_changes);
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div2, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(slider.$$.fragment, local);
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(slider.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			destroy_component(slider);
			if_blocks[current_block_type_index].d();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	let { volume = 1 } = $$props;
	let { size = "1em" } = $$props;
	let toggleVolume = 0;

	function toggle() {
		if (volume === 0) {
			if (toggleVolume === 0) $$invalidate(0, volume = 1); else $$invalidate(0, volume = toggleVolume);
		} else {
			toggleVolume = volume;
			$$invalidate(0, volume = 0);
		}
	}

	const writable_props = ["volume", "size"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Volume> was created with unknown prop '${key}'`);
	});

	function slider_value_binding(value) {
		volume = value;
		$$invalidate(0, volume);
	}

	$$self.$set = $$props => {
		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
		if ("size" in $$props) $$invalidate(1, size = $$props.size);
	};

	$$self.$capture_state = () => {
		return { volume, size, toggleVolume };
	};

	$$self.$inject_state = $$props => {
		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
		if ("size" in $$props) $$invalidate(1, size = $$props.size);
		if ("toggleVolume" in $$props) toggleVolume = $$props.toggleVolume;
	};

	return [volume, size, toggle, toggleVolume, slider_value_binding];
}

class Volume extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { volume: 0, size: 1, toggle: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Volume",
			options,
			id: create_fragment$5.name
		});
	}

	get volume() {
		throw new Error("<Volume>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set volume(value) {
		throw new Error("<Volume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get size() {
		throw new Error("<Volume>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Volume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get toggle() {
		return this.$$.ctx[2];
	}

	set toggle(value) {
		throw new Error("<Volume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/StationImage.svelte generated by Svelte v3.18.2 */
const file$6 = "src/Components/StationImage.svelte";

function create_fragment$6(ctx) {
	let picture;
	let source;
	let t;
	let img;
	let img_src_value;
	let img_alt_value;

	const block = {
		c: function create() {
			picture = element("picture");
			source = element("source");
			t = space();
			img = element("img");
			this.h();
		},
		l: function claim(nodes) {
			picture = claim_element(nodes, "PICTURE", {});
			var picture_nodes = children(picture);
			source = claim_element(picture_nodes, "SOURCE", { srcset: true, type: true });
			t = claim_space(picture_nodes);
			img = claim_element(picture_nodes, "IMG", { src: true, alt: true, class: true });
			picture_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(source, "srcset", /*webp*/ ctx[1]);
			attr_dev(source, "type", "image/webp");
			add_location(source, file$6, 26, 2, 602);
			if (img.src !== (img_src_value = /*legacy*/ ctx[2])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*station*/ ctx[0].name);
			attr_dev(img, "class", "svelte-1ffgqxu");
			add_location(img, file$6, 27, 2, 645);
			add_location(picture, file$6, 25, 0, 590);
		},
		m: function mount(target, anchor) {
			insert_dev(target, picture, anchor);
			append_dev(picture, source);
			append_dev(picture, t);
			append_dev(picture, img);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*webp*/ 2) {
				attr_dev(source, "srcset", /*webp*/ ctx[1]);
			}

			if (dirty & /*legacy*/ 4 && img.src !== (img_src_value = /*legacy*/ ctx[2])) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*station*/ 1 && img_alt_value !== (img_alt_value = /*station*/ ctx[0].name)) {
				attr_dev(img, "alt", img_alt_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(picture);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let { station } = $$props;
	let { size } = $$props; // "lt" | "gt" | "w96"
	const writable_props = ["station", "size"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StationImage> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("station" in $$props) $$invalidate(0, station = $$props.station);
		if ("size" in $$props) $$invalidate(3, size = $$props.size);
	};

	$$self.$capture_state = () => {
		return { station, size, webp, legacy, legacyType };
	};

	$$self.$inject_state = $$props => {
		if ("station" in $$props) $$invalidate(0, station = $$props.station);
		if ("size" in $$props) $$invalidate(3, size = $$props.size);
		if ("webp" in $$props) $$invalidate(1, webp = $$props.webp);
		if ("legacy" in $$props) $$invalidate(2, legacy = $$props.legacy);
		if ("legacyType" in $$props) legacyType = $$props.legacyType;
	};

	let webp;
	let legacy;
	let legacyType;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*size, station*/ 9) {
			//const [webp, legacy] = stationImgUrl(size, station.img[keymap[size]]);
			 $$invalidate(1, [webp, legacy] = stationImgUrl(size, station), webp, (($$invalidate(2, legacy), $$invalidate(3, size)), $$invalidate(0, station)));
		}

		if ($$self.$$.dirty & /*station*/ 1) {
			 legacyType = station.origin != "mt" ? "image/png" : "image/jpg";
		}
	};

	return [station, webp, legacy, size];
}

class StationImage extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { station: 0, size: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "StationImage",
			options,
			id: create_fragment$6.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*station*/ ctx[0] === undefined && !("station" in props)) {
			console.warn("<StationImage> was created without expected prop 'station'");
		}

		if (/*size*/ ctx[3] === undefined && !("size" in props)) {
			console.warn("<StationImage> was created without expected prop 'size'");
		}
	}

	get station() {
		throw new Error("<StationImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set station(value) {
		throw new Error("<StationImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get size() {
		throw new Error("<StationImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<StationImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Play.svelte generated by Svelte v3.18.2 */

const file$7 = "node_modules/svelte-material-icons/Play.svelte";

function create_fragment$7(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M8,5.14V19.14L19,12.14L8,5.14Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$7, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$7, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Play> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Play extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Play",
			options,
			id: create_fragment$7.name
		});
	}

	get size() {
		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Pause.svelte generated by Svelte v3.18.2 */

const file$8 = "node_modules/svelte-material-icons/Pause.svelte";

function create_fragment$8(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M14,19H18V5H14M6,19H10V5H6V19Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$8, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$8, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pause> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Pause extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Pause",
			options,
			id: create_fragment$8.name
		});
	}

	get size() {
		throw new Error("<Pause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Pause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Pause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Pause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Pause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Pause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Pause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Pause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Pause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Pause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Close.svelte generated by Svelte v3.18.2 */

const file$9 = "node_modules/svelte-material-icons/Close.svelte";

function create_fragment$9(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$9, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$9, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Close> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Close extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Close",
			options,
			id: create_fragment$9.name
		});
	}

	get size() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Loading.svelte generated by Svelte v3.18.2 */

const file$a = "src/Components/Loading.svelte";

function create_fragment$a(ctx) {
	let div;
	let svg;
	let circle;
	let div_class_value;

	const block = {
		c: function create() {
			div = element("div");
			svg = svg_element("svg");
			circle = svg_element("circle");
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true, style: true });
			var div_nodes = children(div);
			svg = claim_element(div_nodes, "svg", { viewBox: true, height: true, width: true }, 1);
			var svg_nodes = children(svg);

			circle = claim_element(
				svg_nodes,
				"circle",
				{
					class: true,
					cx: true,
					cy: true,
					r: true,
					fill: true,
					stroke: true,
					"stroke-width": true
				},
				1
			);

			children(circle).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(circle, "class", "circle indeterminate svelte-hq0ga7");
			attr_dev(circle, "cx", "44");
			attr_dev(circle, "cy", "44");
			attr_dev(circle, "r", "18");
			attr_dev(circle, "fill", "none");
			attr_dev(circle, "stroke", /*color*/ ctx[3]);
			attr_dev(circle, "stroke-width", "5");
			add_location(circle, file$a, 57, 4, 1182);
			attr_dev(svg, "viewBox", "22 22 44 44");
			attr_dev(svg, "height", /*height*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[5]);
			add_location(svg, file$a, 56, 2, 1133);
			attr_dev(div, "class", div_class_value = "circular-progress " + /*variant*/ ctx[0] + " " + /*className*/ ctx[1] + " svelte-hq0ga7");
			attr_dev(div, "style", /*style*/ ctx[2]);
			add_location(div, file$a, 55, 0, 1069);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, svg);
			append_dev(svg, circle);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 8) {
				attr_dev(circle, "stroke", /*color*/ ctx[3]);
			}

			if (dirty & /*height*/ 16) {
				attr_dev(svg, "height", /*height*/ ctx[4]);
			}

			if (dirty & /*width*/ 32) {
				attr_dev(svg, "width", /*width*/ ctx[5]);
			}

			if (dirty & /*variant, className*/ 3 && div_class_value !== (div_class_value = "circular-progress " + /*variant*/ ctx[0] + " " + /*className*/ ctx[1] + " svelte-hq0ga7")) {
				attr_dev(div, "class", div_class_value);
			}

			if (dirty & /*style*/ 4) {
				attr_dev(div, "style", /*style*/ ctx[2]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$a($$self, $$props, $$invalidate) {
	let { class: className = "" } = $$props;
	let { style = "" } = $$props;
	let { value = null } = $$props;
	let { variant = "indeterminate" } = $$props; // "static", "determinate"
	let { color = "currentColor" } = $$props;
	let { size = "1em" } = $$props;
	let { height = size } = $$props;
	let { width = size } = $$props;
	const writable_props = ["class", "style", "value", "variant", "color", "size", "height", "width"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("class" in $$props) $$invalidate(1, className = $$props.class);
		if ("style" in $$props) $$invalidate(2, style = $$props.style);
		if ("value" in $$props) $$invalidate(6, value = $$props.value);
		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
		if ("color" in $$props) $$invalidate(3, color = $$props.color);
		if ("size" in $$props) $$invalidate(7, size = $$props.size);
		if ("height" in $$props) $$invalidate(4, height = $$props.height);
		if ("width" in $$props) $$invalidate(5, width = $$props.width);
	};

	$$self.$capture_state = () => {
		return {
			className,
			style,
			value,
			variant,
			color,
			size,
			height,
			width
		};
	};

	$$self.$inject_state = $$props => {
		if ("className" in $$props) $$invalidate(1, className = $$props.className);
		if ("style" in $$props) $$invalidate(2, style = $$props.style);
		if ("value" in $$props) $$invalidate(6, value = $$props.value);
		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
		if ("color" in $$props) $$invalidate(3, color = $$props.color);
		if ("size" in $$props) $$invalidate(7, size = $$props.size);
		if ("height" in $$props) $$invalidate(4, height = $$props.height);
		if ("width" in $$props) $$invalidate(5, width = $$props.width);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*value, variant*/ 65) {
			 if (value != null && variant === "indeterminate") $$invalidate(0, variant = "static");
		}
	};

	return [variant, className, style, color, height, width, value, size];
}

class Loading extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
			class: 1,
			style: 2,
			value: 6,
			variant: 0,
			color: 3,
			size: 7,
			height: 4,
			width: 5
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loading",
			options,
			id: create_fragment$a.name
		});
	}

	get class() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set class(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get style() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set style(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get variant() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set variant(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get size() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Player.svelte generated by Svelte v3.18.2 */

const { Object: Object_1, console: console_1 } = globals;
const file$b = "src/Components/Player.svelte";

// (315:0) {#if station != null}
function create_if_block$2(ctx) {
	let div4;
	let a0;
	let t0;
	let a0_href_value;
	let t1;
	let div0;
	let a1;
	let t2_value = /*station*/ ctx[1].name + "";
	let t2;
	let a1_href_value;
	let t3;
	let div1;
	let updating_volume;
	let t4;
	let div2;
	let current_block_type_index;
	let if_block1;
	let t5;
	let div3;
	let div4_class_value;
	let div4_transition;
	let current;
	let dispose;

	const stationimage = new StationImage({
			props: { station: /*station*/ ctx[1], size: "w96" },
			$$inline: true
		});

	let if_block0 = /*state*/ ctx[2] === "loading" && create_if_block_2(ctx);

	function volume_1_volume_binding(value) {
		/*volume_1_volume_binding*/ ctx[23].call(null, value);
	}

	let volume_1_props = {};

	if (/*volume*/ ctx[3] !== void 0) {
		volume_1_props.volume = /*volume*/ ctx[3];
	}

	const volume_1 = new Volume({ props: volume_1_props, $$inline: true });
	binding_callbacks.push(() => bind(volume_1, "volume", volume_1_volume_binding));
	const if_block_creators = [create_if_block_1, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*state*/ ctx[2] === "paused") return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const close_1 = new Close({ props: { size: "1.5em" }, $$inline: true });

	const block = {
		c: function create() {
			div4 = element("div");
			a0 = element("a");
			create_component(stationimage.$$.fragment);
			t0 = space();
			if (if_block0) if_block0.c();
			t1 = space();
			div0 = element("div");
			a1 = element("a");
			t2 = text(t2_value);
			t3 = space();
			div1 = element("div");
			create_component(volume_1.$$.fragment);
			t4 = space();
			div2 = element("div");
			if_block1.c();
			t5 = space();
			div3 = element("div");
			create_component(close_1.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			div4 = claim_element(nodes, "DIV", { class: true });
			var div4_nodes = children(div4);
			a0 = claim_element(div4_nodes, "A", { class: true, href: true });
			var a0_nodes = children(a0);
			claim_component(stationimage.$$.fragment, a0_nodes);
			t0 = claim_space(a0_nodes);
			if (if_block0) if_block0.l(a0_nodes);
			a0_nodes.forEach(detach_dev);
			t1 = claim_space(div4_nodes);
			div0 = claim_element(div4_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			a1 = claim_element(div0_nodes, "A", { class: true, href: true });
			var a1_nodes = children(a1);
			t2 = claim_text(a1_nodes, t2_value);
			a1_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			t3 = claim_space(div4_nodes);
			div1 = claim_element(div4_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			claim_component(volume_1.$$.fragment, div1_nodes);
			div1_nodes.forEach(detach_dev);
			t4 = claim_space(div4_nodes);
			div2 = claim_element(div4_nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			if_block1.l(div2_nodes);
			div2_nodes.forEach(detach_dev);
			t5 = claim_space(div4_nodes);
			div3 = claim_element(div4_nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			claim_component(close_1.$$.fragment, div3_nodes);
			div3_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(a0, "class", "no-a image svelte-50zt7n");

			attr_dev(a0, "href", a0_href_value = stationUrl({
				lang: /*$lang*/ ctx[6],
				station: /*station*/ ctx[1]
			}));

			add_location(a0, file$b, 327, 4, 7297);
			attr_dev(a1, "class", "no-a svelte-50zt7n");

			attr_dev(a1, "href", a1_href_value = stationUrl({
				lang: /*$lang*/ ctx[6],
				station: /*station*/ ctx[1]
			}));

			add_location(a1, file$b, 339, 6, 7647);
			attr_dev(div0, "class", "text svelte-50zt7n");
			add_location(div0, file$b, 338, 4, 7622);
			attr_dev(div1, "class", "volume svelte-50zt7n");
			add_location(div1, file$b, 343, 4, 7745);
			attr_dev(div2, "class", "toggle svelte-50zt7n");
			add_location(div2, file$b, 347, 4, 7815);
			attr_dev(div3, "class", "close svelte-50zt7n");
			add_location(div3, file$b, 355, 4, 7987);
			attr_dev(div4, "class", div4_class_value = "floatingplayer " + /*state*/ ctx[2] + " svelte-50zt7n");
			add_location(div4, file$b, 315, 2, 7002);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div4, anchor);
			append_dev(div4, a0);
			mount_component(stationimage, a0, null);
			append_dev(a0, t0);
			if (if_block0) if_block0.m(a0, null);
			append_dev(div4, t1);
			append_dev(div4, div0);
			append_dev(div0, a1);
			append_dev(a1, t2);
			append_dev(div4, t3);
			append_dev(div4, div1);
			mount_component(volume_1, div1, null);
			append_dev(div4, t4);
			append_dev(div4, div2);
			if_blocks[current_block_type_index].m(div2, null);
			append_dev(div4, t5);
			append_dev(div4, div3);
			mount_component(close_1, div3, null);
			current = true;

			dispose = [
				listen_dev(div2, "click", /*toggle*/ ctx[5], false, false, false),
				listen_dev(div3, "click", /*close*/ ctx[4], false, false, false)
			];
		},
		p: function update(ctx, dirty) {
			const stationimage_changes = {};
			if (dirty & /*station*/ 2) stationimage_changes.station = /*station*/ ctx[1];
			stationimage.$set(stationimage_changes);

			if (/*state*/ ctx[2] === "loading") {
				if (!if_block0) {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(a0, null);
				} else {
					transition_in(if_block0, 1);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*$lang, station*/ 66 && a0_href_value !== (a0_href_value = stationUrl({
				lang: /*$lang*/ ctx[6],
				station: /*station*/ ctx[1]
			}))) {
				attr_dev(a0, "href", a0_href_value);
			}

			if ((!current || dirty & /*station*/ 2) && t2_value !== (t2_value = /*station*/ ctx[1].name + "")) set_data_dev(t2, t2_value);

			if (!current || dirty & /*$lang, station*/ 66 && a1_href_value !== (a1_href_value = stationUrl({
				lang: /*$lang*/ ctx[6],
				station: /*station*/ ctx[1]
			}))) {
				attr_dev(a1, "href", a1_href_value);
			}

			const volume_1_changes = {};

			if (!updating_volume && dirty & /*volume*/ 8) {
				updating_volume = true;
				volume_1_changes.volume = /*volume*/ ctx[3];
				add_flush_callback(() => updating_volume = false);
			}

			volume_1.$set(volume_1_changes);
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index !== previous_block_index) {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block1 = if_blocks[current_block_type_index];

				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				}

				transition_in(if_block1, 1);
				if_block1.m(div2, null);
			}

			if (!current || dirty & /*state*/ 4 && div4_class_value !== (div4_class_value = "floatingplayer " + /*state*/ ctx[2] + " svelte-50zt7n")) {
				attr_dev(div4, "class", div4_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(stationimage.$$.fragment, local);
			transition_in(if_block0);
			transition_in(volume_1.$$.fragment, local);
			transition_in(if_block1);
			transition_in(close_1.$$.fragment, local);

			add_render_callback(() => {
				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fly, { x: 0, y: 50, duration: 350 }, true);
				div4_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(stationimage.$$.fragment, local);
			transition_out(if_block0);
			transition_out(volume_1.$$.fragment, local);
			transition_out(if_block1);
			transition_out(close_1.$$.fragment, local);
			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fly, { x: 0, y: 50, duration: 350 }, false);
			div4_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div4);
			destroy_component(stationimage);
			if (if_block0) if_block0.d();
			destroy_component(volume_1);
			if_blocks[current_block_type_index].d();
			destroy_component(close_1);
			if (detaching && div4_transition) div4_transition.end();
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(315:0) {#if station != null}",
		ctx
	});

	return block;
}

// (330:6) {#if state === "loading"}
function create_if_block_2(ctx) {
	let div1;
	let div0;
	let div1_transition;
	let current;
	const loading = new Loading({ props: { size: "30px" }, $$inline: true });

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			create_component(loading.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			claim_component(loading.$$.fragment, div0_nodes);
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "icon svelte-50zt7n");
			add_location(div0, file$b, 331, 10, 7509);
			attr_dev(div1, "class", "cover svelte-50zt7n");
			add_location(div1, file$b, 330, 8, 7445);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			mount_component(loading, div0, null);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading.$$.fragment, local);

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 100 }, true);
				div1_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(loading.$$.fragment, local);
			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 100 }, false);
			div1_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			destroy_component(loading);
			if (detaching && div1_transition) div1_transition.end();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(330:6) {#if state === \\\"loading\\\"}",
		ctx
	});

	return block;
}

// (351:6) {:else}
function create_else_block$1(ctx) {
	let current;
	const pause_1 = new Pause({ props: { size: "1.5em" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(pause_1.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(pause_1.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(pause_1, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(pause_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(pause_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(pause_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(351:6) {:else}",
		ctx
	});

	return block;
}

// (349:6) {#if state === "paused"}
function create_if_block_1(ctx) {
	let current;
	const play_1 = new Play({ props: { size: "1.5em" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(play_1.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(play_1.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(play_1, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(play_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(play_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(play_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(349:6) {#if state === \\\"paused\\\"}",
		ctx
	});

	return block;
}

function create_fragment$b(ctx) {
	let t;
	let audio;
	let current;
	let dispose;
	let if_block = /*station*/ ctx[1] != null && create_if_block$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			t = space();
			audio = element("audio");
			this.h();
		},
		l: function claim(nodes) {
			if (if_block) if_block.l(nodes);
			t = claim_space(nodes);
			audio = claim_element(nodes, "AUDIO", { class: true });
			children(audio).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(audio, "class", "media-element svelte-50zt7n");
			add_location(audio, file$b, 361, 0, 8079);
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t, anchor);
			insert_dev(target, audio, anchor);
			/*audio_binding*/ ctx[24](audio);

			if (!isNaN(/*volume*/ ctx[3])) {
				audio.volume = /*volume*/ ctx[3];
			}

			current = true;

			dispose = [
				listen_dev(audio, "volumechange", /*audio_volumechange_handler*/ ctx[25]),
				listen_dev(audio, "stalled", /*handleStalled*/ ctx[8], false, false, false),
				listen_dev(audio, "play", /*handlePlay*/ ctx[9], false, false, false),
				listen_dev(audio, "playing", /*handlePlaying*/ ctx[10], false, false, false),
				listen_dev(audio, "pause", /*handlePause*/ ctx[11], false, false, false),
				listen_dev(audio, "error", /*handleError*/ ctx[12], false, false, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if (/*station*/ ctx[1] != null) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t.parentNode, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (dirty & /*volume*/ 8 && !isNaN(/*volume*/ ctx[3])) {
				audio.volume = /*volume*/ ctx[3];
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(audio);
			/*audio_binding*/ ctx[24](null);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$b($$self, $$props, $$invalidate) {
	let $lang;
	const { lang } = stores();
	validate_store(lang, "lang");
	component_subscribe($$self, lang, value => $$invalidate(6, $lang = value));
	let { mediaElement = null } = $$props;
	let { station = null } = $$props;
	let { state = "paused" } = $$props; // playing, loading, unstarted
	let { volume = 1 } = $$props;
	let hlsPromise;

	const getHls = async () => {
		if (typeof Hls !== "undefined") return Hls;
		if (hlsPromise != null) return hlsPromise;

		return hlsPromise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = "/static/js/hls.js";
				script.onload = () => resolve(Hls);
				script.onerror = reject;
				document.head.appendChild(script);
			});
	};

	let hls = null;
	const handleStalled = event => $$invalidate(2, state = "loading");
	const handlePlay = event => $$invalidate(2, state = "loading");
	const handlePlaying = event => $$invalidate(2, state = "playing");
	const handlePause = event => $$invalidate(2, state = "paused");
	const handleError = console.log;

	function close() {
		mediaElement.pause();
		mediaElement.removeAttribute("src");
		mediaElement.load();

		if (hls != null) {
			hls.destroy();
			hls = null;
		}

		$$invalidate(1, station = null);
	}

	const playHls = async url => {
		const Hls = await getHls();

		if (!Hls.isSupported()) {
			return false;
		}

		try {
			//always proxy
			//url = url.startsWith("http://") ? "/proxy/" + url : url;
			url = `/proxy/${url}`;

			hls = new Hls();

			hls.on(Hls.Events.ERROR, (event, data) => {
				const { type, details, fatal } = data;

				for (const [key, value] of Object.entries(Hls.ErrorTypes)) {
					if (type === value) console.log(key);
				}

				console.log(event, data);
			});

			$$invalidate(2, state = "loading");
			await hls.loadSource(url);
			await hls.attachMedia(mediaElement);
			await new Promise(resolve => hls.on(Hls.Events.MANIFEST_PARSED, resolve));
			await mediaElement.play();
			return true;
		} catch(e) {
			return false;
		}
	};

	const playFile = async url => {
		try {
			// always proxy http (avoid chrome block)
			if (!url.startsWith("https")) {
				url = `/proxy/${url}`;
			}

			$$invalidate(0, mediaElement.src = url, mediaElement);
			await mediaElement.load();
			await mediaElement.play();
			return true;
		} catch(e) {
			return false;
		}
	};

	const playStream = stream => {
		console.log(Array.from(Object.values(stream)));

		if (stream.type === "hls") {
			return playHls(stream.url);
		} else {
			return playFile(stream.url);
		}
	};

	async function play(st = null) {
		if (st == null || station && station._id === st._id) {
			try {
				await mediaElement.play();
				return true;
			} catch(e) {
				return false;
			}
		}

		$$invalidate(1, station = st);

		recentList.update(list => {
			let helper = list.filter(item => item._id !== station._id);
			const { _id, countryCode, name, slug, mt, origin } = station;
			const item = { _id, countryCode, name, slug, mt, origin };
			helper = [item, ...helper].slice(0, 60);
			return helper;
		});

		const streams = sortStreams(station);

		if (streams.length === 0) {
			return false;
		}

		for (let i = 0; i < streams.length; i++) {
			const stream = streams[i];

			if (await playStream(stream)) {
				return true;
			} else {
				continue;
			}
		}

		return false;
	}

	function pause() {
		mediaElement.pause();
	}

	function toggle() {
		switch (state) {
			case "playing":
			case "loading":
				pause();
				break;
			case "paused":
				play();
				break;
		}
	}

	function sortStreams(station) {
		const always = [];
		const probably = [];
		const maybe = [];
		const hlsDirect = [];
		const hlsProxy = [];

		station.streams.forEach(stream => {
			if (stream.type === "rtmp") return;

			if (stream.type === "hls") {
				if (stream.url.startsWith("http://")) {
					hlsProxy.push(stream);
				} else {
					hlsDirect.push(stream);
				}
			} else {
				const can = mediaElement.canPlayType(stream.mime);
				if (can === "always") always.push(stream); else if (can === "maybe") maybe.push(stream); else if (can === "probably") probably.push(stream);
			}
		});

		return [...always, ...probably, ...maybe, ...hlsDirect, ...hlsProxy];
	}

	const writable_props = ["mediaElement", "station", "state", "volume"];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Player> was created with unknown prop '${key}'`);
	});

	function volume_1_volume_binding(value) {
		volume = value;
		$$invalidate(3, volume);
	}

	function audio_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(0, mediaElement = $$value);
		});
	}

	function audio_volumechange_handler() {
		volume = this.volume;
		$$invalidate(3, volume);
	}

	$$self.$set = $$props => {
		if ("mediaElement" in $$props) $$invalidate(0, mediaElement = $$props.mediaElement);
		if ("station" in $$props) $$invalidate(1, station = $$props.station);
		if ("state" in $$props) $$invalidate(2, state = $$props.state);
		if ("volume" in $$props) $$invalidate(3, volume = $$props.volume);
	};

	$$self.$capture_state = () => {
		return {
			mediaElement,
			station,
			state,
			volume,
			hlsPromise,
			hls,
			hidden,
			$lang
		};
	};

	$$self.$inject_state = $$props => {
		if ("mediaElement" in $$props) $$invalidate(0, mediaElement = $$props.mediaElement);
		if ("station" in $$props) $$invalidate(1, station = $$props.station);
		if ("state" in $$props) $$invalidate(2, state = $$props.state);
		if ("volume" in $$props) $$invalidate(3, volume = $$props.volume);
		if ("hlsPromise" in $$props) hlsPromise = $$props.hlsPromise;
		if ("hls" in $$props) hls = $$props.hls;
		if ("hidden" in $$props) $$invalidate(18, hidden = $$props.hidden);
		if ("$lang" in $$props) lang.set($lang = $$props.$lang);
	};

	let hidden;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*station*/ 2) {
			//export let showVolume = true;
			 $$invalidate(18, hidden = station == null);
		}

		if ($$self.$$.dirty & /*station, state, hidden*/ 262150) {
			 playerState.set({ station, state, hidden });
		}
	};

	return [
		mediaElement,
		station,
		state,
		volume,
		close,
		toggle,
		$lang,
		lang,
		handleStalled,
		handlePlay,
		handlePlaying,
		handlePause,
		handleError,
		play,
		pause,
		sortStreams,
		hlsPromise,
		hls,
		hidden,
		getHls,
		playHls,
		playFile,
		playStream,
		volume_1_volume_binding,
		audio_binding,
		audio_volumechange_handler
	];
}

class Player extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
			mediaElement: 0,
			station: 1,
			state: 2,
			volume: 3,
			close: 4,
			play: 13,
			pause: 14,
			toggle: 5,
			sortStreams: 15
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Player",
			options,
			id: create_fragment$b.name
		});
	}

	get mediaElement() {
		return this.$$.ctx[0];
	}

	set mediaElement(mediaElement) {
		this.$set({ mediaElement });
		flush();
	}

	get station() {
		return this.$$.ctx[1];
	}

	set station(station) {
		this.$set({ station });
		flush();
	}

	get state() {
		return this.$$.ctx[2];
	}

	set state(state) {
		this.$set({ state });
		flush();
	}

	get volume() {
		return this.$$.ctx[3];
	}

	set volume(volume) {
		this.$set({ volume });
		flush();
	}

	get close() {
		return this.$$.ctx[4];
	}

	set close(value) {
		throw new Error("<Player>: Cannot set read-only property 'close'");
	}

	get play() {
		return this.$$.ctx[13];
	}

	set play(value) {
		throw new Error("<Player>: Cannot set read-only property 'play'");
	}

	get pause() {
		return this.$$.ctx[14];
	}

	set pause(value) {
		throw new Error("<Player>: Cannot set read-only property 'pause'");
	}

	get toggle() {
		return this.$$.ctx[5];
	}

	set toggle(value) {
		throw new Error("<Player>: Cannot set read-only property 'toggle'");
	}

	get sortStreams() {
		return this.$$.ctx[15];
	}

	set sortStreams(value) {
		throw new Error("<Player>: Cannot set read-only property 'sortStreams'");
	}
}

/* node_modules/svelte-material-icons-0/dist/Search.svelte generated by Svelte v3.18.2 */

const file$c = "node_modules/svelte-material-icons-0/dist/Search.svelte";

function create_fragment$c(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					xmlns: true,
					viewBox: true,
					width: true,
					height: true,
					fill: true,
					stroke: true
				},
				1
			);

			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z");
			add_location(path, file$c, 9, 83, 300);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "fill", /*fill*/ ctx[2]);
			attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			add_location(svg, file$c, 9, 0, 217);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*viewBox*/ 16) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*fill*/ 4) {
				attr_dev(svg, "fill", /*fill*/ ctx[2]);
			}

			if (dirty & /*stroke*/ 8) {
				attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let { size = "1.5em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { fill = color } = $$props;
	let { stroke = color } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "fill", "stroke", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return {
			size,
			width,
			height,
			color,
			fill,
			stroke,
			viewBox
		};
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	return [width, height, fill, stroke, viewBox, size, color];
}

class Search extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
			size: 5,
			width: 0,
			height: 1,
			color: 6,
			fill: 2,
			stroke: 3,
			viewBox: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Search",
			options,
			id: create_fragment$c.name
		});
	}

	get size() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get fill() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set fill(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get stroke() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stroke(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Search.svelte generated by Svelte v3.18.2 */
const file$d = "src/Components/Search.svelte";

function create_fragment$d(ctx) {
	let form;
	let div;
	let t;
	let input_1;
	let current;
	let dispose;

	const search = new Search({
			props: { size: "1.25em" },
			$$inline: true
		});

	const block = {
		c: function create() {
			form = element("form");
			div = element("div");
			create_component(search.$$.fragment);
			t = space();
			input_1 = element("input");
			this.h();
		},
		l: function claim(nodes) {
			form = claim_element(nodes, "FORM", { class: true, method: true, action: true });
			var form_nodes = children(form);
			div = claim_element(form_nodes, "DIV", { class: true });
			var div_nodes = children(div);
			claim_component(search.$$.fragment, div_nodes);
			div_nodes.forEach(detach_dev);
			t = claim_space(form_nodes);

			input_1 = claim_element(form_nodes, "INPUT", {
				class: true,
				type: true,
				name: true,
				autocomplete: true,
				placeholder: true
			});

			form_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div, "class", "icon svelte-ylgfos");
			add_location(div, file$d, 84, 2, 2242);
			attr_dev(input_1, "class", "field svelte-ylgfos");
			attr_dev(input_1, "type", "search");
			attr_dev(input_1, "name", "q");
			attr_dev(input_1, "autocomplete", "off");
			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[4]);
			add_location(input_1, file$d, 87, 2, 2300);
			attr_dev(form, "class", "search svelte-ylgfos");
			attr_dev(form, "method", "get");
			attr_dev(form, "action", /*action*/ ctx[3]);
			add_location(form, file$d, 83, 0, 2162);
		},
		m: function mount(target, anchor) {
			insert_dev(target, form, anchor);
			append_dev(form, div);
			mount_component(search, div, null);
			append_dev(form, t);
			append_dev(form, input_1);
			/*input_1_binding*/ ctx[13](input_1);
			set_input_value(input_1, /*value*/ ctx[0]);
			current = true;

			dispose = [
				listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[14]),
				listen_dev(form, "submit", prevent_default(/*submit*/ ctx[2]), false, true, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*placeholder*/ 16) {
				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[4]);
			}

			if (dirty & /*value*/ 1) {
				set_input_value(input_1, /*value*/ ctx[0]);
			}

			if (!current || dirty & /*action*/ 8) {
				attr_dev(form, "action", /*action*/ ctx[3]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(search.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(search.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(form);
			destroy_component(search);
			/*input_1_binding*/ ctx[13](null);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$d($$self, $$props, $$invalidate) {
	let $page;
	let $lang;
	let $trans;
	const { session, page } = stores$1$1();
	validate_store(page, "page");
	component_subscribe($$self, page, value => $$invalidate(8, $page = value));
	const { trans, lang, countryCode } = stores();
	validate_store(trans, "trans");
	component_subscribe($$self, trans, value => $$invalidate(10, $trans = value));
	validate_store(lang, "lang");
	component_subscribe($$self, lang, value => $$invalidate(9, $lang = value));
	let { value = $page.query.q || "" } = $$props;
	let { input = void 0 } = $$props;

	function submit() {
		// Remove country limited search
		// value.trim() && go(searchUrl({lang: $lang, q: value.trim(), countryCode: $countryCode }));
		value.trim() && goto(searchUrl({ lang: $lang, q: value.trim() }));
	}

	let action, placeholder;
	const writable_props = ["value", "input"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
	});

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(1, input = $$value);
		});
	}

	function input_1_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$set = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("input" in $$props) $$invalidate(1, input = $$props.input);
	};

	$$self.$capture_state = () => {
		return {
			value,
			input,
			action,
			placeholder,
			$page,
			$lang,
			$trans
		};
	};

	$$self.$inject_state = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("input" in $$props) $$invalidate(1, input = $$props.input);
		if ("action" in $$props) $$invalidate(3, action = $$props.action);
		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
		if ("$page" in $$props) page.set($page = $$props.$page);
		if ("$lang" in $$props) lang.set($lang = $$props.$lang);
		if ("$trans" in $$props) trans.set($trans = $$props.$trans);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$lang*/ 512) {
			// Remove country limited search
			// $: action = searchActionUrl({lang: $lang, countryCode: $countryCode});
			 $$invalidate(3, action = searchActionUrl({ lang: $lang }));
		}

		if ($$self.$$.dirty & /*$trans*/ 1024) {
			// Remove country limited search
			// $: placeholder = $countryCode ? $trans("search.placeholder.country", {country: $trans(`countries.${$countryCode}`)}) : $trans("search.placeholder.global");
			 $$invalidate(4, placeholder = $trans("search.placeholder.global"));
		}
	};

	return [
		value,
		input,
		submit,
		action,
		placeholder,
		page,
		trans,
		lang,
		$page,
		$lang,
		$trans,
		session,
		countryCode,
		input_1_binding,
		input_1_input_handler
	];
}

class Search_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { value: 0, input: 1, submit: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Search_1",
			options,
			id: create_fragment$d.name
		});
	}

	get value() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get input() {
		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set input(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get submit() {
		return this.$$.ctx[2];
	}

	set submit(value) {
		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons-0/dist/Menu.svelte generated by Svelte v3.18.2 */

const file$e = "node_modules/svelte-material-icons-0/dist/Menu.svelte";

function create_fragment$e(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					xmlns: true,
					viewBox: true,
					width: true,
					height: true,
					fill: true,
					stroke: true
				},
				1
			);

			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z");
			add_location(path, file$e, 9, 83, 300);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "fill", /*fill*/ ctx[2]);
			attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			add_location(svg, file$e, 9, 0, 217);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*viewBox*/ 16) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*fill*/ 4) {
				attr_dev(svg, "fill", /*fill*/ ctx[2]);
			}

			if (dirty & /*stroke*/ 8) {
				attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$e.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$e($$self, $$props, $$invalidate) {
	let { size = "1.5em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { fill = color } = $$props;
	let { stroke = color } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "fill", "stroke", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return {
			size,
			width,
			height,
			color,
			fill,
			stroke,
			viewBox
		};
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	return [width, height, fill, stroke, viewBox, size, color];
}

class Menu extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			size: 5,
			width: 0,
			height: 1,
			color: 6,
			fill: 2,
			stroke: 3,
			viewBox: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Menu",
			options,
			id: create_fragment$e.name
		});
	}

	get size() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get fill() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set fill(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get stroke() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stroke(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons-0/dist/Close.svelte generated by Svelte v3.18.2 */

const file$f = "node_modules/svelte-material-icons-0/dist/Close.svelte";

function create_fragment$f(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					xmlns: true,
					viewBox: true,
					width: true,
					height: true,
					fill: true,
					stroke: true
				},
				1
			);

			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
			add_location(path, file$f, 9, 83, 300);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "fill", /*fill*/ ctx[2]);
			attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			add_location(svg, file$f, 9, 0, 217);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*viewBox*/ 16) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*fill*/ 4) {
				attr_dev(svg, "fill", /*fill*/ ctx[2]);
			}

			if (dirty & /*stroke*/ 8) {
				attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$f.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$f($$self, $$props, $$invalidate) {
	let { size = "1.5em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { fill = color } = $$props;
	let { stroke = color } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "fill", "stroke", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Close> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return {
			size,
			width,
			height,
			color,
			fill,
			stroke,
			viewBox
		};
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	return [width, height, fill, stroke, viewBox, size, color];
}

class Close$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
			size: 5,
			width: 0,
			height: 1,
			color: 6,
			fill: 2,
			stroke: 3,
			viewBox: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Close",
			options,
			id: create_fragment$f.name
		});
	}

	get size() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get fill() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set fill(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get stroke() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stroke(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var DASH = {};

/* src/Components/Topbar.svelte generated by Svelte v3.18.2 */
const file$g = "src/Components/Topbar.svelte";

// (124:32) 
function create_if_block_3(ctx) {
	let div1;
	let div0;
	let t0;
	let div2;
	let updating_input;
	let t1;
	let div4;
	let div3;
	let current;
	let dispose;
	const close = new Close$1({ $$inline: true });

	function search_input_binding(value) {
		/*search_input_binding*/ ctx[8].call(null, value);
	}

	let search_props = {};

	if (/*searchInput*/ ctx[3] !== void 0) {
		search_props.input = /*searchInput*/ ctx[3];
	}

	const search = new Search_1({ props: search_props, $$inline: true });
	binding_callbacks.push(() => bind(search, "input", search_input_binding));
	/*search_binding*/ ctx[9](search);
	const searchicon = new Search({ $$inline: true });

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			create_component(close.$$.fragment);
			t0 = space();
			div2 = element("div");
			create_component(search.$$.fragment);
			t1 = space();
			div4 = element("div");
			div3 = element("div");
			create_component(searchicon.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			claim_component(close.$$.fragment, div0_nodes);
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			div2 = claim_element(nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			claim_component(search.$$.fragment, div2_nodes);
			div2_nodes.forEach(detach_dev);
			t1 = claim_space(nodes);
			div4 = claim_element(nodes, "DIV", { class: true });
			var div4_nodes = children(div4);
			div3 = claim_element(div4_nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			claim_component(searchicon.$$.fragment, div3_nodes);
			div3_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "icon svelte-102tnj9");
			add_location(div0, file$g, 125, 8, 2519);
			attr_dev(div1, "class", "touchsquare svelte-102tnj9");
			add_location(div1, file$g, 124, 6, 2461);
			attr_dev(div2, "class", "search svelte-102tnj9");
			add_location(div2, file$g, 130, 6, 2593);
			attr_dev(div3, "class", "icon svelte-102tnj9");
			add_location(div3, file$g, 135, 8, 2775);
			attr_dev(div4, "class", "touchsquare svelte-102tnj9");
			add_location(div4, file$g, 134, 6, 2702);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			mount_component(close, div0, null);
			insert_dev(target, t0, anchor);
			insert_dev(target, div2, anchor);
			mount_component(search, div2, null);
			insert_dev(target, t1, anchor);
			insert_dev(target, div4, anchor);
			append_dev(div4, div3);
			mount_component(searchicon, div3, null);
			current = true;

			dispose = [
				listen_dev(
					div1,
					"click",
					function () {
						if (is_function(/*toggleSearch*/ ctx[1])) /*toggleSearch*/ ctx[1].apply(this, arguments);
					},
					false,
					false,
					false
				),
				listen_dev(div4, "click", /*click_handler*/ ctx[10], false, false, false)
			];
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const search_changes = {};

			if (!updating_input && dirty & /*searchInput*/ 8) {
				updating_input = true;
				search_changes.input = /*searchInput*/ ctx[3];
				add_flush_callback(() => updating_input = false);
			}

			search.$set(search_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(close.$$.fragment, local);
			transition_in(search.$$.fragment, local);
			transition_in(searchicon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(close.$$.fragment, local);
			transition_out(search.$$.fragment, local);
			transition_out(searchicon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			destroy_component(close);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(div2);
			/*search_binding*/ ctx[9](null);
			destroy_component(search);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div4);
			destroy_component(searchicon);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(124:32) ",
		ctx
	});

	return block;
}

// (106:4) {#if mode === 'normal'}
function create_if_block_1$1(ctx) {
	let div1;
	let div0;
	let current_block_type_index;
	let if_block;
	let t0;
	let t1;
	let div3;
	let div2;
	let current;
	let dispose;
	const if_block_creators = [create_if_block_2$1, create_else_block_1];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*$navOpen*/ ctx[4]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const topbartitle = new TopbarTitle({ $$inline: true });
	const searchicon = new Search({ $$inline: true });

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			if_block.c();
			t0 = space();
			create_component(topbartitle.$$.fragment);
			t1 = space();
			div3 = element("div");
			div2 = element("div");
			create_component(searchicon.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			if_block.l(div0_nodes);
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			claim_component(topbartitle.$$.fragment, nodes);
			t1 = claim_space(nodes);
			div3 = claim_element(nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			div2 = claim_element(div3_nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			claim_component(searchicon.$$.fragment, div2_nodes);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "icon svelte-102tnj9");
			add_location(div0, file$g, 107, 8, 2116);
			attr_dev(div1, "class", "touchsquare svelte-102tnj9");
			add_location(div1, file$g, 106, 6, 2061);
			attr_dev(div2, "class", "icon svelte-102tnj9");
			add_location(div2, file$g, 119, 8, 2350);
			attr_dev(div3, "class", "touchsquare svelte-102tnj9");
			add_location(div3, file$g, 118, 6, 2292);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			if_blocks[current_block_type_index].m(div0, null);
			insert_dev(target, t0, anchor);
			mount_component(topbartitle, target, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div3, anchor);
			append_dev(div3, div2);
			mount_component(searchicon, div2, null);
			current = true;

			dispose = [
				listen_dev(div1, "click", /*toggleNav*/ ctx[6], false, false, false),
				listen_dev(
					div3,
					"click",
					function () {
						if (is_function(/*toggleSearch*/ ctx[1])) /*toggleSearch*/ ctx[1].apply(this, arguments);
					},
					false,
					false,
					false
				)
			];
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index !== previous_block_index) {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div0, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(topbartitle.$$.fragment, local);
			transition_in(searchicon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			transition_out(topbartitle.$$.fragment, local);
			transition_out(searchicon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if_blocks[current_block_type_index].d();
			if (detaching) detach_dev(t0);
			destroy_component(topbartitle, detaching);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div3);
			destroy_component(searchicon);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(106:4) {#if mode === 'normal'}",
		ctx
	});

	return block;
}

// (111:10) {:else}
function create_else_block_1(ctx) {
	let current;
	const menu = new Menu({ $$inline: true });

	const block = {
		c: function create() {
			create_component(menu.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(menu.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(menu, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menu.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(menu, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_1.name,
		type: "else",
		source: "(111:10) {:else}",
		ctx
	});

	return block;
}

// (109:10) {#if $navOpen}
function create_if_block_2$1(ctx) {
	let current;
	const close = new Close$1({ $$inline: true });

	const block = {
		c: function create() {
			create_component(close.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(close.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(close, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(close.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(close.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(close, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(109:10) {#if $navOpen}",
		ctx
	});

	return block;
}

// (148:8) {:else}
function create_else_block$2(ctx) {
	let current;
	const menu = new Menu({ $$inline: true });

	const block = {
		c: function create() {
			create_component(menu.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(menu.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(menu, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menu.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(menu, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$2.name,
		type: "else",
		source: "(148:8) {:else}",
		ctx
	});

	return block;
}

// (146:8) {#if $navOpen}
function create_if_block$3(ctx) {
	let current;
	const close = new Close$1({ $$inline: true });

	const block = {
		c: function create() {
			create_component(close.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(close.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(close, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(close.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(close.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(close, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(146:8) {#if $navOpen}",
		ctx
	});

	return block;
}

function create_fragment$g(ctx) {
	let div5;
	let div0;
	let current_block_type_index;
	let if_block0;
	let t0;
	let div4;
	let div2;
	let div1;
	let current_block_type_index_1;
	let if_block1;
	let t1;
	let t2;
	let div3;
	let current;
	let dispose;
	const if_block_creators = [create_if_block_1$1, create_if_block_3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*mode*/ ctx[0] === "normal") return 0;
		if (/*mode*/ ctx[0] === "search") return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const if_block_creators_1 = [create_if_block$3, create_else_block$2];
	const if_blocks_1 = [];

	function select_block_type_2(ctx, dirty) {
		if (/*$navOpen*/ ctx[4]) return 0;
		return 1;
	}

	current_block_type_index_1 = select_block_type_2(ctx);
	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
	const topbartitle = new TopbarTitle({ $$inline: true });
	const search = new Search_1({ $$inline: true });

	const block = {
		c: function create() {
			div5 = element("div");
			div0 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div4 = element("div");
			div2 = element("div");
			div1 = element("div");
			if_block1.c();
			t1 = space();
			create_component(topbartitle.$$.fragment);
			t2 = space();
			div3 = element("div");
			create_component(search.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			div5 = claim_element(nodes, "DIV", { class: true });
			var div5_nodes = children(div5);
			div0 = claim_element(div5_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			if (if_block0) if_block0.l(div0_nodes);
			div0_nodes.forEach(detach_dev);
			t0 = claim_space(div5_nodes);
			div4 = claim_element(div5_nodes, "DIV", { class: true });
			var div4_nodes = children(div4);
			div2 = claim_element(div4_nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			div1 = claim_element(div2_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			if_block1.l(div1_nodes);
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			t1 = claim_space(div4_nodes);
			claim_component(topbartitle.$$.fragment, div4_nodes);
			t2 = claim_space(div4_nodes);
			div3 = claim_element(div4_nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			claim_component(search.$$.fragment, div3_nodes);
			div3_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			div5_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "phone svelte-102tnj9");
			add_location(div0, file$g, 104, 2, 2007);
			attr_dev(div1, "class", "icon svelte-102tnj9");
			add_location(div1, file$g, 144, 6, 2948);
			attr_dev(div2, "class", "touchsquare svelte-102tnj9");
			add_location(div2, file$g, 143, 4, 2895);
			attr_dev(div3, "class", "search svelte-102tnj9");
			add_location(div3, file$g, 155, 4, 3109);
			attr_dev(div4, "class", "desktop svelte-102tnj9");
			add_location(div4, file$g, 142, 2, 2869);
			attr_dev(div5, "class", "topbar svelte-102tnj9");
			toggle_class(div5, "mode", /*mode*/ ctx[0]);
			add_location(div5, file$g, 102, 0, 1972);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div5, anchor);
			append_dev(div5, div0);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div0, null);
			}

			append_dev(div5, t0);
			append_dev(div5, div4);
			append_dev(div4, div2);
			append_dev(div2, div1);
			if_blocks_1[current_block_type_index_1].m(div1, null);
			append_dev(div4, t1);
			mount_component(topbartitle, div4, null);
			append_dev(div4, t2);
			append_dev(div4, div3);
			mount_component(search, div3, null);
			current = true;
			dispose = listen_dev(div2, "click", /*toggleNav*/ ctx[6], false, false, false);
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block0) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(div0, null);
				} else {
					if_block0 = null;
				}
			}

			let previous_block_index_1 = current_block_type_index_1;
			current_block_type_index_1 = select_block_type_2(ctx);

			if (current_block_type_index_1 !== previous_block_index_1) {
				group_outros();

				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
					if_blocks_1[previous_block_index_1] = null;
				});

				check_outros();
				if_block1 = if_blocks_1[current_block_type_index_1];

				if (!if_block1) {
					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
					if_block1.c();
				}

				transition_in(if_block1, 1);
				if_block1.m(div1, null);
			}

			if (dirty & /*mode*/ 1) {
				toggle_class(div5, "mode", /*mode*/ ctx[0]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(topbartitle.$$.fragment, local);
			transition_in(search.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(topbartitle.$$.fragment, local);
			transition_out(search.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div5);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			if_blocks_1[current_block_type_index_1].d();
			destroy_component(topbartitle);
			destroy_component(search);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$g.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$g($$self, $$props, $$invalidate) {
	let $navOpen;
	const { navOpen, toggleNav } = getContext(DASH);
	validate_store(navOpen, "navOpen");
	component_subscribe($$self, navOpen, value => $$invalidate(4, $navOpen = value));
	let { mode = "normal" } = $$props; // or "search";

	// export let value = void 0;
	let mobileSearch;

	let searchInput;
	let submit;

	let { toggleSearch = () => {
		if (mode === "normal") {
			$$invalidate(0, mode = "search");
			setTimeout(() => searchInput.focus(), 10);
		} else if (mode === "search") {
			$$invalidate(0, mode = "normal");
		}
	} } = $$props;

	const writable_props = ["mode", "toggleSearch"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Topbar> was created with unknown prop '${key}'`);
	});

	function search_input_binding(value) {
		searchInput = value;
		$$invalidate(3, searchInput);
	}

	function search_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(2, mobileSearch = $$value);
		});
	}

	const click_handler = () => mobileSearch.submit();

	$$self.$set = $$props => {
		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
		if ("toggleSearch" in $$props) $$invalidate(1, toggleSearch = $$props.toggleSearch);
	};

	$$self.$capture_state = () => {
		return {
			mode,
			mobileSearch,
			searchInput,
			submit,
			toggleSearch,
			$navOpen
		};
	};

	$$self.$inject_state = $$props => {
		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
		if ("mobileSearch" in $$props) $$invalidate(2, mobileSearch = $$props.mobileSearch);
		if ("searchInput" in $$props) $$invalidate(3, searchInput = $$props.searchInput);
		if ("submit" in $$props) submit = $$props.submit;
		if ("toggleSearch" in $$props) $$invalidate(1, toggleSearch = $$props.toggleSearch);
		if ("$navOpen" in $$props) navOpen.set($navOpen = $$props.$navOpen);
	};

	return [
		mode,
		toggleSearch,
		mobileSearch,
		searchInput,
		$navOpen,
		navOpen,
		toggleNav,
		submit,
		search_input_binding,
		search_binding,
		click_handler
	];
}

class Topbar extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$g, create_fragment$g, safe_not_equal, { mode: 0, toggleSearch: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Topbar",
			options,
			id: create_fragment$g.name
		});
	}

	get mode() {
		throw new Error("<Topbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mode(value) {
		throw new Error("<Topbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get toggleSearch() {
		throw new Error("<Topbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set toggleSearch(value) {
		throw new Error("<Topbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons-0/dist/ChevronLeft.svelte generated by Svelte v3.18.2 */

const file$h = "node_modules/svelte-material-icons-0/dist/ChevronLeft.svelte";

function create_fragment$h(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					xmlns: true,
					viewBox: true,
					width: true,
					height: true,
					fill: true,
					stroke: true
				},
				1
			);

			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z");
			add_location(path, file$h, 9, 83, 300);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "fill", /*fill*/ ctx[2]);
			attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			add_location(svg, file$h, 9, 0, 217);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*viewBox*/ 16) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[4]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*fill*/ 4) {
				attr_dev(svg, "fill", /*fill*/ ctx[2]);
			}

			if (dirty & /*stroke*/ 8) {
				attr_dev(svg, "stroke", /*stroke*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$h.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$h($$self, $$props, $$invalidate) {
	let { size = "1.5em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { fill = color } = $$props;
	let { stroke = color } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "fill", "stroke", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChevronLeft> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return {
			size,
			width,
			height,
			color,
			fill,
			stroke,
			viewBox
		};
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(5, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(6, color = $$props.color);
		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
		if ("stroke" in $$props) $$invalidate(3, stroke = $$props.stroke);
		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
	};

	return [width, height, fill, stroke, viewBox, size, color];
}

class ChevronLeft extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
			size: 5,
			width: 0,
			height: 1,
			color: 6,
			fill: 2,
			stroke: 3,
			viewBox: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ChevronLeft",
			options,
			id: create_fragment$h.name
		});
	}

	get size() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get fill() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set fill(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get stroke() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stroke(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<ChevronLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<ChevronLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Translate.svelte generated by Svelte v3.18.2 */

const file$i = "node_modules/svelte-material-icons/Translate.svelte";

function create_fragment$i(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$i, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$i, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$i.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$i($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Translate> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Translate extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Translate",
			options,
			id: create_fragment$i.name
		});
	}

	get size() {
		throw new Error("<Translate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Translate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Translate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Translate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Translate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Translate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Translate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Translate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Translate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Translate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Earth.svelte generated by Svelte v3.18.2 */

const file$j = "node_modules/svelte-material-icons/Earth.svelte";

function create_fragment$j(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$j, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$j, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$j.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$j($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Earth> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Earth extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Earth",
			options,
			id: create_fragment$j.name
		});
	}

	get size() {
		throw new Error("<Earth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Earth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Earth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Earth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Earth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Earth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Earth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Earth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Earth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Earth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/Timelapse.svelte generated by Svelte v3.18.2 */

const file$k = "node_modules/svelte-material-icons/Timelapse.svelte";

function create_fragment$k(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.24,7.76C15.07,6.58 13.53,6 12,6V12L7.76,16.24C10.1,18.58 13.9,18.58 16.24,16.24C18.59,13.9 18.59,10.1 16.24,7.76Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$k, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$k, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$k.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$k($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timelapse> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class Timelapse extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Timelapse",
			options,
			id: create_fragment$k.name
		});
	}

	get size() {
		throw new Error("<Timelapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<Timelapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<Timelapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<Timelapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<Timelapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<Timelapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<Timelapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<Timelapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<Timelapse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<Timelapse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/AlphaFBox.svelte generated by Svelte v3.18.2 */

const file$l = "node_modules/svelte-material-icons/AlphaFBox.svelte";

function create_fragment$l(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M9,7V17H11V13H14V11H11V9H15V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$l, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$l, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$l.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$l($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AlphaFBox> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class AlphaFBox extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "AlphaFBox",
			options,
			id: create_fragment$l.name
		});
	}

	get size() {
		throw new Error("<AlphaFBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<AlphaFBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<AlphaFBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<AlphaFBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<AlphaFBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<AlphaFBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<AlphaFBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<AlphaFBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<AlphaFBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<AlphaFBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-material-icons/AlphaACircle.svelte generated by Svelte v3.18.2 */

const file$m = "node_modules/svelte-material-icons/AlphaACircle.svelte";

function create_fragment$m(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
			var svg_nodes = children(svg);
			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
			children(path).forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path, "d", "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,7A2,2 0 0,0 9,9V17H11V13H13V17H15V9A2,2 0 0,0 13,7H11M11,9H13V11H11V9Z");
			attr_dev(path, "fill", /*color*/ ctx[2]);
			add_location(path, file$m, 8, 59, 234);
			attr_dev(svg, "width", /*width*/ ctx[0]);
			attr_dev(svg, "height", /*height*/ ctx[1]);
			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			add_location(svg, file$m, 8, 0, 175);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*color*/ 4) {
				attr_dev(path, "fill", /*color*/ ctx[2]);
			}

			if (dirty & /*width*/ 1) {
				attr_dev(svg, "width", /*width*/ ctx[0]);
			}

			if (dirty & /*height*/ 2) {
				attr_dev(svg, "height", /*height*/ ctx[1]);
			}

			if (dirty & /*viewBox*/ 8) {
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$m.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$m($$self, $$props, $$invalidate) {
	let { size = "1em" } = $$props;
	let { width = size } = $$props;
	let { height = size } = $$props;
	let { color = "currentColor" } = $$props;
	let { viewBox = "0 0 24 24" } = $$props;
	const writable_props = ["size", "width", "height", "color", "viewBox"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AlphaACircle> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	$$self.$capture_state = () => {
		return { size, width, height, color, viewBox };
	};

	$$self.$inject_state = $$props => {
		if ("size" in $$props) $$invalidate(4, size = $$props.size);
		if ("width" in $$props) $$invalidate(0, width = $$props.width);
		if ("height" in $$props) $$invalidate(1, height = $$props.height);
		if ("color" in $$props) $$invalidate(2, color = $$props.color);
		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
	};

	return [width, height, color, viewBox, size];
}

class AlphaACircle extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
			size: 4,
			width: 0,
			height: 1,
			color: 2,
			viewBox: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "AlphaACircle",
			options,
			id: create_fragment$m.name
		});
	}

	get size() {
		throw new Error("<AlphaACircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set size(value) {
		throw new Error("<AlphaACircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<AlphaACircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<AlphaACircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<AlphaACircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<AlphaACircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get color() {
		throw new Error("<AlphaACircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set color(value) {
		throw new Error("<AlphaACircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get viewBox() {
		throw new Error("<AlphaACircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set viewBox(value) {
		throw new Error("<AlphaACircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Nav.svelte generated by Svelte v3.18.2 */
const file$n = "src/Components/Nav.svelte";

// (126:2) {#if $navOpen}
function create_if_block_2$2(ctx) {
	let div;
	let div_transition;
	let current;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true });
			children(div).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div, "class", "cover svelte-trrpqq");
			add_location(div, file$n, 126, 4, 2706);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			current = true;
			dispose = listen_dev(div, "click", /*closeNav*/ ctx[6], false, false, false);
		},
		p: noop,
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, true);
				div_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, false);
			div_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (detaching && div_transition) div_transition.end();
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$2.name,
		type: "if",
		source: "(126:2) {#if $navOpen}",
		ctx
	});

	return block;
}

// (171:8) {#if !$country || ($country && $country.fmCount)}
function create_if_block_1$2(ctx) {
	let div;
	let a;
	let t0;
	let span;
	let t1_value = /*$trans*/ ctx[2]("nav.fms") + "";
	let t1;
	let a_href_value;
	let current;
	const fms = new AlphaFBox({ $$inline: true });

	const block = {
		c: function create() {
			div = element("div");
			a = element("a");
			create_component(fms.$$.fragment);
			t0 = space();
			span = element("span");
			t1 = text(t1_value);
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", {});
			var div_nodes = children(div);
			a = claim_element(div_nodes, "A", { class: true, href: true });
			var a_nodes = children(a);
			claim_component(fms.$$.fragment, a_nodes);
			t0 = claim_space(a_nodes);
			span = claim_element(a_nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			t1 = claim_text(span_nodes, t1_value);
			span_nodes.forEach(detach_dev);
			a_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "svelte-trrpqq");
			add_location(span, file$n, 180, 14, 4099);
			attr_dev(a, "class", "no-a svelte-trrpqq");

			attr_dev(a, "href", a_href_value = signalListUrl({
				lang: /*$lang*/ ctx[1],
				type: "fm",
				countryCode: /*$countryCode*/ ctx[4]
			}));

			add_location(a, file$n, 172, 12, 3879);
			add_location(div, file$n, 171, 10, 3861);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, a);
			mount_component(fms, a, null);
			append_dev(a, t0);
			append_dev(a, span);
			append_dev(span, t1);
			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty & /*$trans*/ 4) && t1_value !== (t1_value = /*$trans*/ ctx[2]("nav.fms") + "")) set_data_dev(t1, t1_value);

			if (!current || dirty & /*$lang, $countryCode*/ 18 && a_href_value !== (a_href_value = signalListUrl({
				lang: /*$lang*/ ctx[1],
				type: "fm",
				countryCode: /*$countryCode*/ ctx[4]
			}))) {
				attr_dev(a, "href", a_href_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(fms.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(fms.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(fms);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(171:8) {#if !$country || ($country && $country.fmCount)}",
		ctx
	});

	return block;
}

// (186:8) {#if !$country || ($country && $country.amCount)}
function create_if_block$4(ctx) {
	let div;
	let a;
	let t0;
	let span;
	let t1_value = /*$trans*/ ctx[2]("nav.ams") + "";
	let t1;
	let a_href_value;
	let current;
	const ams = new AlphaACircle({ $$inline: true });

	const block = {
		c: function create() {
			div = element("div");
			a = element("a");
			create_component(ams.$$.fragment);
			t0 = space();
			span = element("span");
			t1 = text(t1_value);
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", {});
			var div_nodes = children(div);
			a = claim_element(div_nodes, "A", { class: true, href: true });
			var a_nodes = children(a);
			claim_component(ams.$$.fragment, a_nodes);
			t0 = claim_space(a_nodes);
			span = claim_element(a_nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			t1 = claim_text(span_nodes, t1_value);
			span_nodes.forEach(detach_dev);
			a_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "svelte-trrpqq");
			add_location(span, file$n, 195, 14, 4487);
			attr_dev(a, "class", "no-a svelte-trrpqq");

			attr_dev(a, "href", a_href_value = signalListUrl({
				lang: /*$lang*/ ctx[1],
				type: "am",
				countryCode: /*$countryCode*/ ctx[4]
			}));

			add_location(a, file$n, 187, 12, 4267);
			add_location(div, file$n, 186, 10, 4249);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, a);
			mount_component(ams, a, null);
			append_dev(a, t0);
			append_dev(a, span);
			append_dev(span, t1);
			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty & /*$trans*/ 4) && t1_value !== (t1_value = /*$trans*/ ctx[2]("nav.ams") + "")) set_data_dev(t1, t1_value);

			if (!current || dirty & /*$lang, $countryCode*/ 18 && a_href_value !== (a_href_value = signalListUrl({
				lang: /*$lang*/ ctx[1],
				type: "am",
				countryCode: /*$countryCode*/ ctx[4]
			}))) {
				attr_dev(a, "href", a_href_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(ams.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(ams.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(ams);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(186:8) {#if !$country || ($country && $country.amCount)}",
		ctx
	});

	return block;
}

function create_fragment$n(ctx) {
	let nav;
	let t0;
	let div10;
	let div1;
	let div0;
	let t1;
	let a0;
	let t2;
	let span0;
	let t3;
	let a0_href_value;
	let t4;
	let div9;
	let div3;
	let div2;
	let a1;
	let t5;
	let span1;
	let t6_value = /*$trans*/ ctx[2]("nav.recents") + "";
	let t6;
	let a1_href_value;
	let t7;
	let div5;
	let div4;
	let a2;
	let t8;
	let span2;
	let t9_value = /*$trans*/ ctx[2]("nav.countries") + "";
	let t9;
	let a2_href_value;
	let t10;
	let div6;
	let t11;
	let t12;
	let div8;
	let div7;
	let a3;
	let t13;
	let span3;
	let t14_value = /*$trans*/ ctx[2]("nav.langs") + "";
	let t14;
	let a3_href_value;
	let current;
	let dispose;
	let if_block0 = /*$navOpen*/ ctx[0] && create_if_block_2$2(ctx);
	const close = new ChevronLeft({ $$inline: true });
	const recents = new Timelapse({ $$inline: true });
	const countries = new Earth({ $$inline: true });
	let if_block1 = (!/*$country*/ ctx[3] || /*$country*/ ctx[3] && /*$country*/ ctx[3].fmCount) && create_if_block_1$2(ctx);
	let if_block2 = (!/*$country*/ ctx[3] || /*$country*/ ctx[3] && /*$country*/ ctx[3].amCount) && create_if_block$4(ctx);
	const langs = new Translate({ $$inline: true });

	const block = {
		c: function create() {
			nav = element("nav");
			if (if_block0) if_block0.c();
			t0 = space();
			div10 = element("div");
			div1 = element("div");
			div0 = element("div");
			create_component(close.$$.fragment);
			t1 = space();
			a0 = element("a");
			t2 = text("openradio\n        ");
			span0 = element("span");
			t3 = text(".app");
			t4 = space();
			div9 = element("div");
			div3 = element("div");
			div2 = element("div");
			a1 = element("a");
			create_component(recents.$$.fragment);
			t5 = space();
			span1 = element("span");
			t6 = text(t6_value);
			t7 = space();
			div5 = element("div");
			div4 = element("div");
			a2 = element("a");
			create_component(countries.$$.fragment);
			t8 = space();
			span2 = element("span");
			t9 = text(t9_value);
			t10 = space();
			div6 = element("div");
			if (if_block1) if_block1.c();
			t11 = space();
			if (if_block2) if_block2.c();
			t12 = space();
			div8 = element("div");
			div7 = element("div");
			a3 = element("a");
			create_component(langs.$$.fragment);
			t13 = space();
			span3 = element("span");
			t14 = text(t14_value);
			this.h();
		},
		l: function claim(nodes) {
			nav = claim_element(nodes, "NAV", { class: true });
			var nav_nodes = children(nav);
			if (if_block0) if_block0.l(nav_nodes);
			t0 = claim_space(nav_nodes);
			div10 = claim_element(nav_nodes, "DIV", { class: true });
			var div10_nodes = children(div10);
			div1 = claim_element(div10_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			claim_component(close.$$.fragment, div0_nodes);
			div0_nodes.forEach(detach_dev);
			t1 = claim_space(div1_nodes);
			a0 = claim_element(div1_nodes, "A", { class: true, href: true });
			var a0_nodes = children(a0);
			t2 = claim_text(a0_nodes, "openradio\n        ");
			span0 = claim_element(a0_nodes, "SPAN", { class: true });
			var span0_nodes = children(span0);
			t3 = claim_text(span0_nodes, ".app");
			span0_nodes.forEach(detach_dev);
			a0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t4 = claim_space(div10_nodes);
			div9 = claim_element(div10_nodes, "DIV", { class: true });
			var div9_nodes = children(div9);
			div3 = claim_element(div9_nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			div2 = claim_element(div3_nodes, "DIV", {});
			var div2_nodes = children(div2);
			a1 = claim_element(div2_nodes, "A", { class: true, href: true });
			var a1_nodes = children(a1);
			claim_component(recents.$$.fragment, a1_nodes);
			t5 = claim_space(a1_nodes);
			span1 = claim_element(a1_nodes, "SPAN", { class: true });
			var span1_nodes = children(span1);
			t6 = claim_text(span1_nodes, t6_value);
			span1_nodes.forEach(detach_dev);
			a1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			t7 = claim_space(div9_nodes);
			div5 = claim_element(div9_nodes, "DIV", { class: true });
			var div5_nodes = children(div5);
			div4 = claim_element(div5_nodes, "DIV", {});
			var div4_nodes = children(div4);
			a2 = claim_element(div4_nodes, "A", { class: true, href: true });
			var a2_nodes = children(a2);
			claim_component(countries.$$.fragment, a2_nodes);
			t8 = claim_space(a2_nodes);
			span2 = claim_element(a2_nodes, "SPAN", { class: true });
			var span2_nodes = children(span2);
			t9 = claim_text(span2_nodes, t9_value);
			span2_nodes.forEach(detach_dev);
			a2_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			div5_nodes.forEach(detach_dev);
			t10 = claim_space(div9_nodes);
			div6 = claim_element(div9_nodes, "DIV", { class: true });
			var div6_nodes = children(div6);
			if (if_block1) if_block1.l(div6_nodes);
			t11 = claim_space(div6_nodes);
			if (if_block2) if_block2.l(div6_nodes);
			div6_nodes.forEach(detach_dev);
			t12 = claim_space(div9_nodes);
			div8 = claim_element(div9_nodes, "DIV", { class: true });
			var div8_nodes = children(div8);
			div7 = claim_element(div8_nodes, "DIV", { class: true });
			var div7_nodes = children(div7);
			a3 = claim_element(div7_nodes, "A", { class: true, href: true });
			var a3_nodes = children(a3);
			claim_component(langs.$$.fragment, a3_nodes);
			t13 = claim_space(a3_nodes);
			span3 = claim_element(a3_nodes, "SPAN", { class: true });
			var span3_nodes = children(span3);
			t14 = claim_text(span3_nodes, t14_value);
			span3_nodes.forEach(detach_dev);
			a3_nodes.forEach(detach_dev);
			div7_nodes.forEach(detach_dev);
			div8_nodes.forEach(detach_dev);
			div9_nodes.forEach(detach_dev);
			div10_nodes.forEach(detach_dev);
			nav_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "close svelte-trrpqq");
			add_location(div0, file$n, 133, 6, 2884);
			attr_dev(span0, "class", "svelte-trrpqq");
			add_location(span0, file$n, 138, 8, 3037);
			attr_dev(a0, "class", "no-a");
			attr_dev(a0, "href", a0_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }));
			add_location(a0, file$n, 136, 6, 2961);
			attr_dev(div1, "class", "title svelte-trrpqq");
			add_location(div1, file$n, 132, 4, 2858);
			attr_dev(span1, "class", "svelte-trrpqq");
			add_location(span1, file$n, 148, 12, 3253);
			attr_dev(a1, "class", "no-a svelte-trrpqq");
			attr_dev(a1, "href", a1_href_value = recentsUrl({ lang: /*$lang*/ ctx[1] }));
			add_location(a1, file$n, 146, 10, 3165);
			add_location(div2, file$n, 145, 8, 3149);
			attr_dev(div3, "class", "group svelte-trrpqq");
			add_location(div3, file$n, 144, 6, 3121);
			attr_dev(span2, "class", "svelte-trrpqq");
			add_location(span2, file$n, 156, 12, 3471);
			attr_dev(a2, "class", "no-a svelte-trrpqq");
			attr_dev(a2, "href", a2_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }));
			add_location(a2, file$n, 154, 10, 3383);
			add_location(div4, file$n, 153, 8, 3367);
			attr_dev(div5, "class", "group svelte-trrpqq");
			add_location(div5, file$n, 152, 6, 3339);
			attr_dev(div6, "class", "group svelte-trrpqq");
			add_location(div6, file$n, 169, 6, 3773);
			attr_dev(span3, "class", "svelte-trrpqq");
			add_location(span3, file$n, 206, 12, 4772);
			attr_dev(a3, "class", "no-a svelte-trrpqq");
			attr_dev(a3, "href", a3_href_value = langsUrl({ lang: /*$lang*/ ctx[1] }));
			add_location(a3, file$n, 204, 10, 4688);
			attr_dev(div7, "class", "langs svelte-trrpqq");
			add_location(div7, file$n, 203, 8, 4658);
			attr_dev(div8, "class", "group langs svelte-trrpqq");
			add_location(div8, file$n, 202, 6, 4624);
			attr_dev(div9, "class", "content scrollbar svelte-trrpqq");
			add_location(div9, file$n, 142, 4, 3082);
			attr_dev(div10, "class", "menu svelte-trrpqq");
			add_location(div10, file$n, 131, 2, 2812);
			attr_dev(nav, "class", "nav svelte-trrpqq");
			toggle_class(nav, "open", /*$navOpen*/ ctx[0]);
			add_location(nav, file$n, 124, 0, 2645);
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);
			if (if_block0) if_block0.m(nav, null);
			append_dev(nav, t0);
			append_dev(nav, div10);
			append_dev(div10, div1);
			append_dev(div1, div0);
			mount_component(close, div0, null);
			append_dev(div1, t1);
			append_dev(div1, a0);
			append_dev(a0, t2);
			append_dev(a0, span0);
			append_dev(span0, t3);
			append_dev(div10, t4);
			append_dev(div10, div9);
			append_dev(div9, div3);
			append_dev(div3, div2);
			append_dev(div2, a1);
			mount_component(recents, a1, null);
			append_dev(a1, t5);
			append_dev(a1, span1);
			append_dev(span1, t6);
			append_dev(div9, t7);
			append_dev(div9, div5);
			append_dev(div5, div4);
			append_dev(div4, a2);
			mount_component(countries, a2, null);
			append_dev(a2, t8);
			append_dev(a2, span2);
			append_dev(span2, t9);
			append_dev(div9, t10);
			append_dev(div9, div6);
			if (if_block1) if_block1.m(div6, null);
			append_dev(div6, t11);
			if (if_block2) if_block2.m(div6, null);
			append_dev(div9, t12);
			append_dev(div9, div8);
			append_dev(div8, div7);
			append_dev(div7, a3);
			mount_component(langs, a3, null);
			append_dev(a3, t13);
			append_dev(a3, span3);
			append_dev(span3, t14);
			current = true;

			dispose = [
				listen_dev(div0, "click", /*closeNav*/ ctx[6], false, false, false),
				listen_dev(div10, "click", /*handleClick*/ ctx[11], false, false, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if (/*$navOpen*/ ctx[0]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_2$2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(nav, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*$lang*/ 2 && a0_href_value !== (a0_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }))) {
				attr_dev(a0, "href", a0_href_value);
			}

			if ((!current || dirty & /*$trans*/ 4) && t6_value !== (t6_value = /*$trans*/ ctx[2]("nav.recents") + "")) set_data_dev(t6, t6_value);

			if (!current || dirty & /*$lang*/ 2 && a1_href_value !== (a1_href_value = recentsUrl({ lang: /*$lang*/ ctx[1] }))) {
				attr_dev(a1, "href", a1_href_value);
			}

			if ((!current || dirty & /*$trans*/ 4) && t9_value !== (t9_value = /*$trans*/ ctx[2]("nav.countries") + "")) set_data_dev(t9, t9_value);

			if (!current || dirty & /*$lang*/ 2 && a2_href_value !== (a2_href_value = indexUrl({ lang: /*$lang*/ ctx[1] }))) {
				attr_dev(a2, "href", a2_href_value);
			}

			if (!/*$country*/ ctx[3] || /*$country*/ ctx[3] && /*$country*/ ctx[3].fmCount) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_1$2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div6, t11);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!/*$country*/ ctx[3] || /*$country*/ ctx[3] && /*$country*/ ctx[3].amCount) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block$4(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div6, null);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if ((!current || dirty & /*$trans*/ 4) && t14_value !== (t14_value = /*$trans*/ ctx[2]("nav.langs") + "")) set_data_dev(t14, t14_value);

			if (!current || dirty & /*$lang*/ 2 && a3_href_value !== (a3_href_value = langsUrl({ lang: /*$lang*/ ctx[1] }))) {
				attr_dev(a3, "href", a3_href_value);
			}

			if (dirty & /*$navOpen*/ 1) {
				toggle_class(nav, "open", /*$navOpen*/ ctx[0]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(close.$$.fragment, local);
			transition_in(recents.$$.fragment, local);
			transition_in(countries.$$.fragment, local);
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(langs.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(close.$$.fragment, local);
			transition_out(recents.$$.fragment, local);
			transition_out(countries.$$.fragment, local);
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(langs.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
			if (if_block0) if_block0.d();
			destroy_component(close);
			destroy_component(recents);
			destroy_component(countries);
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			destroy_component(langs);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$n.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$n($$self, $$props, $$invalidate) {
	let $navOpen;
	let $lang;
	let $trans;
	let $country;
	let $countryCode;
	const { page } = stores$1$1();
	const { navOpen, closeNav, openNav } = getContext(DASH);
	validate_store(navOpen, "navOpen");
	component_subscribe($$self, navOpen, value => $$invalidate(0, $navOpen = value));
	const { lang, trans, countryCode, country } = stores();
	validate_store(lang, "lang");
	component_subscribe($$self, lang, value => $$invalidate(1, $lang = value));
	validate_store(trans, "trans");
	component_subscribe($$self, trans, value => $$invalidate(2, $trans = value));
	validate_store(countryCode, "countryCode");
	component_subscribe($$self, countryCode, value => $$invalidate(4, $countryCode = value));
	validate_store(country, "country");
	component_subscribe($$self, country, value => $$invalidate(3, $country = value));

	const handleClick = event => {
		let target = event.target;

		do {
			if (target.tagName.toLowerCase() === "a") {
				navOpen.set(false);
				break;
			}
		} while (target = target.parentElement);
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		if ("$navOpen" in $$props) navOpen.set($navOpen = $$props.$navOpen);
		if ("$lang" in $$props) lang.set($lang = $$props.$lang);
		if ("$trans" in $$props) trans.set($trans = $$props.$trans);
		if ("$country" in $$props) country.set($country = $$props.$country);
		if ("$countryCode" in $$props) countryCode.set($countryCode = $$props.$countryCode);
	};

	return [
		$navOpen,
		$lang,
		$trans,
		$country,
		$countryCode,
		navOpen,
		closeNav,
		lang,
		trans,
		countryCode,
		country,
		handleClick
	];
}

class Nav extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Nav",
			options,
			id: create_fragment$n.name
		});
	}
}

let player = null;

const setPlayer = (pl) => player = pl;

const getPlayer = () => player;

/* src/Components/Dashboard.svelte generated by Svelte v3.18.2 */
const file$o = "src/Components/Dashboard.svelte";

function create_fragment$o(ctx) {
	let div1;
	let t0;
	let main;
	let t1;
	let t2;
	let t3;
	let div0;
	let ins;
	let current;
	const topbar = new Topbar({ $$inline: true });
	const default_slot_template = /*$$slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
	const nav = new Nav({ $$inline: true });
	let player_1_props = {};
	const player_1 = new Player({ props: player_1_props, $$inline: true });
	/*player_1_binding*/ ctx[4](player_1);

	const block = {
		c: function create() {
			div1 = element("div");
			create_component(topbar.$$.fragment);
			t0 = space();
			main = element("main");
			if (default_slot) default_slot.c();
			t1 = space();
			create_component(nav.$$.fragment);
			t2 = space();
			create_component(player_1.$$.fragment);
			t3 = space();
			div0 = element("div");
			ins = element("ins");
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			claim_component(topbar.$$.fragment, div1_nodes);
			t0 = claim_space(div1_nodes);
			main = claim_element(div1_nodes, "MAIN", { class: true });
			var main_nodes = children(main);
			if (default_slot) default_slot.l(main_nodes);
			main_nodes.forEach(detach_dev);
			t1 = claim_space(div1_nodes);
			claim_component(nav.$$.fragment, div1_nodes);
			t2 = claim_space(div1_nodes);
			claim_component(player_1.$$.fragment, div1_nodes);
			t3 = claim_space(div1_nodes);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);

			ins = claim_element(div0_nodes, "INS", {
				class: true,
				style: true,
				"data-ad-client": true,
				"data-ad-slot": true,
				"data-ad-format": true,
				"data-adtest": true,
				"data-full-width-responsive": true
			});

			var ins_nodes = children(ins);
			ins_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(main, "class", "main");
			add_location(main, file$o, 57, 2, 1210);
			attr_dev(ins, "class", "adsbygoogle svelte-14mwm9u");
			set_style(ins, "display", "block");
			attr_dev(ins, "data-ad-client", "ca-pub-6229656373494263");
			attr_dev(ins, "data-ad-slot", "7901569070");
			attr_dev(ins, "data-ad-format", "auto");
			attr_dev(ins, "data-adtest", "on");
			attr_dev(ins, "data-full-width-responsive", "true");
			add_location(ins, file$o, 63, 4, 1322);
			attr_dev(div0, "class", "or-adbar svelte-14mwm9u");
			add_location(div0, file$o, 62, 2, 1295);
			attr_dev(div1, "class", "dashboard svelte-14mwm9u");
			add_location(div1, file$o, 55, 0, 1172);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			mount_component(topbar, div1, null);
			append_dev(div1, t0);
			append_dev(div1, main);

			if (default_slot) {
				default_slot.m(main, null);
			}

			append_dev(div1, t1);
			mount_component(nav, div1, null);
			append_dev(div1, t2);
			mount_component(player_1, div1, null);
			append_dev(div1, t3);
			append_dev(div1, div0);
			append_dev(div0, ins);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
			}

			const player_1_changes = {};
			player_1.$set(player_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(topbar.$$.fragment, local);
			transition_in(default_slot, local);
			transition_in(nav.$$.fragment, local);
			transition_in(player_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(topbar.$$.fragment, local);
			transition_out(default_slot, local);
			transition_out(nav.$$.fragment, local);
			transition_out(player_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			destroy_component(topbar);
			if (default_slot) default_slot.d(detaching);
			destroy_component(nav);
			/*player_1_binding*/ ctx[4](null);
			destroy_component(player_1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$o.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$o($$self, $$props, $$invalidate) {
	const navOpen = writable(false);

	setContext(DASH, {
		navOpen,
		closeNav: () => navOpen.set(false),
		openNav: () => navOpen.set(true),
		toggleNav: () => navOpen.update(b => !b)
	});

	let player;
	let { $$slots = {}, $$scope } = $$props;

	function player_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(0, player = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		if ("player" in $$props) $$invalidate(0, player = $$props.player);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*player*/ 1) {
			 setPlayer(player);
		}
	};

	return [player, navOpen, $$scope, $$slots, player_1_binding];
}

class Dashboard extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$o, create_fragment$o, safe_not_equal, { navOpen: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Dashboard",
			options,
			id: create_fragment$o.name
		});
	}

	get navOpen() {
		return this.$$.ctx[1];
	}

	set navOpen(value) {
		throw new Error("<Dashboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Components/Alternates.svelte generated by Svelte v3.18.2 */
const file$p = "src/Components/Alternates.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

// (21:2) {#each langs as lang}
function create_each_block(ctx) {
	let link;
	let link_hreflang_value;
	let link_href_value;

	const block = {
		c: function create() {
			link = element("link");
			this.h();
		},
		l: function claim(nodes) {
			link = claim_element(nodes, "LINK", { rel: true, hreflang: true, href: true });
			this.h();
		},
		h: function hydrate() {
			attr_dev(link, "rel", "alternate");
			attr_dev(link, "hreflang", link_hreflang_value = /*lang*/ ctx[4].lang);
			attr_dev(link, "href", link_href_value = /*lang*/ ctx[4].url);
			add_location(link, file$p, 21, 4, 532);
		},
		m: function mount(target, anchor) {
			insert_dev(target, link, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*langs*/ 1 && link_hreflang_value !== (link_hreflang_value = /*lang*/ ctx[4].lang)) {
				attr_dev(link, "hreflang", link_hreflang_value);
			}

			if (dirty & /*langs*/ 1 && link_href_value !== (link_href_value = /*lang*/ ctx[4].url)) {
				attr_dev(link, "href", link_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(link);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(21:2) {#each langs as lang}",
		ctx
	});

	return block;
}

function create_fragment$p(ctx) {
	let each_1_anchor;
	let each_value = /*langs*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all("[data-svelte=\"svelte-1gyr4co\"]", document.head);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(head_nodes);
			}

			each_1_anchor = empty();
			head_nodes.forEach(detach_dev);
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(document.head, null);
			}

			append_dev(document.head, each_1_anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*langs*/ 1) {
				each_value = /*langs*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$p.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$p($$self, $$props, $$invalidate) {
	let $page;
	const { page } = stores$1$1();
	validate_store(page, "page");
	component_subscribe($$self, page, value => $$invalidate(2, $page = value));
	const { countryCode } = stores();

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		if ("langs" in $$props) $$invalidate(0, langs = $$props.langs);
		if ("$page" in $$props) page.set($page = $$props.$page);
	};

	let langs;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$page*/ 4) {
			 $$invalidate(0, langs = Object.values(map).map(lang => {
				return {
					url: canonical("/" + lang.code + $page.path.slice(3)),
					//lang: lang.code + ($countryCode ? ("-" + $countryCode.toUpperCase()) : "")
					lang: lang.code
				};
			}));
		}
	};

	return [langs, page];
}

class Alternates extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Alternates",
			options,
			id: create_fragment$p.name
		});
	}
}

/* src/routes/_layout.svelte generated by Svelte v3.18.2 */

// (17:0) <Dashboard>
function create_default_slot(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(17:0) <Dashboard>",
		ctx
	});

	return block;
}

function create_fragment$q(ctx) {
	let t;
	let current;
	const alternates = new Alternates({ $$inline: true });

	const dashboard = new Dashboard({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(alternates.$$.fragment);
			t = space();
			create_component(dashboard.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(alternates.$$.fragment, nodes);
			t = claim_space(nodes);
			claim_component(dashboard.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(alternates, target, anchor);
			insert_dev(target, t, anchor);
			mount_component(dashboard, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const dashboard_changes = {};

			if (dirty & /*$$scope*/ 64) {
				dashboard_changes.$$scope = { dirty, ctx };
			}

			dashboard.$set(dashboard_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(alternates.$$.fragment, local);
			transition_in(dashboard.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(alternates.$$.fragment, local);
			transition_out(dashboard.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(alternates, detaching);
			if (detaching) detach_dev(t);
			destroy_component(dashboard, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$q.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$q($$self, $$props, $$invalidate) {
	const { page, session } = stores$1$1();
	const { lang, trans, countryCode } = stores();
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		
	};

	return [page, session, lang, trans, countryCode, $$slots, $$scope];
}

class Layout extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Layout",
			options,
			id: create_fragment$q.name
		});
	}
}

/* src/routes/_error.svelte generated by Svelte v3.18.2 */

const { Error: Error_1 } = globals;
const file$q = "src/routes/_error.svelte";

function create_fragment$r(ctx) {
	let div0;
	let t0;
	let t1;
	let div1;
	let t2_value = /*error*/ ctx[1].message + "";
	let t2;

	const block = {
		c: function create() {
			div0 = element("div");
			t0 = text(/*status*/ ctx[0]);
			t1 = space();
			div1 = element("div");
			t2 = text(t2_value);
			this.h();
		},
		l: function claim(nodes) {
			div0 = claim_element(nodes, "DIV", {});
			var div0_nodes = children(div0);
			t0 = claim_text(div0_nodes, /*status*/ ctx[0]);
			div0_nodes.forEach(detach_dev);
			t1 = claim_space(nodes);
			div1 = claim_element(nodes, "DIV", {});
			var div1_nodes = children(div1);
			t2 = claim_text(div1_nodes, t2_value);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			add_location(div0, file$q, 5, 0, 61);
			add_location(div1, file$q, 9, 0, 86);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, t0);
			insert_dev(target, t1, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, t2);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*status*/ 1) set_data_dev(t0, /*status*/ ctx[0]);
			if (dirty & /*error*/ 2 && t2_value !== (t2_value = /*error*/ ctx[1].message + "")) set_data_dev(t2, t2_value);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$r.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$r($$self, $$props, $$invalidate) {
	let { status } = $$props;
	let { error } = $$props;
	const writable_props = ["status", "error"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("status" in $$props) $$invalidate(0, status = $$props.status);
		if ("error" in $$props) $$invalidate(1, error = $$props.error);
	};

	$$self.$capture_state = () => {
		return { status, error };
	};

	$$self.$inject_state = $$props => {
		if ("status" in $$props) $$invalidate(0, status = $$props.status);
		if ("error" in $$props) $$invalidate(1, error = $$props.error);
	};

	return [status, error];
}

class Error$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$r, create_fragment$r, safe_not_equal, { status: 0, error: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Error",
			options,
			id: create_fragment$r.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*status*/ ctx[0] === undefined && !("status" in props)) {
			console.warn("<Error> was created without expected prop 'status'");
		}

		if (/*error*/ ctx[1] === undefined && !("error" in props)) {
			console.warn("<Error> was created without expected prop 'error'");
		}
	}

	get status() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.18.2 */

const { Error: Error_1$1 } = globals;

// (21:1) {:else}
function create_else_block$3(ctx) {
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*level1*/ ctx[4].props];
	var switch_value = /*level1*/ ctx[4].component;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		l: function claim(nodes) {
			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*level1*/ 16)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*level1*/ ctx[4].props)])
			: {};

			if (switch_value !== (switch_value = /*level1*/ ctx[4].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$3.name,
		type: "else",
		source: "(21:1) {:else}",
		ctx
	});

	return block;
}

// (19:1) {#if error}
function create_if_block$5(ctx) {
	let current;

	const error_1 = new Error$1({
			props: {
				error: /*error*/ ctx[0],
				status: /*status*/ ctx[1]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(error_1.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(error_1.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(error_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const error_1_changes = {};
			if (dirty & /*error*/ 1) error_1_changes.error = /*error*/ ctx[0];
			if (dirty & /*status*/ 2) error_1_changes.status = /*status*/ ctx[1];
			error_1.$set(error_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(error_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(19:1) {#if error}",
		ctx
	});

	return block;
}

// (18:0) <Layout segment="{segments[0]}" {...level0.props}>
function create_default_slot$1(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$5, create_else_block$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*error*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(18:0) <Layout segment=\\\"{segments[0]}\\\" {...level0.props}>",
		ctx
	});

	return block;
}

function create_fragment$s(ctx) {
	let current;
	const layout_spread_levels = [{ segment: /*segments*/ ctx[2][0] }, /*level0*/ ctx[3].props];

	let layout_props = {
		$$slots: { default: [create_default_slot$1] },
		$$scope: { ctx }
	};

	for (let i = 0; i < layout_spread_levels.length; i += 1) {
		layout_props = assign(layout_props, layout_spread_levels[i]);
	}

	const layout = new Layout({ props: layout_props, $$inline: true });

	const block = {
		c: function create() {
			create_component(layout.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(layout.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(layout, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const layout_changes = (dirty & /*segments, level0*/ 12)
			? get_spread_update(layout_spread_levels, [
					dirty & /*segments*/ 4 && { segment: /*segments*/ ctx[2][0] },
					dirty & /*level0*/ 8 && get_spread_object(/*level0*/ ctx[3].props)
				])
			: {};

			if (dirty & /*$$scope, error, status, level1*/ 83) {
				layout_changes.$$scope = { dirty, ctx };
			}

			layout.$set(layout_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(layout.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(layout.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(layout, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$s.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$s($$self, $$props, $$invalidate) {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	setContext(CONTEXT_KEY, stores);
	const writable_props = ["stores", "error", "status", "segments", "level0", "level1"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("stores" in $$props) $$invalidate(5, stores = $$props.stores);
		if ("error" in $$props) $$invalidate(0, error = $$props.error);
		if ("status" in $$props) $$invalidate(1, status = $$props.status);
		if ("segments" in $$props) $$invalidate(2, segments = $$props.segments);
		if ("level0" in $$props) $$invalidate(3, level0 = $$props.level0);
		if ("level1" in $$props) $$invalidate(4, level1 = $$props.level1);
	};

	$$self.$capture_state = () => {
		return {
			stores,
			error,
			status,
			segments,
			level0,
			level1
		};
	};

	$$self.$inject_state = $$props => {
		if ("stores" in $$props) $$invalidate(5, stores = $$props.stores);
		if ("error" in $$props) $$invalidate(0, error = $$props.error);
		if ("status" in $$props) $$invalidate(1, status = $$props.status);
		if ("segments" in $$props) $$invalidate(2, segments = $$props.segments);
		if ("level0" in $$props) $$invalidate(3, level0 = $$props.level0);
		if ("level1" in $$props) $$invalidate(4, level1 = $$props.level1);
	};

	return [error, status, segments, level0, level1, stores];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
			stores: 5,
			error: 0,
			status: 1,
			segments: 2,
			level0: 3,
			level1: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$s.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*stores*/ ctx[5] === undefined && !("stores" in props)) {
			console.warn("<App> was created without expected prop 'stores'");
		}

		if (/*error*/ ctx[0] === undefined && !("error" in props)) {
			console.warn("<App> was created without expected prop 'error'");
		}

		if (/*status*/ ctx[1] === undefined && !("status" in props)) {
			console.warn("<App> was created without expected prop 'status'");
		}

		if (/*segments*/ ctx[2] === undefined && !("segments" in props)) {
			console.warn("<App> was created without expected prop 'segments'");
		}

		if (/*level0*/ ctx[3] === undefined && !("level0" in props)) {
			console.warn("<App> was created without expected prop 'level0'");
		}
	}

	get stores() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stores(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get status() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get segments() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segments(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level0() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level0(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level1() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level1(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

// This file is generated by Sapper — do not edit it!

const ignore = [];

const components = [
	{
		js: () => import('./index.2ebacf08.js'),
		css: ["index.2ebacf08.css","client.c54ac804.css","Page.8d242014.css"]
	},
	{
		js: () => import('./languages.8b431fd4.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","LinkListBox.4c078f97.css"]
	},
	{
		js: () => import('./recents.6b0cc4de.js'),
		css: ["recents.6b0cc4de.css","client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css"]
	},
	{
		js: () => import('./index.659946cf.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","LinkListBox.4c078f97.css"]
	},
	{
		js: () => import('./[signalFrec([0-9]+|[0-9]+.[0-9]+)].a91fedb1.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css"]
	},
	{
		js: () => import('./search.d9cd7a11.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css","search.c557f634.css"]
	},
	{
		js: () => import('./index.a186378d.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css"]
	},
	{
		js: () => import('./index.37ae31d1.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","LinkListBox.4c078f97.css"]
	},
	{
		js: () => import('./[signalFrec([0-9]+|[0-9]+.[0-9]+)].0d6a3324.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css"]
	},
	{
		js: () => import('./search.429ed386.js'),
		css: ["client.c54ac804.css","Page.8d242014.css","RadioList.fbf36988.css","search.c557f634.css"]
	},
	{
		js: () => import('./[station].5695ac0b.js'),
		css: ["[station].5695ac0b.css","client.c54ac804.css","Page.8d242014.css"]
	}
];

const routes = (d => [
	{
		// [lang([a-z]{2})]/index.svelte
		pattern: /^\/([a-z]{2})\/?$/,
		parts: [
			{ i: 0, params: match => ({ lang: d(match[1]) }) }
		]
	},

	{
		// [lang([a-z]{2})]/languages.svelte
		pattern: /^\/([a-z]{2})\/languages\/?$/,
		parts: [
			null,
			{ i: 1, params: match => ({ lang: d(match[1]) }) }
		]
	},

	{
		// [lang([a-z]{2})]/recents.svelte
		pattern: /^\/([a-z]{2})\/recents\/?$/,
		parts: [
			null,
			{ i: 2, params: match => ({ lang: d(match[1]) }) }
		]
	},

	{
		// [lang([a-z]{2})]/radio-[signalType(am|fm)]/index.svelte
		pattern: /^\/([a-z]{2})\/radio-(am|fm)\/?$/,
		parts: [
			null,
			{ i: 3, params: match => ({ lang: d(match[1]), signalType: d(match[2]) }) }
		]
	},

	{
		// [lang([a-z]{2})]/radio-[signalType(am|fm)]/[signalFrec([0-9]+|[0-9]+.[0-9]+)].svelte
		pattern: /^\/([a-z]{2})\/radio-(am|fm)\/([0-9]+|[0-9]+.[0-9]+)\/?$/,
		parts: [
			null,
			null,
			{ i: 4, params: match => ({ lang: d(match[1]), signalType: d(match[2]), signalFrec: d(match[3]) }) }
		]
	},

	{
		// [lang([a-z]{2})]/search.svelte
		pattern: /^\/([a-z]{2})\/search\/?$/,
		parts: [
			null,
			{ i: 5, params: match => ({ lang: d(match[1]) }) }
		]
	},

	{
		// [langCountry([a-z]{2}-[a-z]{2})]/index.svelte
		pattern: /^\/([a-z]{2}-[a-z]{2})\/?$/,
		parts: [
			{ i: 6, params: match => ({ langCountry: d(match[1]) }) }
		]
	},

	{
		// [langCountry([a-z]{2}-[a-z]{2})]/radio-[signalType(am|fm)]/index.svelte
		pattern: /^\/([a-z]{2}-[a-z]{2})\/radio-(am|fm)\/?$/,
		parts: [
			null,
			{ i: 7, params: match => ({ langCountry: d(match[1]), signalType: d(match[2]) }) }
		]
	},

	{
		// [langCountry([a-z]{2}-[a-z]{2})]/radio-[signalType(am|fm)]/[signalFrec([0-9]+|[0-9]+.[0-9]+)].svelte
		pattern: /^\/([a-z]{2}-[a-z]{2})\/radio-(am|fm)\/([0-9]+|[0-9]+.[0-9]+)\/?$/,
		parts: [
			null,
			null,
			{ i: 8, params: match => ({ langCountry: d(match[1]), signalType: d(match[2]), signalFrec: d(match[3]) }) }
		]
	},

	{
		// [langCountry([a-z]{2}-[a-z]{2})]/search.svelte
		pattern: /^\/([a-z]{2}-[a-z]{2})\/search\/?$/,
		parts: [
			null,
			{ i: 9, params: match => ({ langCountry: d(match[1]) }) }
		]
	},

	{
		// [langCountry([a-z]{2}-[a-z]{2})]/radio/[station].svelte
		pattern: /^\/([a-z]{2}-[a-z]{2})\/radio\/([^\/]+?)\/?$/,
		parts: [
			null,
			null,
			{ i: 10, params: match => ({ langCountry: d(match[1]), station: d(match[2]) }) }
		]
	}
])(decodeURIComponent);

if (typeof window !== 'undefined') {
	import('./sapper-dev-client.89e34bae.js').then(client => {
		client.connect(10000);
	});
}

function goto(href, opts = { replaceState: false }) {
	const target = select_target(new URL(href, document.baseURI));

	if (target) {
		_history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
		return navigate(target, null).then(() => {});
	}

	location.href = href;
	return new Promise(f => {}); // never resolves
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;

let ready = false;
let root_component;
let current_token;
let root_preloaded;
let current_branch = [];
let current_query = '{}';

const stores$1 = {
	page: writable({}),
	preloading: writable(null),
	session: writable(initial_data && initial_data.session)
};

let $session;
let session_dirty;

stores$1.session.subscribe(async value => {
	$session = value;

	if (!ready) return;
	session_dirty = true;

	const target = select_target(new URL(location.href));

	const token = current_token = {};
	const { redirect, props, branch } = await hydrate_target(target);
	if (token !== current_token) return; // a secondary navigation happened while we were loading

	await render(redirect, branch, props, target.page);
});

let prefetching


 = null;
function set_prefetching(href, promise) {
	prefetching = { href, promise };
}

let target;
function set_target(element) {
	target = element;
}

let uid = 1;
function set_uid(n) {
	uid = n;
}

let cid;
function set_cid(n) {
	cid = n;
}

const _history = typeof history !== 'undefined' ? history : {
	pushState: (state, title, href) => {},
	replaceState: (state, title, href) => {},
	scrollRestoration: ''
};

const scroll_history = {};

function extract_query(search) {
	const query = Object.create(null);
	if (search.length > 0) {
		search.slice(1).split('&').forEach(searchParam => {
			let [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
			if (typeof query[key] === 'string') query[key] = [query[key]];
			if (typeof query[key] === 'object') (query[key] ).push(value);
			else query[key] = value;
		});
	}
	return query;
}

function select_target(url) {
	if (url.origin !== location.origin) return null;
	if (!url.pathname.startsWith(initial_data.baseUrl)) return null;

	let path = url.pathname.slice(initial_data.baseUrl.length);

	if (path === '') {
		path = '/';
	}

	// avoid accidental clashes between server routes and page routes
	if (ignore.some(pattern => pattern.test(path))) return;

	for (let i = 0; i < routes.length; i += 1) {
		const route = routes[i];

		const match = route.pattern.exec(path);

		if (match) {
			const query = extract_query(url.search);
			const part = route.parts[route.parts.length - 1];
			const params = part.params ? part.params(match) : {};

			const page = { host: location.host, path, query, params };

			return { href: url.href, route, match, page };
		}
	}
}

function handle_error(url) {
	const { host, pathname, search } = location;
	const { session, preloaded, status, error } = initial_data;

	if (!root_preloaded) {
		root_preloaded = preloaded && preloaded[0];
	}

	const props = {
		error,
		status,
		session,
		level0: {
			props: root_preloaded
		},
		level1: {
			props: {
				status,
				error
			},
			component: Error$1
		},
		segments: preloaded

	};
	const query = extract_query(search);
	render(null, [], props, { host, path: pathname, query, params: {} });
}

function scroll_state() {
	return {
		x: pageXOffset,
		y: pageYOffset
	};
}

async function navigate(target, id, noscroll, hash) {
	if (id) {
		// popstate or initial navigation
		cid = id;
	} else {
		const current_scroll = scroll_state();

		// clicked on a link. preserve scroll state
		scroll_history[cid] = current_scroll;

		id = cid = ++uid;
		scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
	}

	cid = id;

	if (root_component) stores$1.preloading.set(true);

	const loaded = prefetching && prefetching.href === target.href ?
		prefetching.promise :
		hydrate_target(target);

	prefetching = null;

	const token = current_token = {};
	const { redirect, props, branch } = await loaded;
	if (token !== current_token) return; // a secondary navigation happened while we were loading

	await render(redirect, branch, props, target.page);
	if (document.activeElement) document.activeElement.blur();

	if (!noscroll) {
		let scroll = scroll_history[id];

		if (hash) {
			// scroll is an element id (from a hash), we need to compute y.
			const deep_linked = document.getElementById(hash.slice(1));

			if (deep_linked) {
				scroll = {
					x: 0,
					y: deep_linked.getBoundingClientRect().top
				};
			}
		}

		scroll_history[cid] = scroll;
		if (scroll) scrollTo(scroll.x, scroll.y);
	}
}

async function render(redirect, branch, props, page) {
	if (redirect) return goto(redirect.location, { replaceState: true });

	stores$1.page.set(page);
	stores$1.preloading.set(false);

	if (root_component) {
		root_component.$set(props);
	} else {
		props.stores = {
			page: { subscribe: stores$1.page.subscribe },
			preloading: { subscribe: stores$1.preloading.subscribe },
			session: stores$1.session
		};
		props.level0 = {
			props: await root_preloaded
		};

		// first load — remove SSR'd <head> contents
		const start = document.querySelector('#sapper-head-start');
		const end = document.querySelector('#sapper-head-end');

		if (start && end) {
			while (start.nextSibling !== end) detach$1(start.nextSibling);
			detach$1(start);
			detach$1(end);
		}

		root_component = new App({
			target,
			props,
			hydrate: true
		});
	}

	current_branch = branch;
	current_query = JSON.stringify(page.query);
	ready = true;
	session_dirty = false;
}

function part_changed(i, segment, match, stringified_query) {
	// TODO only check query string changes for preload functions
	// that do in fact depend on it (using static analysis or
	// runtime instrumentation)
	if (stringified_query !== current_query) return true;

	const previous = current_branch[i];

	if (!previous) return false;
	if (segment !== previous.segment) return true;
	if (previous.match) {
		if (JSON.stringify(previous.match.slice(1, i + 2)) !== JSON.stringify(match.slice(1, i + 2))) {
			return true;
		}
	}
}

async function hydrate_target(target)



 {
	const { route, page } = target;
	const segments = page.path.split('/').filter(Boolean);

	let redirect = null;

	const props = { error: null, status: 200, segments: [segments[0]] };

	const preload_context = {
		fetch: (url, opts) => fetch(url, opts),
		redirect: (statusCode, location) => {
			if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
				throw new Error(`Conflicting redirects`);
			}
			redirect = { statusCode, location };
		},
		error: (status, error) => {
			props.error = typeof error === 'string' ? new Error(error) : error;
			props.status = status;
		}
	};

	if (!root_preloaded) {
		root_preloaded = initial_data.preloaded[0] || preload.call(preload_context, {
			host: page.host,
			path: page.path,
			query: page.query,
			params: {}
		}, $session);
	}

	let branch;
	let l = 1;

	try {
		const stringified_query = JSON.stringify(page.query);
		const match = route.pattern.exec(page.path);

		let segment_dirty = false;

		branch = await Promise.all(route.parts.map(async (part, i) => {
			const segment = segments[i];

			if (part_changed(i, segment, match, stringified_query)) segment_dirty = true;

			props.segments[l] = segments[i + 1]; // TODO make this less confusing
			if (!part) return { segment };

			const j = l++;

			if (!session_dirty && !segment_dirty && current_branch[i] && current_branch[i].part === part.i) {
				return current_branch[i];
			}

			segment_dirty = false;

			const { default: component, preload } = await load_component(components[part.i]);

			let preloaded;
			if (ready || !initial_data.preloaded[i + 1]) {
				preloaded = preload
					? await preload.call(preload_context, {
						host: page.host,
						path: page.path,
						query: page.query,
						params: part.params ? part.params(target.match) : {}
					}, $session)
					: {};
			} else {
				preloaded = initial_data.preloaded[i + 1];
			}

			return (props[`level${j}`] = { component, props: preloaded, segment, match, part: part.i });
		}));
	} catch (error) {
		props.error = error;
		props.status = 500;
		branch = [];
	}

	return { redirect, props, branch };
}

function load_css(chunk) {
	const href = `client/${chunk}`;
	if (document.querySelector(`link[href="${href}"]`)) return;

	return new Promise((fulfil, reject) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;

		link.onload = () => fulfil();
		link.onerror = reject;

		document.head.appendChild(link);
	});
}

function load_component(component)


 {
	// TODO this is temporary — once placeholders are
	// always rewritten, scratch the ternary
	const promises = (typeof component.css === 'string' ? [] : component.css.map(load_css));
	promises.unshift(component.js());
	return Promise.all(promises).then(values => values[0]);
}

function detach$1(node) {
	node.parentNode.removeChild(node);
}

function prefetch(href) {
	const target = select_target(new URL(href, document.baseURI));

	if (target) {
		if (!prefetching || href !== prefetching.href) {
			set_prefetching(href, hydrate_target(target));
		}

		return prefetching.promise;
	}
}

function start(opts

) {
	if ('scrollRestoration' in _history) {
		_history.scrollRestoration = 'manual';
	}

	set_target(opts.target);

	addEventListener('click', handle_click);
	addEventListener('popstate', handle_popstate);

	// prefetch
	addEventListener('touchstart', trigger_prefetch);
	addEventListener('mousemove', handle_mousemove);

	return Promise.resolve().then(() => {
		const { hash, href } = location;

		_history.replaceState({ id: uid }, '', href);

		const url = new URL(location.href);

		if (initial_data.error) return handle_error();

		const target = select_target(url);
		if (target) return navigate(target, uid, true, hash);
	});
}

let mousemove_timeout;

function handle_mousemove(event) {
	clearTimeout(mousemove_timeout);
	mousemove_timeout = setTimeout(() => {
		trigger_prefetch(event);
	}, 20);
}

function trigger_prefetch(event) {
	const a = find_anchor(event.target);
	if (!a || a.rel !== 'prefetch') return;

	prefetch(a.href);
}

function handle_click(event) {
	// Adapted from https://github.com/visionmedia/page.js
	// MIT license https://github.com/visionmedia/page.js#license
	if (which(event) !== 1) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey) return;
	if (event.defaultPrevented) return;

	const a = find_anchor(event.target);
	if (!a) return;

	if (!a.href) return;

	// check if link is inside an svg
	// in this case, both href and target are always inside an object
	const svg = typeof a.href === 'object' && a.href.constructor.name === 'SVGAnimatedString';
	const href = String(svg ? (a).href.baseVal : a.href);

	if (href === location.href) {
		if (!location.hash) event.preventDefault();
		return;
	}

	// Ignore if tag has
	// 1. 'download' attribute
	// 2. rel='external' attribute
	if (a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;

	// Ignore if <a> has a target
	if (svg ? (a).target.baseVal : a.target) return;

	const url = new URL(href);

	// Don't handle hash changes
	if (url.pathname === location.pathname && url.search === location.search) return;

	const target = select_target(url);
	if (target) {
		const noscroll = a.hasAttribute('sapper-noscroll');
		navigate(target, null, noscroll, url.hash);
		event.preventDefault();
		_history.pushState({ id: cid }, '', url.href);
	}
}

function which(event) {
	return event.which === null ? event.button : event.which;
}

function find_anchor(node) {
	while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
	return node;
}

function handle_popstate(event) {
	scroll_history[cid] = scroll_state();

	if (event.state) {
		const url = new URL(location.href);
		const target = select_target(url);
		if (target) {
			navigate(target, event.state.id);
		} else {
			location.href = location.href;
		}
	} else {
		// hashchange
		set_uid(uid + 1);
		set_cid(uid);
		_history.replaceState({ id: cid }, '', location.href);
	}
}

const stores$1$1 = () => getContext(CONTEXT_KEY);

start({
	target: document.querySelector('#sapper')
});

export { add_transform as $, component_subscribe as A, canonical as B, create_component as C, claim_component as D, mount_component as E, destroy_component as F, indexUrl as G, text as H, claim_text as I, set_data_dev as J, group_outros as K, check_outros as L, destroy_each as M, CountryFlag as N, countryUrl as O, noop as P, map as Q, langsUrl as R, SvelteComponentDev as S, empty as T, is_function as U, cubicOut as V, StationImage as W, stationUrl as X, svg_element as Y, validate_each_keys as Z, fix_position as _, space as a, create_animation as a0, create_bidirectional_transition as a1, update_keyed_each as a2, fade as a3, Loading as a4, fix_and_outro_and_destroy_block as a5, listen_dev as a6, prevent_default as a7, onMount as a8, recentList as a9, recentsUrl as aa, signalListUrl as ab, signalUrl as ac, assign as ad, exclude_internal_props as ae, get_spread_update as af, get_spread_object as ag, searchUrl as ah, setContext as ai, onDestroy as aj, get_store_value as ak, writable as al, getContext as am, set_style as an, add_resize_listener as ao, binding_callbacks as ap, globals as aq, Play as ar, Pause as as, playerState as at, getPlayer as au, claim_element as b, create_slot as c, dispatch_dev as d, element as e, detach_dev as f, claim_space as g, children as h, init as i, attr_dev as j, add_location as k, append_dev as l, insert_dev as m, get_slot_context as n, get_slot_changes as o, transition_in as p, query_selector_all as q, add_render_callback as r, safe_not_equal as s, toggle_class as t, create_in_transition as u, transition_out as v, fly as w, stores$1$1 as x, stores as y, validate_store as z };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmM1NGFjODA0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3RvcmUvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9zcmMvQ29tcG9uZW50cy9Db3VudHJ5RmxhZy5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3RyaW5nLWZvcm1hdC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pc29iamVjdC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nZXQtdmFsdWUvaW5kZXguanMiLCIuLi8uLi8uLi9zcmMvQ29tbW9uL2kxOG4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2Vhc2luZy9pbmRleC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlLWxheW91dC1hd2FyZS10cmFuc2l0aW9ucy9pbmRleC5tanMiLCIuLi8uLi8uLi9zcmMvQ29tbW9uL3VybHMuanMiLCIuLi8uLi8uLi9zcmMvQ29tcG9uZW50cy9Ub3BiYXJUaXRsZS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL3RyYW5zaXRpb24vaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL1N0b3Jlcy9wbGF5ZXJTdGF0ZS5qcyIsIi4uLy4uLy4uL3NyYy9TdG9yZXMvUGVyc2lzdGVudFN0b3JlLmpzIiwiLi4vLi4vLi4vc3JjL1N0b3Jlcy9yZWNlbnRMaXN0LmpzIiwiLi4vLi4vLi4vc3JjL0NvbXBvbmVudHMvU2xpZGVyLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMvVm9sdW1lT2ZmLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMtMC9kaXN0L1ZvbHVtZVVwLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9Db21wb25lbnRzL1ZvbHVtZS5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvQ29tcG9uZW50cy9TdGF0aW9uSW1hZ2Uuc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS1tYXRlcmlhbC1pY29ucy9QbGF5LnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMvUGF1c2Uuc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS1tYXRlcmlhbC1pY29ucy9DbG9zZS5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvQ29tcG9uZW50cy9Mb2FkaW5nLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9Db21wb25lbnRzL1BsYXllci5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlLW1hdGVyaWFsLWljb25zLTAvZGlzdC9TZWFyY2guc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL0NvbXBvbmVudHMvU2VhcmNoLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMtMC9kaXN0L01lbnUuc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS1tYXRlcmlhbC1pY29ucy0wL2Rpc3QvQ2xvc2Uuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL0NvbXBvbmVudHMvREFTSC5qcyIsIi4uLy4uLy4uL3NyYy9Db21wb25lbnRzL1RvcGJhci5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlLW1hdGVyaWFsLWljb25zLTAvZGlzdC9DaGV2cm9uTGVmdC5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlLW1hdGVyaWFsLWljb25zL1RyYW5zbGF0ZS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlLW1hdGVyaWFsLWljb25zL0VhcnRoLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMvVGltZWxhcHNlLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMvQWxwaGFGQm94LnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtbWF0ZXJpYWwtaWNvbnMvQWxwaGFBQ2lyY2xlLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9Db21wb25lbnRzL05hdi5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvU3RvcmVzL3BsYXllci5qcyIsIi4uLy4uLy4uL3NyYy9Db21wb25lbnRzL0Rhc2hib2FyZC5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvQ29tcG9uZW50cy9BbHRlcm5hdGVzLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvX2xheW91dC5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvcm91dGVzL19lcnJvci5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvbm9kZV9tb2R1bGVzL0BzYXBwZXIvaW50ZXJuYWwvQXBwLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9pbnRlcm5hbC9tYW5pZmVzdC1jbGllbnQubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2FwcC5tanMiLCIuLi8uLi8uLi9zcmMvY2xpZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5vb3AoKSB7IH1cbmNvbnN0IGlkZW50aXR5ID0geCA9PiB4O1xuZnVuY3Rpb24gYXNzaWduKHRhciwgc3JjKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvciAoY29uc3QgayBpbiBzcmMpXG4gICAgICAgIHRhcltrXSA9IHNyY1trXTtcbiAgICByZXR1cm4gdGFyO1xufVxuZnVuY3Rpb24gaXNfcHJvbWlzZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYWRkX2xvY2F0aW9uKGVsZW1lbnQsIGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhcikge1xuICAgIGVsZW1lbnQuX19zdmVsdGVfbWV0YSA9IHtcbiAgICAgICAgbG9jOiB7IGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhciB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJ1bihmbikge1xuICAgIHJldHVybiBmbigpO1xufVxuZnVuY3Rpb24gYmxhbmtfb2JqZWN0KCkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gcnVuX2FsbChmbnMpIHtcbiAgICBmbnMuZm9yRWFjaChydW4pO1xufVxuZnVuY3Rpb24gaXNfZnVuY3Rpb24odGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gc2FmZV9ub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiIHx8ICgoYSAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBhID09PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIG5vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGI7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zdG9yZShzdG9yZSwgbmFtZSkge1xuICAgIGlmIChzdG9yZSAhPSBudWxsICYmIHR5cGVvZiBzdG9yZS5zdWJzY3JpYmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtuYW1lfScgaXMgbm90IGEgc3RvcmUgd2l0aCBhICdzdWJzY3JpYmUnIG1ldGhvZGApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHN1YnNjcmliZShzdG9yZSwgLi4uY2FsbGJhY2tzKSB7XG4gICAgaWYgKHN0b3JlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuICAgIGNvbnN0IHVuc3ViID0gc3RvcmUuc3Vic2NyaWJlKC4uLmNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHVuc3ViLnVuc3Vic2NyaWJlID8gKCkgPT4gdW5zdWIudW5zdWJzY3JpYmUoKSA6IHVuc3ViO1xufVxuZnVuY3Rpb24gZ2V0X3N0b3JlX3ZhbHVlKHN0b3JlKSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIHN1YnNjcmliZShzdG9yZSwgXyA9PiB2YWx1ZSA9IF8pKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gY29tcG9uZW50X3N1YnNjcmliZShjb21wb25lbnQsIHN0b3JlLCBjYWxsYmFjaykge1xuICAgIGNvbXBvbmVudC4kJC5vbl9kZXN0cm95LnB1c2goc3Vic2NyaWJlKHN0b3JlLCBjYWxsYmFjaykpO1xufVxuZnVuY3Rpb24gY3JlYXRlX3Nsb3QoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY3R4ID0gZ2V0X3Nsb3RfY29udGV4dChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKTtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25bMF0oc2xvdF9jdHgpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIHJldHVybiBkZWZpbml0aW9uWzFdICYmIGZuXG4gICAgICAgID8gYXNzaWduKCQkc2NvcGUuY3R4LnNsaWNlKCksIGRlZmluaXRpb25bMV0oZm4oY3R4KSkpXG4gICAgICAgIDogJCRzY29wZS5jdHg7XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jaGFuZ2VzKGRlZmluaXRpb24sICQkc2NvcGUsIGRpcnR5LCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uWzJdICYmIGZuKSB7XG4gICAgICAgIGNvbnN0IGxldHMgPSBkZWZpbml0aW9uWzJdKGZuKGRpcnR5KSk7XG4gICAgICAgIGlmICh0eXBlb2YgJCRzY29wZS5kaXJ0eSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gTWF0aC5tYXgoJCRzY29wZS5kaXJ0eS5sZW5ndGgsIGxldHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSAkJHNjb3BlLmRpcnR5W2ldIHwgbGV0c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQkc2NvcGUuZGlydHkgfCBsZXRzO1xuICAgIH1cbiAgICByZXR1cm4gJCRzY29wZS5kaXJ0eTtcbn1cbmZ1bmN0aW9uIGV4Y2x1ZGVfaW50ZXJuYWxfcHJvcHMocHJvcHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcHJvcHMpXG4gICAgICAgIGlmIChrWzBdICE9PSAnJCcpXG4gICAgICAgICAgICByZXN1bHRba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gb25jZShmbikge1xuICAgIGxldCByYW4gPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKHJhbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gbnVsbF90b19lbXB0eSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9zdG9yZV92YWx1ZShzdG9yZSwgcmV0LCB2YWx1ZSA9IHJldCkge1xuICAgIHN0b3JlLnNldCh2YWx1ZSk7XG4gICAgcmV0dXJuIHJldDtcbn1cbmNvbnN0IGhhc19wcm9wID0gKG9iaiwgcHJvcCkgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG5mdW5jdGlvbiBhY3Rpb25fZGVzdHJveWVyKGFjdGlvbl9yZXN1bHQpIHtcbiAgICByZXR1cm4gYWN0aW9uX3Jlc3VsdCAmJiBpc19mdW5jdGlvbihhY3Rpb25fcmVzdWx0LmRlc3Ryb3kpID8gYWN0aW9uX3Jlc3VsdC5kZXN0cm95IDogbm9vcDtcbn1cblxuY29uc3QgaXNfY2xpZW50ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG5sZXQgbm93ID0gaXNfY2xpZW50XG4gICAgPyAoKSA9PiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcbiAgICA6ICgpID0+IERhdGUubm93KCk7XG5sZXQgcmFmID0gaXNfY2xpZW50ID8gY2IgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNiKSA6IG5vb3A7XG4vLyB1c2VkIGludGVybmFsbHkgZm9yIHRlc3RpbmdcbmZ1bmN0aW9uIHNldF9ub3coZm4pIHtcbiAgICBub3cgPSBmbjtcbn1cbmZ1bmN0aW9uIHNldF9yYWYoZm4pIHtcbiAgICByYWYgPSBmbjtcbn1cblxuY29uc3QgdGFza3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiBydW5fdGFza3Mobm93KSB7XG4gICAgdGFza3MuZm9yRWFjaCh0YXNrID0+IHtcbiAgICAgICAgaWYgKCF0YXNrLmMobm93KSkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICAgICAgdGFzay5mKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodGFza3Muc2l6ZSAhPT0gMClcbiAgICAgICAgcmFmKHJ1bl90YXNrcyk7XG59XG4vKipcbiAqIEZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkhXG4gKi9cbmZ1bmN0aW9uIGNsZWFyX2xvb3BzKCkge1xuICAgIHRhc2tzLmNsZWFyKCk7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdGFzayB0aGF0IHJ1bnMgb24gZWFjaCByYWYgZnJhbWVcbiAqIHVudGlsIGl0IHJldHVybnMgYSBmYWxzeSB2YWx1ZSBvciBpcyBhYm9ydGVkXG4gKi9cbmZ1bmN0aW9uIGxvb3AoY2FsbGJhY2spIHtcbiAgICBsZXQgdGFzaztcbiAgICBpZiAodGFza3Muc2l6ZSA9PT0gMClcbiAgICAgICAgcmFmKHJ1bl90YXNrcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvbWlzZTogbmV3IFByb21pc2UoZnVsZmlsbCA9PiB7XG4gICAgICAgICAgICB0YXNrcy5hZGQodGFzayA9IHsgYzogY2FsbGJhY2ssIGY6IGZ1bGZpbGwgfSk7XG4gICAgICAgIH0pLFxuICAgICAgICBhYm9ydCgpIHtcbiAgICAgICAgICAgIHRhc2tzLmRlbGV0ZSh0YXNrKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFwcGVuZCh0YXJnZXQsIG5vZGUpIHtcbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnQodGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbn1cbmZ1bmN0aW9uIGRldGFjaChub2RlKSB7XG4gICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gZGVzdHJveV9lYWNoKGl0ZXJhdGlvbnMsIGRldGFjaGluZykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaXRlcmF0aW9uc1tpXSlcbiAgICAgICAgICAgIGl0ZXJhdGlvbnNbaV0uZChkZXRhY2hpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGVsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xufVxuZnVuY3Rpb24gZWxlbWVudF9pcyhuYW1lLCBpcykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUsIHsgaXMgfSk7XG59XG5mdW5jdGlvbiBvYmplY3Rfd2l0aG91dF9wcm9wZXJ0aWVzKG9iaiwgZXhjbHVkZSkge1xuICAgIGNvbnN0IHRhcmdldCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhc19wcm9wKG9iaiwgaylcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICYmIGV4Y2x1ZGUuaW5kZXhPZihrKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRhcmdldFtrXSA9IG9ialtrXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gc3ZnX2VsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbmFtZSk7XG59XG5mdW5jdGlvbiB0ZXh0KGRhdGEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG59XG5mdW5jdGlvbiBzcGFjZSgpIHtcbiAgICByZXR1cm4gdGV4dCgnICcpO1xufVxuZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgcmV0dXJuIHRleHQoJycpO1xufVxuZnVuY3Rpb24gbGlzdGVuKG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4gbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHByZXZlbnRfZGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHN0b3BfcHJvcGFnYXRpb24oZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc2VsZihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgIGVsc2UgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKVxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHNldF9hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXyk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAoYXR0cmlidXRlc1trZXldID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmNzc1RleHQgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRvcnNba2V5XSAmJiBkZXNjcmlwdG9yc1trZXldLnNldCkge1xuICAgICAgICAgICAgbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3ZnX2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEobm9kZSwgcHJvcCwgdmFsdWUpIHtcbiAgICBpZiAocHJvcCBpbiBub2RlKSB7XG4gICAgICAgIG5vZGVbcHJvcF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGF0dHIobm9kZSwgcHJvcCwgdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHhsaW5rX2F0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlKGdyb3VwKSB7XG4gICAgY29uc3QgdmFsdWUgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChncm91cFtpXS5jaGVja2VkKVxuICAgICAgICAgICAgdmFsdWUucHVzaChncm91cFtpXS5fX3ZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gdG9fbnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAnJyA/IHVuZGVmaW5lZCA6ICt2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRpbWVfcmFuZ2VzX3RvX2FycmF5KHJhbmdlcykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyYXkucHVzaCh7IHN0YXJ0OiByYW5nZXMuc3RhcnQoaSksIGVuZDogcmFuZ2VzLmVuZChpKSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZnVuY3Rpb24gY2hpbGRyZW4oZWxlbWVudCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBzdmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChqIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IG5vZGUuYXR0cmlidXRlc1tqXTtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBub2Rlcy5zcGxpY2UoaSwgMSlbMF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN2ZyA/IHN2Z19lbGVtZW50KG5hbWUpIDogZWxlbWVudChuYW1lKTtcbn1cbmZ1bmN0aW9uIGNsYWltX3RleHQobm9kZXMsIGRhdGEpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9ICcnICsgZGF0YTtcbiAgICAgICAgICAgIHJldHVybiBub2Rlcy5zcGxpY2UoaSwgMSlbMF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRleHQoZGF0YSk7XG59XG5mdW5jdGlvbiBjbGFpbV9zcGFjZShub2Rlcykge1xuICAgIHJldHVybiBjbGFpbV90ZXh0KG5vZGVzLCAnICcpO1xufVxuZnVuY3Rpb24gc2V0X2RhdGEodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQuZGF0YSAhPT0gZGF0YSlcbiAgICAgICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCB8fCBpbnB1dC52YWx1ZSkge1xuICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5wdXQudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG4gICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQgPyAnaW1wb3J0YW50JyA6ICcnKTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb24oc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHRpb24uX192YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKSB8fCBzZWxlY3Qub3B0aW9uc1swXTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbmZ1bmN0aW9uIGFkZF9yZXNpemVfbGlzdGVuZXIoZWxlbWVudCwgZm4pIHtcbiAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5wb3NpdGlvbiA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgfVxuICAgIGNvbnN0IG9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIG9iamVjdC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgb3ZlcmZsb3c6IGhpZGRlbjsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xOycpO1xuICAgIG9iamVjdC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICBvYmplY3QudHlwZSA9ICd0ZXh0L2h0bWwnO1xuICAgIG9iamVjdC50YWJJbmRleCA9IC0xO1xuICAgIGxldCB3aW47XG4gICAgb2JqZWN0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgd2luID0gb2JqZWN0LmNvbnRlbnREb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZuKTtcbiAgICB9O1xuICAgIGlmICgvVHJpZGVudC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG9iamVjdCk7XG4gICAgICAgIG9iamVjdC5kYXRhID0gJ2Fib3V0OmJsYW5rJztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9iamVjdC5kYXRhID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChvYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgIHdpbiAmJiB3aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiB3aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZm4pO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChvYmplY3QpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRvZ2dsZV9jbGFzcyhlbGVtZW50LCBuYW1lLCB0b2dnbGUpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdFt0b2dnbGUgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbn1cbmZ1bmN0aW9uIGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwpIHtcbiAgICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCBkZXRhaWwpO1xuICAgIHJldHVybiBlO1xufVxuZnVuY3Rpb24gcXVlcnlfc2VsZWN0b3JfYWxsKHNlbGVjdG9yLCBwYXJlbnQgPSBkb2N1bWVudC5ib2R5KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20ocGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbn1cbmNsYXNzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKGh0bWwsIGFuY2hvciA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lID0gZWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuYSA9IGFuY2hvcjtcbiAgICAgICAgdGhpcy51KGh0bWwpO1xuICAgIH1cbiAgICBtKHRhcmdldCwgYW5jaG9yID0gbnVsbCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5zZXJ0KHRhcmdldCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICB9XG4gICAgdShodG1sKSB7XG4gICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB0aGlzLm4gPSBBcnJheS5mcm9tKHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgcChodG1sKSB7XG4gICAgICAgIHRoaXMuZCgpO1xuICAgICAgICB0aGlzLnUoaHRtbCk7XG4gICAgICAgIHRoaXMubSh0aGlzLnQsIHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuXG5sZXQgc3R5bGVzaGVldDtcbmxldCBhY3RpdmUgPSAwO1xubGV0IGN1cnJlbnRfcnVsZXMgPSB7fTtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXJrc2t5YXBwL3N0cmluZy1oYXNoL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5mdW5jdGlvbiBoYXNoKHN0cikge1xuICAgIGxldCBoYXNoID0gNTM4MTtcbiAgICBsZXQgaSA9IHN0ci5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSlcbiAgICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpIF4gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGhhc2ggPj4+IDA7XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGlmICghY3VycmVudF9ydWxlc1tuYW1lXSkge1xuICAgICAgICBpZiAoIXN0eWxlc2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gZWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAgICAgc3R5bGVzaGVldCA9IHN0eWxlLnNoZWV0O1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRfcnVsZXNbbmFtZV0gPSB0cnVlO1xuICAgICAgICBzdHlsZXNoZWV0Lmluc2VydFJ1bGUoYEBrZXlmcmFtZXMgJHtuYW1lfSAke3J1bGV9YCwgc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb25zdCBhbmltYXRpb24gPSBub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJztcbiAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IGAke2FuaW1hdGlvbiA/IGAke2FuaW1hdGlvbn0sIGAgOiBgYH0ke25hbWV9ICR7ZHVyYXRpb259bXMgbGluZWFyICR7ZGVsYXl9bXMgMSBib3RoYDtcbiAgICBhY3RpdmUgKz0gMTtcbiAgICByZXR1cm4gbmFtZTtcbn1cbmZ1bmN0aW9uIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpIHtcbiAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IChub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJylcbiAgICAgICAgLnNwbGl0KCcsICcpXG4gICAgICAgIC5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApXG4gICAgICAgIC5qb2luKCcsICcpO1xuICAgIGlmIChuYW1lICYmICEtLWFjdGl2ZSlcbiAgICAgICAgY2xlYXJfcnVsZXMoKTtcbn1cbmZ1bmN0aW9uIGNsZWFyX3J1bGVzKCkge1xuICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmIChhY3RpdmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGxldCBpID0gc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pXG4gICAgICAgICAgICBzdHlsZXNoZWV0LmRlbGV0ZVJ1bGUoaSk7XG4gICAgICAgIGN1cnJlbnRfcnVsZXMgPSB7fTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlX2FuaW1hdGlvbihub2RlLCBmcm9tLCBmbiwgcGFyYW1zKSB7XG4gICAgaWYgKCFmcm9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGZyb20ubGVmdCA9PT0gdG8ubGVmdCAmJiBmcm9tLnJpZ2h0ID09PSB0by5yaWdodCAmJiBmcm9tLnRvcCA9PT0gdG8udG9wICYmIGZyb20uYm90dG9tID09PSB0by5ib3R0b20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogc2hvdWxkIHRoaXMgYmUgc2VwYXJhdGVkIGZyb20gZGVzdHJ1Y3R1cmluZz8gT3Igc3RhcnQvZW5kIGFkZGVkIHRvIHB1YmxpYyBhcGkgYW5kIGRvY3VtZW50YXRpb24/XG4gICAgc3RhcnQ6IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86XG4gICAgZW5kID0gc3RhcnRfdGltZSArIGR1cmF0aW9uLCB0aWNrID0gbm9vcCwgY3NzIH0gPSBmbihub2RlLCB7IGZyb20sIHRvIH0sIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgbGV0IG5hbWU7XG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgIG5hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRlbGF5KSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgbmFtZSk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgbG9vcChub3cgPT4ge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQgJiYgbm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkICYmIG5vdyA+PSBlbmQpIHtcbiAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBzdGFydF90aW1lO1xuICAgICAgICAgICAgY29uc3QgdCA9IDAgKyAxICogZWFzaW5nKHAgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICBzdGFydCgpO1xuICAgIHRpY2soMCwgMSk7XG4gICAgcmV0dXJuIHN0b3A7XG59XG5mdW5jdGlvbiBmaXhfcG9zaXRpb24obm9kZSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoc3R5bGUucG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBzdHlsZTtcbiAgICAgICAgY29uc3QgYSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBub2RlLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZF90cmFuc2Zvcm0obm9kZSwgYSkge1xuICAgIGNvbnN0IGIgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChhLmxlZnQgIT09IGIubGVmdCB8fCBhLnRvcCAhPT0gYi50b3ApIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IGAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7YS5sZWZ0IC0gYi5sZWZ0fXB4LCAke2EudG9wIC0gYi50b3B9cHgpYDtcbiAgICB9XG59XG5cbmxldCBjdXJyZW50X2NvbXBvbmVudDtcbmZ1bmN0aW9uIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICBjdXJyZW50X2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGdldF9jdXJyZW50X2NvbXBvbmVudCgpIHtcbiAgICBpZiAoIWN1cnJlbnRfY29tcG9uZW50KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZ1bmN0aW9uIGNhbGxlZCBvdXRzaWRlIGNvbXBvbmVudCBpbml0aWFsaXphdGlvbmApO1xuICAgIHJldHVybiBjdXJyZW50X2NvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmJlZm9yZV91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbk1vdW50KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fbW91bnQucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmFmdGVyX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIG9uRGVzdHJveShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX2Rlc3Ryb3kucHVzaChmbik7XG59XG5mdW5jdGlvbiBjcmVhdGVFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgcmV0dXJuICh0eXBlLCBkZXRhaWwpID0+IHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1t0eXBlXTtcbiAgICAgICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAgICAgLy8gVE9ETyBhcmUgdGhlcmUgc2l0dWF0aW9ucyB3aGVyZSBldmVudHMgY291bGQgYmUgZGlzcGF0Y2hlZFxuICAgICAgICAgICAgLy8gaW4gYSBzZXJ2ZXIgKG5vbi1ET00pIGVudmlyb25tZW50P1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY29tcG9uZW50LCBldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBzZXRDb250ZXh0KGtleSwgY29udGV4dCkge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuc2V0KGtleSwgY29udGV4dCk7XG59XG5mdW5jdGlvbiBnZXRDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmdldChrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4oZXZlbnQpKTtcbiAgICB9XG59XG5cbmNvbnN0IGRpcnR5X2NvbXBvbmVudHMgPSBbXTtcbmNvbnN0IGludHJvcyA9IHsgZW5hYmxlZDogZmFsc2UgfTtcbmNvbnN0IGJpbmRpbmdfY2FsbGJhY2tzID0gW107XG5jb25zdCByZW5kZXJfY2FsbGJhY2tzID0gW107XG5jb25zdCBmbHVzaF9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlc29sdmVkX3Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbmxldCB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG5mdW5jdGlvbiBzY2hlZHVsZV91cGRhdGUoKSB7XG4gICAgaWYgKCF1cGRhdGVfc2NoZWR1bGVkKSB7XG4gICAgICAgIHVwZGF0ZV9zY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlZF9wcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRpY2soKSB7XG4gICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkX3Byb21pc2U7XG59XG5mdW5jdGlvbiBhZGRfcmVuZGVyX2NhbGxiYWNrKGZuKSB7XG4gICAgcmVuZGVyX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFkZF9mbHVzaF9jYWxsYmFjayhmbikge1xuICAgIGZsdXNoX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmxldCBmbHVzaGluZyA9IGZhbHNlO1xuY29uc3Qgc2Vlbl9jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICBpZiAoZmx1c2hpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgZG8ge1xuICAgICAgICAvLyBmaXJzdCwgY2FsbCBiZWZvcmVVcGRhdGUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbaV07XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShjb21wb25lbnQuJCQpO1xuICAgICAgICB9XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgc2Vlbl9jYWxsYmFja3MuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgkJCkge1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAkJC51cGRhdGUoKTtcbiAgICAgICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAgICAgY29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcbiAgICAgICAgJCQuZGlydHkgPSBbLTFdO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5wKCQkLmN0eCwgZGlydHkpO1xuICAgICAgICAkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbiAgICB9XG59XG5cbmxldCBwcm9taXNlO1xuZnVuY3Rpb24gd2FpdCgpIHtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGRpc3BhdGNoKG5vZGUsIGRpcmVjdGlvbiwga2luZCkge1xuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQoYCR7ZGlyZWN0aW9uID8gJ2ludHJvJyA6ICdvdXRybyd9JHtraW5kfWApKTtcbn1cbmNvbnN0IG91dHJvaW5nID0gbmV3IFNldCgpO1xubGV0IG91dHJvcztcbmZ1bmN0aW9uIGdyb3VwX291dHJvcygpIHtcbiAgICBvdXRyb3MgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGM6IFtdLFxuICAgICAgICBwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNoZWNrX291dHJvcygpIHtcbiAgICBpZiAoIW91dHJvcy5yKSB7XG4gICAgICAgIHJ1bl9hbGwob3V0cm9zLmMpO1xuICAgIH1cbiAgICBvdXRyb3MgPSBvdXRyb3MucDtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25faW4oYmxvY2ssIGxvY2FsKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLmkpIHtcbiAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgYmxvY2suaShsb2NhbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9vdXQoYmxvY2ssIGxvY2FsLCBkZXRhY2gsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcbiAgICAgICAgaWYgKG91dHJvaW5nLmhhcyhibG9jaykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG91dHJvaW5nLmFkZChibG9jayk7XG4gICAgICAgIG91dHJvcy5jLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChkZXRhY2gpXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmQoMSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLm8obG9jYWwpO1xuICAgIH1cbn1cbmNvbnN0IG51bGxfdHJhbnNpdGlvbiA9IHsgZHVyYXRpb246IDAgfTtcbmZ1bmN0aW9uIGNyZWF0ZV9pbl90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBsZXQgdGFzaztcbiAgICBsZXQgdWlkID0gMDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKCkge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG4gICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgaWYgKHRhc2spXG4gICAgICAgICAgICB0YXNrLmFib3J0KCk7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIHRydWUsICdzdGFydCcpKTtcbiAgICAgICAgdGFzayA9IGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBlbmRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCB0cnVlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oZ28pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSBwcm9ncmFtLmIgLSB0O1xuICAgICAgICBkdXJhdGlvbiAqPSBNYXRoLmFicyhkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGE6IHQsXG4gICAgICAgICAgICBiOiBwcm9ncmFtLmIsXG4gICAgICAgICAgICBkLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBzdGFydDogcHJvZ3JhbS5zdGFydCxcbiAgICAgICAgICAgIGVuZDogcHJvZ3JhbS5zdGFydCArIGR1cmF0aW9uLFxuICAgICAgICAgICAgZ3JvdXA6IHByb2dyYW0uZ3JvdXBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oYikge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICAgICAgc3RhcnQ6IG5vdygpICsgZGVsYXksXG4gICAgICAgICAgICBiXG4gICAgICAgIH07XG4gICAgICAgIGlmICghYikge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIHByb2dyYW0uZ3JvdXAgPSBvdXRyb3M7XG4gICAgICAgICAgICBvdXRyb3MuciArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrc1tpXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIHdlIHByZXZpb3VzbHkgaGFkIGEgdGhlbi9jYXRjaCBibG9jaywgZGVzdHJveSBpdFxuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnBlbmRpbmcsIDApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8udGhlbikge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLnJlc29sdmVkID0gcHJvbWlzZTtcbiAgICB9XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xuXG5mdW5jdGlvbiBkZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5kKDEpO1xuICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbn1cbmZ1bmN0aW9uIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICB0cmFuc2l0aW9uX291dChibG9jaywgMSwgMSwgKCkgPT4ge1xuICAgICAgICBsb29rdXAuZGVsZXRlKGJsb2NrLmtleSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmYoKTtcbiAgICBkZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApO1xufVxuZnVuY3Rpb24gZml4X2FuZF9vdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApO1xufVxuZnVuY3Rpb24gdXBkYXRlX2tleWVkX2VhY2gob2xkX2Jsb2NrcywgZGlydHksIGdldF9rZXksIGR5bmFtaWMsIGN0eCwgbGlzdCwgbG9va3VwLCBub2RlLCBkZXN0cm95LCBjcmVhdGVfZWFjaF9ibG9jaywgbmV4dCwgZ2V0X2NvbnRleHQpIHtcbiAgICBsZXQgbyA9IG9sZF9ibG9ja3MubGVuZ3RoO1xuICAgIGxldCBuID0gbGlzdC5sZW5ndGg7XG4gICAgbGV0IGkgPSBvO1xuICAgIGNvbnN0IG9sZF9pbmRleGVzID0ge307XG4gICAgd2hpbGUgKGktLSlcbiAgICAgICAgb2xkX2luZGV4ZXNbb2xkX2Jsb2Nrc1tpXS5rZXldID0gaTtcbiAgICBjb25zdCBuZXdfYmxvY2tzID0gW107XG4gICAgY29uc3QgbmV3X2xvb2t1cCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBkZWx0YXMgPSBuZXcgTWFwKCk7XG4gICAgaSA9IG47XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBjaGlsZF9jdHggPSBnZXRfY29udGV4dChjdHgsIGxpc3QsIGkpO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRfa2V5KGNoaWxkX2N0eCk7XG4gICAgICAgIGxldCBibG9jayA9IGxvb2t1cC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFibG9jaykge1xuICAgICAgICAgICAgYmxvY2sgPSBjcmVhdGVfZWFjaF9ibG9jayhrZXksIGNoaWxkX2N0eCk7XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHluYW1pYykge1xuICAgICAgICAgICAgYmxvY2sucChjaGlsZF9jdHgsIGRpcnR5KTtcbiAgICAgICAgfVxuICAgICAgICBuZXdfbG9va3VwLnNldChrZXksIG5ld19ibG9ja3NbaV0gPSBibG9jayk7XG4gICAgICAgIGlmIChrZXkgaW4gb2xkX2luZGV4ZXMpXG4gICAgICAgICAgICBkZWx0YXMuc2V0KGtleSwgTWF0aC5hYnMoaSAtIG9sZF9pbmRleGVzW2tleV0pKTtcbiAgICB9XG4gICAgY29uc3Qgd2lsbF9tb3ZlID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGRpZF9tb3ZlID0gbmV3IFNldCgpO1xuICAgIGZ1bmN0aW9uIGluc2VydChibG9jaykge1xuICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgYmxvY2subShub2RlLCBuZXh0KTtcbiAgICAgICAgbG9va3VwLnNldChibG9jay5rZXksIGJsb2NrKTtcbiAgICAgICAgbmV4dCA9IGJsb2NrLmZpcnN0O1xuICAgICAgICBuLS07XG4gICAgfVxuICAgIHdoaWxlIChvICYmIG4pIHtcbiAgICAgICAgY29uc3QgbmV3X2Jsb2NrID0gbmV3X2Jsb2Nrc1tuIC0gMV07XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3NbbyAtIDFdO1xuICAgICAgICBjb25zdCBuZXdfa2V5ID0gbmV3X2Jsb2NrLmtleTtcbiAgICAgICAgY29uc3Qgb2xkX2tleSA9IG9sZF9ibG9jay5rZXk7XG4gICAgICAgIGlmIChuZXdfYmxvY2sgPT09IG9sZF9ibG9jaykge1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICAgICAgbmV4dCA9IG5ld19ibG9jay5maXJzdDtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgICAgIG4tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2tleSkpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBvbGQgYmxvY2tcbiAgICAgICAgICAgIGRlc3Ryb3kob2xkX2Jsb2NrLCBsb29rdXApO1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFsb29rdXAuaGFzKG5ld19rZXkpIHx8IHdpbGxfbW92ZS5oYXMobmV3X2tleSkpIHtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpZF9tb3ZlLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlbHRhcy5nZXQobmV3X2tleSkgPiBkZWx0YXMuZ2V0KG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBkaWRfbW92ZS5hZGQobmV3X2tleSk7XG4gICAgICAgICAgICBpbnNlcnQobmV3X2Jsb2NrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdpbGxfbW92ZS5hZGQob2xkX2tleSk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKG8tLSkge1xuICAgICAgICBjb25zdCBvbGRfYmxvY2sgPSBvbGRfYmxvY2tzW29dO1xuICAgICAgICBpZiAoIW5ld19sb29rdXAuaGFzKG9sZF9ibG9jay5rZXkpKVxuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgfVxuICAgIHdoaWxlIChuKVxuICAgICAgICBpbnNlcnQobmV3X2Jsb2Nrc1tuIC0gMV0pO1xuICAgIHJldHVybiBuZXdfYmxvY2tzO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfZWFjaF9rZXlzKGN0eCwgbGlzdCwgZ2V0X2NvbnRleHQsIGdldF9rZXkpIHtcbiAgICBjb25zdCBrZXlzID0gbmV3IFNldCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRfa2V5KGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSkpO1xuICAgICAgICBpZiAoa2V5cy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgaGF2ZSBkdXBsaWNhdGUga2V5cyBpbiBhIGtleWVkIGVhY2hgKTtcbiAgICAgICAgfVxuICAgICAgICBrZXlzLmFkZChrZXkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0X3NwcmVhZF91cGRhdGUobGV2ZWxzLCB1cGRhdGVzKSB7XG4gICAgY29uc3QgdXBkYXRlID0ge307XG4gICAgY29uc3QgdG9fbnVsbF9vdXQgPSB7fTtcbiAgICBjb25zdCBhY2NvdW50ZWRfZm9yID0geyAkJHNjb3BlOiAxIH07XG4gICAgbGV0IGkgPSBsZXZlbHMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgY29uc3QgbyA9IGxldmVsc1tpXTtcbiAgICAgICAgY29uc3QgbiA9IHVwZGF0ZXNbaV07XG4gICAgICAgIGlmIChuKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIG4pKVxuICAgICAgICAgICAgICAgICAgICB0b19udWxsX291dFtrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG4pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWFjY291bnRlZF9mb3Jba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVba2V5XSA9IG5ba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXZlbHNbaV0gPSBuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbykge1xuICAgICAgICAgICAgICAgIGFjY291bnRlZF9mb3Jba2V5XSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdG9fbnVsbF9vdXQpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIHVwZGF0ZSkpXG4gICAgICAgICAgICB1cGRhdGVba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHVwZGF0ZTtcbn1cbmZ1bmN0aW9uIGdldF9zcHJlYWRfb2JqZWN0KHNwcmVhZF9wcm9wcykge1xuICAgIHJldHVybiB0eXBlb2Ygc3ByZWFkX3Byb3BzID09PSAnb2JqZWN0JyAmJiBzcHJlYWRfcHJvcHMgIT09IG51bGwgPyBzcHJlYWRfcHJvcHMgOiB7fTtcbn1cblxuLy8gc291cmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbmRpY2VzLmh0bWxcbmNvbnN0IGJvb2xlYW5fYXR0cmlidXRlcyA9IG5ldyBTZXQoW1xuICAgICdhbGxvd2Z1bGxzY3JlZW4nLFxuICAgICdhbGxvd3BheW1lbnRyZXF1ZXN0JyxcbiAgICAnYXN5bmMnLFxuICAgICdhdXRvZm9jdXMnLFxuICAgICdhdXRvcGxheScsXG4gICAgJ2NoZWNrZWQnLFxuICAgICdjb250cm9scycsXG4gICAgJ2RlZmF1bHQnLFxuICAgICdkZWZlcicsXG4gICAgJ2Rpc2FibGVkJyxcbiAgICAnZm9ybW5vdmFsaWRhdGUnLFxuICAgICdoaWRkZW4nLFxuICAgICdpc21hcCcsXG4gICAgJ2xvb3AnLFxuICAgICdtdWx0aXBsZScsXG4gICAgJ211dGVkJyxcbiAgICAnbm9tb2R1bGUnLFxuICAgICdub3ZhbGlkYXRlJyxcbiAgICAnb3BlbicsXG4gICAgJ3BsYXlzaW5saW5lJyxcbiAgICAncmVhZG9ubHknLFxuICAgICdyZXF1aXJlZCcsXG4gICAgJ3JldmVyc2VkJyxcbiAgICAnc2VsZWN0ZWQnXG5dKTtcblxuY29uc3QgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIgPSAvW1xccydcIj4vPVxcdXtGREQwfS1cXHV7RkRFRn1cXHV7RkZGRX1cXHV7RkZGRn1cXHV7MUZGRkV9XFx1ezFGRkZGfVxcdXsyRkZGRX1cXHV7MkZGRkZ9XFx1ezNGRkZFfVxcdXszRkZGRn1cXHV7NEZGRkV9XFx1ezRGRkZGfVxcdXs1RkZGRX1cXHV7NUZGRkZ9XFx1ezZGRkZFfVxcdXs2RkZGRn1cXHV7N0ZGRkV9XFx1ezdGRkZGfVxcdXs4RkZGRX1cXHV7OEZGRkZ9XFx1ezlGRkZFfVxcdXs5RkZGRn1cXHV7QUZGRkV9XFx1e0FGRkZGfVxcdXtCRkZGRX1cXHV7QkZGRkZ9XFx1e0NGRkZFfVxcdXtDRkZGRn1cXHV7REZGRkV9XFx1e0RGRkZGfVxcdXtFRkZGRX1cXHV7RUZGRkZ9XFx1e0ZGRkZFfVxcdXtGRkZGRn1cXHV7MTBGRkZFfVxcdXsxMEZGRkZ9XS91O1xuLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlcy0yXG4vLyBodHRwczovL2luZnJhLnNwZWMud2hhdHdnLm9yZy8jbm9uY2hhcmFjdGVyXG5mdW5jdGlvbiBzcHJlYWQoYXJncywgY2xhc3Nlc190b19hZGQpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwgLi4uYXJncyk7XG4gICAgaWYgKGNsYXNzZXNfdG9fYWRkKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzLmNsYXNzID09IG51bGwpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgKz0gJyAnICsgY2xhc3Nlc190b19hZGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGlmIChpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3Rlci50ZXN0KG5hbWUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSlcbiAgICAgICAgICAgIHN0ciArPSBcIiBcIiArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSBcIiBcIiArIG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3RyICs9IGAgJHtuYW1lfT1cIiR7U3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cIi9nLCAnJiMzNDsnKS5yZXBsYWNlKC8nL2csICcmIzM5OycpfVwiYDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzdHI7XG59XG5jb25zdCBlc2NhcGVkID0ge1xuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7J1xufTtcbmZ1bmN0aW9uIGVzY2FwZShodG1sKSB7XG4gICAgcmV0dXJuIFN0cmluZyhodG1sKS5yZXBsYWNlKC9bXCInJjw+XS9nLCBtYXRjaCA9PiBlc2NhcGVkW21hdGNoXSk7XG59XG5mdW5jdGlvbiBlYWNoKGl0ZW1zLCBmbikge1xuICAgIGxldCBzdHIgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0ciArPSBmbihpdGVtc1tpXSwgaSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5jb25zdCBtaXNzaW5nX2NvbXBvbmVudCA9IHtcbiAgICAkJHJlbmRlcjogKCkgPT4gJydcbn07XG5mdW5jdGlvbiB2YWxpZGF0ZV9jb21wb25lbnQoY29tcG9uZW50LCBuYW1lKSB7XG4gICAgaWYgKCFjb21wb25lbnQgfHwgIWNvbXBvbmVudC4kJHJlbmRlcikge1xuICAgICAgICBpZiAobmFtZSA9PT0gJ3N2ZWx0ZTpjb21wb25lbnQnKVxuICAgICAgICAgICAgbmFtZSArPSAnIHRoaXM9ey4uLn0nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDwke25hbWV9PiBpcyBub3QgYSB2YWxpZCBTU1IgY29tcG9uZW50LiBZb3UgbWF5IG5lZWQgdG8gcmV2aWV3IHlvdXIgYnVpbGQgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGRlcGVuZGVuY2llcyBhcmUgY29tcGlsZWQsIHJhdGhlciB0aGFuIGltcG9ydGVkIGFzIHByZS1jb21waWxlZCBtb2R1bGVzYCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBkZWJ1ZyhmaWxlLCBsaW5lLCBjb2x1bW4sIHZhbHVlcykge1xuICAgIGNvbnNvbGUubG9nKGB7QGRlYnVnfSAke2ZpbGUgPyBmaWxlICsgJyAnIDogJyd9KCR7bGluZX06JHtjb2x1bW59KWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyh2YWx1ZXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICByZXR1cm4gJyc7XG59XG5sZXQgb25fZGVzdHJveTtcbmZ1bmN0aW9uIGNyZWF0ZV9zc3JfY29tcG9uZW50KGZuKSB7XG4gICAgZnVuY3Rpb24gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICAgICAgY29uc3QgJCQgPSB7XG4gICAgICAgICAgICBvbl9kZXN0cm95LFxuICAgICAgICAgICAgY29udGV4dDogbmV3IE1hcChwYXJlbnRfY29tcG9uZW50ID8gcGFyZW50X2NvbXBvbmVudC4kJC5jb250ZXh0IDogW10pLFxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBpbW1lZGlhdGVseSBkaXNjYXJkZWRcbiAgICAgICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KClcbiAgICAgICAgfTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHsgJCQgfSk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBmbihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMpO1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXI6IChwcm9wcyA9IHt9LCBvcHRpb25zID0ge30pID0+IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgdGl0bGU6ICcnLCBoZWFkOiAnJywgY3NzOiBuZXcgU2V0KCkgfTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCB7fSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBydW5fYWxsKG9uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBBcnJheS5mcm9tKHJlc3VsdC5jc3MpLm1hcChjc3MgPT4gY3NzLmNvZGUpLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IG51bGwgLy8gVE9ET1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZDogcmVzdWx0LnRpdGxlICsgcmVzdWx0LmhlYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICQkcmVuZGVyXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZF9hdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAoYm9vbGVhbiAmJiAhdmFsdWUpKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGAgJHtuYW1lfSR7dmFsdWUgPT09IHRydWUgPyAnJyA6IGA9JHt0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5zdHJpbmdpZnkoZXNjYXBlKHZhbHVlKSkgOiBgXCIke3ZhbHVlfVwiYH1gfWA7XG59XG5mdW5jdGlvbiBhZGRfY2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMgPyBgIGNsYXNzPVwiJHtjbGFzc2VzfVwiYCA6IGBgO1xufVxuXG5mdW5jdGlvbiBiaW5kKGNvbXBvbmVudCwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBpbmRleCA9IGNvbXBvbmVudC4kJC5wcm9wc1tuYW1lXTtcbiAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb21wb25lbnQuJCQuYm91bmRbaW5kZXhdID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudC4kJC5jdHhbaW5kZXhdKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVfY29tcG9uZW50KGJsb2NrKSB7XG4gICAgYmxvY2sgJiYgYmxvY2suYygpO1xufVxuZnVuY3Rpb24gY2xhaW1fY29tcG9uZW50KGJsb2NrLCBwYXJlbnRfbm9kZXMpIHtcbiAgICBibG9jayAmJiBibG9jay5sKHBhcmVudF9ub2Rlcyk7XG59XG5mdW5jdGlvbiBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCB0YXJnZXQsIGFuY2hvcikge1xuICAgIGNvbnN0IHsgZnJhZ21lbnQsIG9uX21vdW50LCBvbl9kZXN0cm95LCBhZnRlcl91cGRhdGUgfSA9IGNvbXBvbmVudC4kJDtcbiAgICBmcmFnbWVudCAmJiBmcmFnbWVudC5tKHRhcmdldCwgYW5jaG9yKTtcbiAgICAvLyBvbk1vdW50IGhhcHBlbnMgYmVmb3JlIHRoZSBpbml0aWFsIGFmdGVyVXBkYXRlXG4gICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld19vbl9kZXN0cm95ID0gb25fbW91bnQubWFwKHJ1bikuZmlsdGVyKGlzX2Z1bmN0aW9uKTtcbiAgICAgICAgaWYgKG9uX2Rlc3Ryb3kpIHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kucHVzaCguLi5uZXdfb25fZGVzdHJveSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBFZGdlIGNhc2UgLSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseSxcbiAgICAgICAgICAgIC8vIG1vc3QgbGlrZWx5IGFzIGEgcmVzdWx0IG9mIGEgYmluZGluZyBpbml0aWFsaXNpbmdcbiAgICAgICAgICAgIHJ1bl9hbGwobmV3X29uX2Rlc3Ryb3kpO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudC4kJC5vbl9tb3VudCA9IFtdO1xuICAgIH0pO1xuICAgIGFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gZGVzdHJveV9jb21wb25lbnQoY29tcG9uZW50LCBkZXRhY2hpbmcpIHtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJDtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgcnVuX2FsbCgkJC5vbl9kZXN0cm95KTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuZChkZXRhY2hpbmcpO1xuICAgICAgICAvLyBUT0RPIG51bGwgb3V0IG90aGVyIHJlZnMsIGluY2x1ZGluZyBjb21wb25lbnQuJCQgKGJ1dCBuZWVkIHRvXG4gICAgICAgIC8vIHByZXNlcnZlIGZpbmFsIHN0YXRlPylcbiAgICAgICAgJCQub25fZGVzdHJveSA9ICQkLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgJCQuY3R4ID0gW107XG4gICAgfVxufVxuZnVuY3Rpb24gbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpIHtcbiAgICBpZiAoY29tcG9uZW50LiQkLmRpcnR5WzBdID09PSAtMSkge1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgICAgIGNvbXBvbmVudC4kJC5kaXJ0eS5maWxsKDApO1xuICAgIH1cbiAgICBjb21wb25lbnQuJCQuZGlydHlbKGkgLyAzMSkgfCAwXSB8PSAoMSA8PCAoaSAlIDMxKSk7XG59XG5mdW5jdGlvbiBpbml0KGNvbXBvbmVudCwgb3B0aW9ucywgaW5zdGFuY2UsIGNyZWF0ZV9mcmFnbWVudCwgbm90X2VxdWFsLCBwcm9wcywgZGlydHkgPSBbLTFdKSB7XG4gICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgIGNvbnN0IHByb3BfdmFsdWVzID0gb3B0aW9ucy5wcm9wcyB8fCB7fTtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJCA9IHtcbiAgICAgICAgZnJhZ21lbnQ6IG51bGwsXG4gICAgICAgIGN0eDogbnVsbCxcbiAgICAgICAgLy8gc3RhdGVcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIHVwZGF0ZTogbm9vcCxcbiAgICAgICAgbm90X2VxdWFsLFxuICAgICAgICBib3VuZDogYmxhbmtfb2JqZWN0KCksXG4gICAgICAgIC8vIGxpZmVjeWNsZVxuICAgICAgICBvbl9tb3VudDogW10sXG4gICAgICAgIG9uX2Rlc3Ryb3k6IFtdLFxuICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgY29udGV4dDogbmV3IE1hcChwYXJlbnRfY29tcG9uZW50ID8gcGFyZW50X2NvbXBvbmVudC4kJC5jb250ZXh0IDogW10pLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHlcbiAgICB9O1xuICAgIGxldCByZWFkeSA9IGZhbHNlO1xuICAgICQkLmN0eCA9IGluc3RhbmNlXG4gICAgICAgID8gaW5zdGFuY2UoY29tcG9uZW50LCBwcm9wX3ZhbHVlcywgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICgkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5sKGNoaWxkcmVuKG9wdGlvbnMudGFyZ2V0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZGVuIGJ5IGluc3RhbmNlLCBpZiBpdCBoYXMgcHJvcHNcbiAgICAgICAgfVxuICAgIH07XG59XG5jbGFzcyBTdmVsdGVDb21wb25lbnQge1xuICAgICRkZXN0cm95KCkge1xuICAgICAgICBkZXN0cm95X2NvbXBvbmVudCh0aGlzLCAxKTtcbiAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgfVxuICAgICRvbih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAkc2V0KCkge1xuICAgICAgICAvLyBvdmVycmlkZGVuIGJ5IGluc3RhbmNlLCBpZiBpdCBoYXMgcHJvcHNcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuMTguMicgfSwgZGV0YWlsKSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01JbnNlcnRcIiwgeyB0YXJnZXQsIG5vZGUgfSk7XG4gICAgYXBwZW5kKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KFwiU3ZlbHRlRE9NSW5zZXJ0XCIsIHsgdGFyZ2V0LCBub2RlLCBhbmNob3IgfSk7XG4gICAgaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9kZXYobm9kZSkge1xuICAgIGRpc3BhdGNoX2RldihcIlN2ZWx0ZURPTVJlbW92ZVwiLCB7IG5vZGUgfSk7XG4gICAgZGV0YWNoKG5vZGUpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2JldHdlZW5fZGV2KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9iZWZvcmVfZGV2KGFmdGVyKSB7XG4gICAgd2hpbGUgKGFmdGVyLnByZXZpb3VzU2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGFmdGVyLnByZXZpb3VzU2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2FmdGVyX2RldihiZWZvcmUpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsaXN0ZW5fZGV2KG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zLCBoYXNfcHJldmVudF9kZWZhdWx0LCBoYXNfc3RvcF9wcm9wYWdhdGlvbikge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IG9wdGlvbnMgPT09IHRydWUgPyBbXCJjYXB0dXJlXCJdIDogb3B0aW9ucyA/IEFycmF5LmZyb20oT2JqZWN0LmtleXMob3B0aW9ucykpIDogW107XG4gICAgaWYgKGhhc19wcmV2ZW50X2RlZmF1bHQpXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdwcmV2ZW50RGVmYXVsdCcpO1xuICAgIGlmIChoYXNfc3RvcF9wcm9wYWdhdGlvbilcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3N0b3BQcm9wYWdhdGlvbicpO1xuICAgIGRpc3BhdGNoX2RldihcIlN2ZWx0ZURPTUFkZEV2ZW50TGlzdGVuZXJcIiwgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgIGNvbnN0IGRpc3Bvc2UgPSBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRpc3BhdGNoX2RldihcIlN2ZWx0ZURPTVJlbW92ZUV2ZW50TGlzdGVuZXJcIiwgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHJfZGV2KG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01SZW1vdmVBdHRyaWJ1dGVcIiwgeyBub2RlLCBhdHRyaWJ1dGUgfSk7XG4gICAgZWxzZVxuICAgICAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01TZXRBdHRyaWJ1dGVcIiwgeyBub2RlLCBhdHRyaWJ1dGUsIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gcHJvcF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01TZXRQcm9wZXJ0eVwiLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIGRhdGFzZXRfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGUuZGF0YXNldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01TZXREYXRhc2V0XCIsIHsgbm9kZSwgcHJvcGVydHksIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfZGV2KHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0LmRhdGEgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICBkaXNwYXRjaF9kZXYoXCJTdmVsdGVET01TZXREYXRhXCIsIHsgbm9kZTogdGV4dCwgZGF0YSB9KTtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuY2xhc3MgU3ZlbHRlQ29tcG9uZW50RGV2IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucyB8fCAoIW9wdGlvbnMudGFyZ2V0ICYmICFvcHRpb25zLiQkaW5saW5lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAndGFyZ2V0JyBpcyBhIHJlcXVpcmVkIG9wdGlvbmApO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbmZpbml0ZSBsb29wIGRldGVjdGVkYCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlRWxlbWVudCwgYWN0aW9uX2Rlc3Ryb3llciwgYWRkX2F0dHJpYnV0ZSwgYWRkX2NsYXNzZXMsIGFkZF9mbHVzaF9jYWxsYmFjaywgYWRkX2xvY2F0aW9uLCBhZGRfcmVuZGVyX2NhbGxiYWNrLCBhZGRfcmVzaXplX2xpc3RlbmVyLCBhZGRfdHJhbnNmb3JtLCBhZnRlclVwZGF0ZSwgYXBwZW5kLCBhcHBlbmRfZGV2LCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9zcGFjZSwgY2xhaW1fdGV4dCwgY2xlYXJfbG9vcHMsIGNvbXBvbmVudF9zdWJzY3JpYmUsIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciwgY3JlYXRlX2FuaW1hdGlvbiwgY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbiwgY3JlYXRlX2NvbXBvbmVudCwgY3JlYXRlX2luX3RyYW5zaXRpb24sIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbiwgY3JlYXRlX3Nsb3QsIGNyZWF0ZV9zc3JfY29tcG9uZW50LCBjdXJyZW50X2NvbXBvbmVudCwgY3VzdG9tX2V2ZW50LCBkYXRhc2V0X2RldiwgZGVidWcsIGRlc3Ryb3lfYmxvY2ssIGRlc3Ryb3lfY29tcG9uZW50LCBkZXN0cm95X2VhY2gsIGRldGFjaCwgZGV0YWNoX2FmdGVyX2RldiwgZGV0YWNoX2JlZm9yZV9kZXYsIGRldGFjaF9iZXR3ZWVuX2RldiwgZGV0YWNoX2RldiwgZGlydHlfY29tcG9uZW50cywgZGlzcGF0Y2hfZGV2LCBlYWNoLCBlbGVtZW50LCBlbGVtZW50X2lzLCBlbXB0eSwgZXNjYXBlLCBlc2NhcGVkLCBleGNsdWRlX2ludGVybmFsX3Byb3BzLCBmaXhfYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9hbmRfb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9wb3NpdGlvbiwgZmx1c2gsIGdldENvbnRleHQsIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlLCBnZXRfY3VycmVudF9jb21wb25lbnQsIGdldF9zbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHQsIGdldF9zcHJlYWRfb2JqZWN0LCBnZXRfc3ByZWFkX3VwZGF0ZSwgZ2V0X3N0b3JlX3ZhbHVlLCBnbG9iYWxzLCBncm91cF9vdXRyb3MsIGhhbmRsZV9wcm9taXNlLCBoYXNfcHJvcCwgaWRlbnRpdHksIGluaXQsIGluc2VydCwgaW5zZXJ0X2RldiwgaW50cm9zLCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciwgaXNfY2xpZW50LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3RvcF9wcm9wYWdhdGlvbiwgc3Vic2NyaWJlLCBzdmdfZWxlbWVudCwgdGV4dCwgdGljaywgdGltZV9yYW5nZXNfdG9fYXJyYXksIHRvX251bWJlciwgdG9nZ2xlX2NsYXNzLCB0cmFuc2l0aW9uX2luLCB0cmFuc2l0aW9uX291dCwgdXBkYXRlX2tleWVkX2VhY2gsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zdG9yZSwgeGxpbmtfYXR0ciB9O1xuIiwiaW1wb3J0IHsgbm9vcCwgc2FmZV9ub3RfZXF1YWwsIHN1YnNjcmliZSwgcnVuX2FsbCwgaXNfZnVuY3Rpb24gfSBmcm9tICcuLi9pbnRlcm5hbCc7XG5leHBvcnQgeyBnZXRfc3RvcmVfdmFsdWUgYXMgZ2V0IH0gZnJvbSAnLi4vaW50ZXJuYWwnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiByZWFkYWJsZSh2YWx1ZSwgc3RhcnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHdyaXRhYmxlKHZhbHVlLCBzdGFydCkuc3Vic2NyaWJlLFxuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZSBhIGBXcml0YWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgYm90aCB1cGRhdGluZyBhbmQgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKiBAcGFyYW0geyo9fXZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXI9fXN0YXJ0IHN0YXJ0IGFuZCBzdG9wIG5vdGlmaWNhdGlvbnMgZm9yIHN1YnNjcmlwdGlvbnNcbiAqL1xuZnVuY3Rpb24gd3JpdGFibGUodmFsdWUsIHN0YXJ0ID0gbm9vcCkge1xuICAgIGxldCBzdG9wO1xuICAgIGNvbnN0IHN1YnNjcmliZXJzID0gW107XG4gICAgZnVuY3Rpb24gc2V0KG5ld192YWx1ZSkge1xuICAgICAgICBpZiAoc2FmZV9ub3RfZXF1YWwodmFsdWUsIG5ld192YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbmV3X3ZhbHVlO1xuICAgICAgICAgICAgaWYgKHN0b3ApIHsgLy8gc3RvcmUgaXMgcmVhZHlcbiAgICAgICAgICAgICAgICBjb25zdCBydW5fcXVldWUgPSAhc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHNbMV0oKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5wdXNoKHMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bl9xdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJfcXVldWUubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWVbaV1bMF0oc3Vic2NyaWJlcl9xdWV1ZVtpICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlKGZuKSB7XG4gICAgICAgIHNldChmbih2YWx1ZSkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUocnVuLCBpbnZhbGlkYXRlID0gbm9vcCkge1xuICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gW3J1biwgaW52YWxpZGF0ZV07XG4gICAgICAgIHN1YnNjcmliZXJzLnB1c2goc3Vic2NyaWJlcik7XG4gICAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHN0b3AgPSBzdGFydChzZXQpIHx8IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgcnVuKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3Vic2NyaWJlcnMuaW5kZXhPZihzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICBzdG9wID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc2V0LCB1cGRhdGUsIHN1YnNjcmliZSB9O1xufVxuZnVuY3Rpb24gZGVyaXZlZChzdG9yZXMsIGZuLCBpbml0aWFsX3ZhbHVlKSB7XG4gICAgY29uc3Qgc2luZ2xlID0gIUFycmF5LmlzQXJyYXkoc3RvcmVzKTtcbiAgICBjb25zdCBzdG9yZXNfYXJyYXkgPSBzaW5nbGVcbiAgICAgICAgPyBbc3RvcmVzXVxuICAgICAgICA6IHN0b3JlcztcbiAgICBjb25zdCBhdXRvID0gZm4ubGVuZ3RoIDwgMjtcbiAgICByZXR1cm4gcmVhZGFibGUoaW5pdGlhbF92YWx1ZSwgKHNldCkgPT4ge1xuICAgICAgICBsZXQgaW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgICAgIGxldCBjbGVhbnVwID0gbm9vcDtcbiAgICAgICAgY29uc3Qgc3luYyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZm4oc2luZ2xlID8gdmFsdWVzWzBdIDogdmFsdWVzLCBzZXQpO1xuICAgICAgICAgICAgaWYgKGF1dG8pIHtcbiAgICAgICAgICAgICAgICBzZXQocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsZWFudXAgPSBpc19mdW5jdGlvbihyZXN1bHQpID8gcmVzdWx0IDogbm9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVycyA9IHN0b3Jlc19hcnJheS5tYXAoKHN0b3JlLCBpKSA9PiBzdWJzY3JpYmUoc3RvcmUsICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWVzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICBwZW5kaW5nICY9IH4oMSA8PCBpKTtcbiAgICAgICAgICAgIGlmIChpbml0ZWQpIHtcbiAgICAgICAgICAgICAgICBzeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgfD0gKDEgPDwgaSk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgaW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgc3luYygpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodW5zdWJzY3JpYmVycyk7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGRlcml2ZWQsIHJlYWRhYmxlLCB3cml0YWJsZSB9O1xuIiwiaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xuXG5leHBvcnQgY29uc3QgQ09OVEVYVF9LRVkgPSB7fTtcblxuZXhwb3J0IGNvbnN0IHByZWxvYWQgPSAoKSA9PiAoe30pOyIsIjxzdHlsZT5cbiAgaW1ne1xuICAgIHdpZHRoOiAyNHB4O1xuICAgIGhlaWdodDogMjRweDtcbiAgICBtYXJnaW4tcmlnaHQ6IDEycHg7XG4gIH1cbjwvc3R5bGU+XG5cbjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgc2l6ZTtcbiAgZXhwb3J0IGxldCBzdHlsZSA9IFwic2hpbnlcIjsgLy8gb3IgZmxhdFxuICBleHBvcnQgbGV0IGNvdW50cnlDb2RlO1xuXG4gIGNvbnN0IGxlZ2FjeSA9IGAvc3RhdGljL2ltZy9jb3VudHJ5ZmxhZ3MvbGVnYWN5LyR7c3R5bGV9LiR7Y291bnRyeUNvZGV9LiR7c2l6ZX0ucG5nYDtcbiAgLy9jb25zdCB3ZWJwID0gYC9zdGF0aWMvaW1nL2NvdW50cnlmbGFncy93ZWJwLyR7c3R5bGV9LiR7Y291bnRyeUNvZGV9LiR7c2l6ZX0ucG5nLndlYnBgO1xuPC9zY3JpcHQ+XG5cbjxpbWcgc3JjPXtsZWdhY3l9IGFsdD17Y291bnRyeUNvZGV9PlxuXG48IS0tXG48cGljdHVyZT5cbiAgPHNvdXJjZSBzcmNzZXQ9e3dlYnB9IHR5cGU9XCJpbWFnZS93ZWJwXCI+XG4gIDxzb3VyY2Ugc3Jjc2V0PXtsZWdhY3l9IHR5cGU9XCJpbWFnZS9wbmdcIj5cbiAgPGltZyBzcmM9e2xlZ2FjeX0gYWx0PXtjb3VudHJ5Q29kZX0+XG48L3BpY3R1cmU+XG4tLT4iLCJ2b2lkIGZ1bmN0aW9uKGdsb2JhbCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyAgVmFsdWVFcnJvciA6OiBTdHJpbmcgLT4gRXJyb3JcbiAgZnVuY3Rpb24gVmFsdWVFcnJvcihtZXNzYWdlKSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICBlcnIubmFtZSA9ICdWYWx1ZUVycm9yJztcbiAgICByZXR1cm4gZXJyO1xuICB9XG5cbiAgLy8gIGNyZWF0ZSA6OiBPYmplY3QgLT4gU3RyaW5nLCouLi4gLT4gU3RyaW5nXG4gIGZ1bmN0aW9uIGNyZWF0ZSh0cmFuc2Zvcm1lcnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHZhciBpZHggPSAwO1xuICAgICAgdmFyIHN0YXRlID0gJ1VOREVGSU5FRCc7XG5cbiAgICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKFxuICAgICAgICAvKFt7fV0pXFwxfFt7XSguKj8pKD86ISguKz8pKT9bfV0vZyxcbiAgICAgICAgZnVuY3Rpb24obWF0Y2gsIGxpdGVyYWwsIF9rZXksIHhmKSB7XG4gICAgICAgICAgaWYgKGxpdGVyYWwgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxpdGVyYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBrZXkgPSBfa2V5O1xuICAgICAgICAgIGlmIChrZXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKHN0YXRlID09PSAnSU1QTElDSVQnKSB7XG4gICAgICAgICAgICAgIHRocm93IFZhbHVlRXJyb3IoJ2Nhbm5vdCBzd2l0Y2ggZnJvbSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW1wbGljaXQgdG8gZXhwbGljaXQgbnVtYmVyaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZSA9ICdFWFBMSUNJVCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gJ0VYUExJQ0lUJykge1xuICAgICAgICAgICAgICB0aHJvdyBWYWx1ZUVycm9yKCdjYW5ub3Qgc3dpdGNoIGZyb20gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2V4cGxpY2l0IHRvIGltcGxpY2l0IG51bWJlcmluZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUgPSAnSU1QTElDSVQnO1xuICAgICAgICAgICAga2V5ID0gU3RyaW5nKGlkeCk7XG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAgMS4gIFNwbGl0IHRoZSBrZXkgaW50byBhIGxvb2t1cCBwYXRoLlxuICAgICAgICAgIC8vICAyLiAgSWYgdGhlIGZpcnN0IHBhdGggY29tcG9uZW50IGlzIG5vdCBhbiBpbmRleCwgcHJlcGVuZCAnMCcuXG4gICAgICAgICAgLy8gIDMuICBSZWR1Y2UgdGhlIGxvb2t1cCBwYXRoIHRvIGEgc2luZ2xlIHJlc3VsdC4gSWYgdGhlIGxvb2t1cFxuICAgICAgICAgIC8vICAgICAgc3VjY2VlZHMgdGhlIHJlc3VsdCBpcyBhIHNpbmdsZXRvbiBhcnJheSBjb250YWluaW5nIHRoZVxuICAgICAgICAgIC8vICAgICAgdmFsdWUgYXQgdGhlIGxvb2t1cCBwYXRoOyBvdGhlcndpc2UgdGhlIHJlc3VsdCBpcyBbXS5cbiAgICAgICAgICAvLyAgNC4gIFVud3JhcCB0aGUgcmVzdWx0IGJ5IHJlZHVjaW5nIHdpdGggJycgYXMgdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgICAgdmFyIHBhdGggPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSAoL15cXGQrJC8udGVzdChwYXRoWzBdKSA/IHBhdGggOiBbJzAnXS5jb25jYXQocGF0aCkpXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uKG1heWJlLCBrZXkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1heWJlLnJlZHVjZShmdW5jdGlvbihfLCB4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHggIT0gbnVsbCAmJiBrZXkgaW4gT2JqZWN0KHgpID9cbiAgICAgICAgICAgICAgICAgIFt0eXBlb2YgeFtrZXldID09PSAnZnVuY3Rpb24nID8geFtrZXldKCkgOiB4W2tleV1dIDpcbiAgICAgICAgICAgICAgICAgIFtdO1xuICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICB9LCBbYXJnc10pXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uKF8sIHgpIHsgcmV0dXJuIHg7IH0sICcnKTtcblxuICAgICAgICAgIGlmICh4ZiA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodHJhbnNmb3JtZXJzLCB4ZikpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lcnNbeGZdKHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgVmFsdWVFcnJvcignbm8gdHJhbnNmb3JtZXIgbmFtZWQgXCInICsgeGYgKyAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIC8vICBmb3JtYXQgOjogU3RyaW5nLCouLi4gLT4gU3RyaW5nXG4gIHZhciBmb3JtYXQgPSBjcmVhdGUoe30pO1xuXG4gIC8vICBmb3JtYXQuY3JlYXRlIDo6IE9iamVjdCAtPiBTdHJpbmcsKi4uLiAtPiBTdHJpbmdcbiAgZm9ybWF0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuICAvLyAgZm9ybWF0LmV4dGVuZCA6OiBPYmplY3QsT2JqZWN0IC0+ICgpXG4gIGZvcm1hdC5leHRlbmQgPSBmdW5jdGlvbihwcm90b3R5cGUsIHRyYW5zZm9ybWVycykge1xuICAgIHZhciAkZm9ybWF0ID0gY3JlYXRlKHRyYW5zZm9ybWVycyk7XG4gICAgcHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgICAgcmV0dXJuICRmb3JtYXQuYXBwbHkoZ2xvYmFsLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZm9ybWF0O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGZvcm1hdDsgfSk7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLmZvcm1hdCA9IGZvcm1hdDtcbiAgfVxuXG59LmNhbGwodGhpcywgdGhpcyk7XG4iLCIvKiFcbiAqIGlzb2JqZWN0IDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9pc29iamVjdD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgQXJyYXkuaXNBcnJheSh2YWwpID09PSBmYWxzZTtcbn07XG4iLCIvKiFcbiAqIGdldC12YWx1ZSA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvZ2V0LXZhbHVlPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE4LCBKb24gU2NobGlua2VydC5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG5jb25zdCBpc09iamVjdCA9IHJlcXVpcmUoJ2lzb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBwYXRoLCBvcHRpb25zKSB7XG4gIGlmICghaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBvcHRpb25zID0geyBkZWZhdWx0OiBvcHRpb25zIH07XG4gIH1cblxuICBpZiAoIWlzVmFsaWRPYmplY3QodGFyZ2V0KSkge1xuICAgIHJldHVybiB0eXBlb2Ygb3B0aW9ucy5kZWZhdWx0ICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMuZGVmYXVsdCA6IHRhcmdldDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gJ251bWJlcicpIHtcbiAgICBwYXRoID0gU3RyaW5nKHBhdGgpO1xuICB9XG5cbiAgY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkocGF0aCk7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHBhdGggPT09ICdzdHJpbmcnO1xuICBjb25zdCBzcGxpdENoYXIgPSBvcHRpb25zLnNlcGFyYXRvciB8fCAnLic7XG4gIGNvbnN0IGpvaW5DaGFyID0gb3B0aW9ucy5qb2luQ2hhciB8fCAodHlwZW9mIHNwbGl0Q2hhciA9PT0gJ3N0cmluZycgPyBzcGxpdENoYXIgOiAnLicpO1xuXG4gIGlmICghaXNTdHJpbmcgJiYgIWlzQXJyYXkpIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nICYmIHBhdGggaW4gdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGlzVmFsaWQocGF0aCwgdGFyZ2V0LCBvcHRpb25zKSA/IHRhcmdldFtwYXRoXSA6IG9wdGlvbnMuZGVmYXVsdDtcbiAgfVxuXG4gIGxldCBzZWdzID0gaXNBcnJheSA/IHBhdGggOiBzcGxpdChwYXRoLCBzcGxpdENoYXIsIG9wdGlvbnMpO1xuICBsZXQgbGVuID0gc2Vncy5sZW5ndGg7XG4gIGxldCBpZHggPSAwO1xuXG4gIGRvIHtcbiAgICBsZXQgcHJvcCA9IHNlZ3NbaWR4XTtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdudW1iZXInKSB7XG4gICAgICBwcm9wID0gU3RyaW5nKHByb3ApO1xuICAgIH1cblxuICAgIHdoaWxlIChwcm9wICYmIHByb3Auc2xpY2UoLTEpID09PSAnXFxcXCcpIHtcbiAgICAgIHByb3AgPSBqb2luKFtwcm9wLnNsaWNlKDAsIC0xKSwgc2Vnc1srK2lkeF0gfHwgJyddLCBqb2luQ2hhciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKHByb3AgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoIWlzVmFsaWQocHJvcCwgdGFyZ2V0LCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0O1xuICAgICAgfVxuXG4gICAgICB0YXJnZXQgPSB0YXJnZXRbcHJvcF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBoYXNQcm9wID0gZmFsc2U7XG4gICAgICBsZXQgbiA9IGlkeCArIDE7XG5cbiAgICAgIHdoaWxlIChuIDwgbGVuKSB7XG4gICAgICAgIHByb3AgPSBqb2luKFtwcm9wLCBzZWdzW24rK11dLCBqb2luQ2hhciwgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKChoYXNQcm9wID0gcHJvcCBpbiB0YXJnZXQpKSB7XG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKHByb3AsIHRhcmdldCwgb3B0aW9ucykpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmRlZmF1bHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgIGlkeCA9IG4gLSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaGFzUHJvcCkge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfSB3aGlsZSAoKytpZHggPCBsZW4gJiYgaXNWYWxpZE9iamVjdCh0YXJnZXQpKTtcblxuICBpZiAoaWR4ID09PSBsZW4pIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnMuZGVmYXVsdDtcbn07XG5cbmZ1bmN0aW9uIGpvaW4oc2Vncywgam9pbkNoYXIsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmpvaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5qb2luKHNlZ3MpO1xuICB9XG4gIHJldHVybiBzZWdzWzBdICsgam9pbkNoYXIgKyBzZWdzWzFdO1xufVxuXG5mdW5jdGlvbiBzcGxpdChwYXRoLCBzcGxpdENoYXIsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLnNwbGl0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuc3BsaXQocGF0aCk7XG4gIH1cbiAgcmV0dXJuIHBhdGguc3BsaXQoc3BsaXRDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZChrZXksIHRhcmdldCwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMuaXNWYWxpZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRpb25zLmlzVmFsaWQoa2V5LCB0YXJnZXQpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkT2JqZWN0KHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSB8fCBBcnJheS5pc0FycmF5KHZhbCkgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsImltcG9ydCBmb3JtYXQgZnJvbSBcInN0cmluZy1mb3JtYXRcIjtcbmltcG9ydCBnZXQgZnJvbSBcImdldC12YWx1ZVwiO1xuaW1wb3J0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gZnJvbSBcInN2ZWx0ZS9zdG9yZVwiO1xuaW1wb3J0IHsgc3RvcmVzIGFzIHNhcHBlclN0b3JlcyB9IGZyb20gXCJAc2FwcGVyL2FwcFwiO1xuXG5pbXBvcnQgeyBnZXQgYXMgZ2V0U3RvcmVWYWx1ZSB9IGZyb20gXCJzdmVsdGUvc3RvcmVcIjtcblxuaW1wb3J0IGxhbmdzIGZyb20gXCIvZGIvZGF0YS9sYW5ncy5qc29uXCI7XG5cbmNvbnN0IG5vdEZvdW5kS2V5cyA9IG5ldyBTZXQoKTtcblxuY29uc3QgZm9ybWF0dGVyID0gbG9jYWxlID0+IChrZXksIHBhcmFtcyA9IHt9KSA9PiB7XG4gIC8vY29uc29sZS5sb2cobG9jYWxlLmxhbmcsIGtleSk7XG4gIGNvbnN0IG8gPSBnZXQobG9jYWxlLCBrZXkpO1xuICBcbiAgaWYodHlwZW9mIG8gIT09IFwic3RyaW5nXCIpe1xuICAgIGlmKCFub3RGb3VuZEtleXMuaGFzKCkpe1xuICAgICAgbm90Rm91bmRLZXlzLmFkZChrZXkpO1xuICAgICAgY29uc29sZS5sb2coXCJbJHRyYW5zXSBrZXkgbm90IGZvdW5kOlwiICsgSlNPTi5zdHJpbmdpZnkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0KG8sIHBhcmFtcyk7XG59XG5cbi8vIHJldHVybiBhbHdheXMgdGhlIHNhbWUgc3RvcmVzIGZvciB0aGUgc2FtZSBzZXNzaW9uXG4vLyBpbnN0ZWFkIG9mIGNyZWF0aW5nIG5ldyBzdG9yZXMgZXZlcnkgdGltZVxuY29uc3QgbWVtbyA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBjb25zdCBzdG9yZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHsgcGFnZSwgc2Vzc2lvbiB9ID0gc2FwcGVyU3RvcmVzKCk7XG4gIFxuICBpZihtZW1vLmhhcyhzZXNzaW9uKSlcbiAgICByZXR1cm4gbWVtby5nZXQoc2Vzc2lvbik7XG4gIFxuICBjb25zdCAkc2Vzc2lvbiA9IGdldFN0b3JlVmFsdWUoc2Vzc2lvbik7XG4gIGNvbnN0ICRwYWdlID0gZ2V0U3RvcmVWYWx1ZShwYWdlKTtcbiAgXG4gIGNvbnN0ICRsYW5nID0gJHNlc3Npb24ubGFuZztcbiAgY29uc3QgJHRyYW5zID0gZm9ybWF0dGVyKCRzZXNzaW9uLmxvY2FsZSk7XG5cbiAgY29uc3QgJGNvdW50cnlDb2RlID0gJHBhZ2UucGFyYW1zLmxhbmdDb3VudHJ5ICYmICRwYWdlLnBhcmFtcy5sYW5nQ291bnRyeS5zcGxpdChcIi1cIilbMV07XG4gIGNvbnN0IGNvdW50cnlDb2RlID0gd3JpdGFibGUoJGNvdW50cnlDb2RlKTtcblxuICBjb25zdCAkY291bnRyeSA9ICRzZXNzaW9uLmNvdW50cnk7XG5cbiAgY29uc3QgY2FjaGUgPSB7XG4gICAgdHJhbnM6IHtbJGxhbmddOiAkdHJhbnN9LFxuICAgIGNvdW50cmllczogJGNvdW50cnlDb2RlICYmICRjb3VudHJ5ID8ge1skY291bnRyeUNvZGVdOiAkY291bnRyeX0gOiB7fSxcbiAgfVxuXG4gIGNvbnN0IGxhbmcgPSB3cml0YWJsZSgkbGFuZyk7XG5cbiAgY29uc3QgdHJhbnMgPSByZWFkYWJsZSgkdHJhbnMsIHNldCA9PiB7XG4gICAgbGFuZy5zdWJzY3JpYmUoYXN5bmMgJGxhbmcgPT4ge1xuICAgICAgaWYoY2FjaGUudHJhbnMuaGFzT3duUHJvcGVydHkoJGxhbmcpKVxuICAgICAgICBzZXQoY2FjaGUudHJhbnNbJGxhbmddKTtcbiAgICAgIGVsc2UgaWYocHJvY2Vzcy5icm93c2VyKSB7XG4gICAgICAgIC8vIG5ldmVyIHJ1biBpbiBzZXJ2ZXJcbiAgICAgICAgY29uc29sZS5sb2coXCJsb2FkaW5nIGxvY2FsZSBcIiwgJGxhbmcpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgL2kxOG4vbG9jYWxlcy8keyRsYW5nfS5qc29uYClcbiAgICAgICAgY29uc3QgbG9jYWxlID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgY29uc3QgJHRyYW5zID0gZm9ybWF0dGVyKGxvY2FsZSk7XG4gICAgICAgIGNhY2hlWyRsYW5nXSA9ICR0cmFucztcbiAgICAgICAgc2V0KCR0cmFucyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2V0dGVkICR0cmFuc1wiLCAkbGFuZyk7XG4gICAgICB9XG4gICAgfSlcbiAgfSlcbiAgXG4gIHBhZ2Uuc3Vic2NyaWJlKCRwYWdlID0+IHtcbiAgICBpZigkcGFnZS5wYXJhbXMubGFuZyl7XG4gICAgICBpZihsYW5ncy5oYXNPd25Qcm9wZXJ0eSgkcGFnZS5wYXJhbXMubGFuZykpe1xuICAgICAgICBsYW5nLnNldCgkcGFnZS5wYXJhbXMubGFuZyk7XG4gICAgICAgIGNvdW50cnlDb2RlLnNldChudWxsKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYoJHBhZ2UucGFyYW1zLmxhbmdDb3VudHJ5KSB7XG4gICAgICBjb25zdCBbJGxhbmcsICRjb3VudHJ5Q29kZV0gPSAkcGFnZS5wYXJhbXMubGFuZ0NvdW50cnkuc3BsaXQoXCItXCIpO1xuICAgICAgaWYobGFuZ3MuaGFzT3duUHJvcGVydHkoJGxhbmcpKXtcbiAgICAgICAgbGFuZy5zZXQoJGxhbmcpO1xuICAgICAgfVxuICAgICAgY291bnRyeUNvZGUuc2V0KCRjb3VudHJ5Q29kZSk7XG4gICAgfVxuICB9KVxuXG5cbiAgY29uc3QgY291bnRyeSA9IHdyaXRhYmxlKCRjb3VudHJ5KTtcbiAgY291bnRyeUNvZGUuc3Vic2NyaWJlKGFzeW5jICRjb3VudHJ5Q29kZSA9PiB7XG4gICAgaWYoISRjb3VudHJ5Q29kZSl7XG4gICAgICBjb3VudHJ5LnNldChudWxsKTtcbiAgICB9IGVsc2UgaWYoY2FjaGUuY291bnRyaWVzLmhhc093blByb3BlcnR5KCRjb3VudHJ5Q29kZSkpe1xuICAgICAgY291bnRyeS5zZXQoY2FjaGUuY291bnRyaWVzWyRjb3VudHJ5Q29kZV0pO1xuICAgIH0gZWxzZSBpZihwcm9jZXNzLmJyb3dzZXIpe1xuICAgICAgLy8gY2xpZW50IHNpZGUgb25seVxuICAgICAgY29uc3QgJGNvdW50cnkgPSBhd2FpdCBmZXRjaChgL2FwaS9jb3VudHJpZXMvJHskY291bnRyeUNvZGV9YCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSk7XG4gICAgICBjYWNoZS5jb3VudHJpZXNbJGNvdW50cnlDb2RlXSA9ICRjb3VudHJ5O1xuICAgICAgY291bnRyeS5zZXQoJGNvdW50cnkpO1xuICAgIH1cbiAgfSlcblxuXG4gIGNvbnN0IGhlbHBlciA9IHtsYW5nLCB0cmFucywgY291bnRyeUNvZGUsIGNvdW50cnl9O1xuXG4gIG1lbW8uc2V0KHNlc3Npb24sIGhlbHBlcik7XG5cbiAgcmV0dXJuIGhlbHBlcjtcbn0iLCJleHBvcnQgeyBpZGVudGl0eSBhcyBsaW5lYXIgfSBmcm9tICcuLi9pbnRlcm5hbCc7XG5cbi8qXG5BZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdHRkZXNsXG5EaXN0cmlidXRlZCB1bmRlciBNSVQgTGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vbWF0dGRlc2wvZWFzZXMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuKi9cbmZ1bmN0aW9uIGJhY2tJbk91dCh0KSB7XG4gICAgY29uc3QgcyA9IDEuNzAxNTggKiAxLjUyNTtcbiAgICBpZiAoKHQgKj0gMikgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogKHQgKiB0ICogKChzICsgMSkgKiB0IC0gcykpO1xuICAgIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAyKTtcbn1cbmZ1bmN0aW9uIGJhY2tJbih0KSB7XG4gICAgY29uc3QgcyA9IDEuNzAxNTg7XG4gICAgcmV0dXJuIHQgKiB0ICogKChzICsgMSkgKiB0IC0gcyk7XG59XG5mdW5jdGlvbiBiYWNrT3V0KHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1ODtcbiAgICByZXR1cm4gLS10ICogdCAqICgocyArIDEpICogdCArIHMpICsgMTtcbn1cbmZ1bmN0aW9uIGJvdW5jZU91dCh0KSB7XG4gICAgY29uc3QgYSA9IDQuMCAvIDExLjA7XG4gICAgY29uc3QgYiA9IDguMCAvIDExLjA7XG4gICAgY29uc3QgYyA9IDkuMCAvIDEwLjA7XG4gICAgY29uc3QgY2EgPSA0MzU2LjAgLyAzNjEuMDtcbiAgICBjb25zdCBjYiA9IDM1NDQyLjAgLyAxODA1LjA7XG4gICAgY29uc3QgY2MgPSAxNjA2MS4wIC8gMTgwNS4wO1xuICAgIGNvbnN0IHQyID0gdCAqIHQ7XG4gICAgcmV0dXJuIHQgPCBhXG4gICAgICAgID8gNy41NjI1ICogdDJcbiAgICAgICAgOiB0IDwgYlxuICAgICAgICAgICAgPyA5LjA3NSAqIHQyIC0gOS45ICogdCArIDMuNFxuICAgICAgICAgICAgOiB0IDwgY1xuICAgICAgICAgICAgICAgID8gY2EgKiB0MiAtIGNiICogdCArIGNjXG4gICAgICAgICAgICAgICAgOiAxMC44ICogdCAqIHQgLSAyMC41MiAqIHQgKyAxMC43Mjtcbn1cbmZ1bmN0aW9uIGJvdW5jZUluT3V0KHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNVxuICAgICAgICA/IDAuNSAqICgxLjAgLSBib3VuY2VPdXQoMS4wIC0gdCAqIDIuMCkpXG4gICAgICAgIDogMC41ICogYm91bmNlT3V0KHQgKiAyLjAgLSAxLjApICsgMC41O1xufVxuZnVuY3Rpb24gYm91bmNlSW4odCkge1xuICAgIHJldHVybiAxLjAgLSBib3VuY2VPdXQoMS4wIC0gdCk7XG59XG5mdW5jdGlvbiBjaXJjSW5PdXQodCkge1xuICAgIGlmICgodCAqPSAyKSA8IDEpXG4gICAgICAgIHJldHVybiAtMC41ICogKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSk7XG4gICAgcmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKTtcbn1cbmZ1bmN0aW9uIGNpcmNJbih0KSB7XG4gICAgcmV0dXJuIDEuMCAtIE1hdGguc3FydCgxLjAgLSB0ICogdCk7XG59XG5mdW5jdGlvbiBjaXJjT3V0KHQpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KDEgLSAtLXQgKiB0KTtcbn1cbmZ1bmN0aW9uIGN1YmljSW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41ID8gNC4wICogdCAqIHQgKiB0IDogMC41ICogTWF0aC5wb3coMi4wICogdCAtIDIuMCwgMy4wKSArIDEuMDtcbn1cbmZ1bmN0aW9uIGN1YmljSW4odCkge1xuICAgIHJldHVybiB0ICogdCAqIHQ7XG59XG5mdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gICAgY29uc3QgZiA9IHQgLSAxLjA7XG4gICAgcmV0dXJuIGYgKiBmICogZiArIDEuMDtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjVcbiAgICAgICAgPyAwLjUgKlxuICAgICAgICAgICAgTWF0aC5zaW4oKCgrMTMuMCAqIE1hdGguUEkpIC8gMikgKiAyLjAgKiB0KSAqXG4gICAgICAgICAgICBNYXRoLnBvdygyLjAsIDEwLjAgKiAoMi4wICogdCAtIDEuMCkpXG4gICAgICAgIDogMC41ICpcbiAgICAgICAgICAgIE1hdGguc2luKCgoLTEzLjAgKiBNYXRoLlBJKSAvIDIpICogKDIuMCAqIHQgLSAxLjAgKyAxLjApKSAqXG4gICAgICAgICAgICBNYXRoLnBvdygyLjAsIC0xMC4wICogKDIuMCAqIHQgLSAxLjApKSArXG4gICAgICAgICAgICAxLjA7XG59XG5mdW5jdGlvbiBlbGFzdGljSW4odCkge1xuICAgIHJldHVybiBNYXRoLnNpbigoMTMuMCAqIHQgKiBNYXRoLlBJKSAvIDIpICogTWF0aC5wb3coMi4wLCAxMC4wICogKHQgLSAxLjApKTtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNPdXQodCkge1xuICAgIHJldHVybiAoTWF0aC5zaW4oKC0xMy4wICogKHQgKyAxLjApICogTWF0aC5QSSkgLyAyKSAqIE1hdGgucG93KDIuMCwgLTEwLjAgKiB0KSArIDEuMCk7XG59XG5mdW5jdGlvbiBleHBvSW5PdXQodCkge1xuICAgIHJldHVybiB0ID09PSAwLjAgfHwgdCA9PT0gMS4wXG4gICAgICAgID8gdFxuICAgICAgICA6IHQgPCAwLjVcbiAgICAgICAgICAgID8gKzAuNSAqIE1hdGgucG93KDIuMCwgMjAuMCAqIHQgLSAxMC4wKVxuICAgICAgICAgICAgOiAtMC41ICogTWF0aC5wb3coMi4wLCAxMC4wIC0gdCAqIDIwLjApICsgMS4wO1xufVxuZnVuY3Rpb24gZXhwb0luKHQpIHtcbiAgICByZXR1cm4gdCA9PT0gMC4wID8gdCA6IE1hdGgucG93KDIuMCwgMTAuMCAqICh0IC0gMS4wKSk7XG59XG5mdW5jdGlvbiBleHBvT3V0KHQpIHtcbiAgICByZXR1cm4gdCA9PT0gMS4wID8gdCA6IDEuMCAtIE1hdGgucG93KDIuMCwgLTEwLjAgKiB0KTtcbn1cbmZ1bmN0aW9uIHF1YWRJbk91dCh0KSB7XG4gICAgdCAvPSAwLjU7XG4gICAgaWYgKHQgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogdCAqIHQ7XG4gICAgdC0tO1xuICAgIHJldHVybiAtMC41ICogKHQgKiAodCAtIDIpIC0gMSk7XG59XG5mdW5jdGlvbiBxdWFkSW4odCkge1xuICAgIHJldHVybiB0ICogdDtcbn1cbmZ1bmN0aW9uIHF1YWRPdXQodCkge1xuICAgIHJldHVybiAtdCAqICh0IC0gMi4wKTtcbn1cbmZ1bmN0aW9uIHF1YXJ0SW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41XG4gICAgICAgID8gKzguMCAqIE1hdGgucG93KHQsIDQuMClcbiAgICAgICAgOiAtOC4wICogTWF0aC5wb3codCAtIDEuMCwgNC4wKSArIDEuMDtcbn1cbmZ1bmN0aW9uIHF1YXJ0SW4odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyh0LCA0LjApO1xufVxuZnVuY3Rpb24gcXVhcnRPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnBvdyh0IC0gMS4wLCAzLjApICogKDEuMCAtIHQpICsgMS4wO1xufVxuZnVuY3Rpb24gcXVpbnRJbk91dCh0KSB7XG4gICAgaWYgKCh0ICo9IDIpIDwgMSlcbiAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdCAqIHQgKiB0O1xuICAgIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgKiB0ICsgMik7XG59XG5mdW5jdGlvbiBxdWludEluKHQpIHtcbiAgICByZXR1cm4gdCAqIHQgKiB0ICogdCAqIHQ7XG59XG5mdW5jdGlvbiBxdWludE91dCh0KSB7XG4gICAgcmV0dXJuIC0tdCAqIHQgKiB0ICogdCAqIHQgKyAxO1xufVxuZnVuY3Rpb24gc2luZUluT3V0KHQpIHtcbiAgICByZXR1cm4gLTAuNSAqIChNYXRoLmNvcyhNYXRoLlBJICogdCkgLSAxKTtcbn1cbmZ1bmN0aW9uIHNpbmVJbih0KSB7XG4gICAgY29uc3QgdiA9IE1hdGguY29zKHQgKiBNYXRoLlBJICogMC41KTtcbiAgICBpZiAoTWF0aC5hYnModikgPCAxZS0xNClcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gMSAtIHY7XG59XG5mdW5jdGlvbiBzaW5lT3V0KHQpIHtcbiAgICByZXR1cm4gTWF0aC5zaW4oKHQgKiBNYXRoLlBJKSAvIDIpO1xufVxuXG5leHBvcnQgeyBiYWNrSW4sIGJhY2tJbk91dCwgYmFja091dCwgYm91bmNlSW4sIGJvdW5jZUluT3V0LCBib3VuY2VPdXQsIGNpcmNJbiwgY2lyY0luT3V0LCBjaXJjT3V0LCBjdWJpY0luLCBjdWJpY0luT3V0LCBjdWJpY091dCwgZWxhc3RpY0luLCBlbGFzdGljSW5PdXQsIGVsYXN0aWNPdXQsIGV4cG9JbiwgZXhwb0luT3V0LCBleHBvT3V0LCBxdWFkSW4sIHF1YWRJbk91dCwgcXVhZE91dCwgcXVhcnRJbiwgcXVhcnRJbk91dCwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50SW5PdXQsIHF1aW50T3V0LCBzaW5lSW4sIHNpbmVJbk91dCwgc2luZU91dCB9O1xuIiwiaW1wb3J0IHtjdWJpY091dH0gZnJvbSBcInN2ZWx0ZS9lYXNpbmdcIjtcblxuY29uc3QgZGVmcyA9IHtcbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiA0MDAsXG4gIGVhc2luZzogY3ViaWNPdXRcbn1cblxuY29uc3QgY29tbW9uU3R5bGUgPSBcInBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDogLTE7XCI7IFxuXG5cbmV4cG9ydCBjb25zdCBmbHlSaWdodCA9IChub2RlLCBwYXJhbXMgPSB7fSkgPT4ge1xuICBjb25zdCB7ZWFzaW5nLCBkdXJhdGlvbiwgZGVsYXl9ID0gey4uLmRlZnMsIC4uLnBhcmFtc307XG4gIGNvbnN0IHdpZHRoID0gbm9kZS5jbGllbnRXaWR0aDtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICBjb25zdCBvcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gIGNvbnN0IG1hcmdpbkxlZnQgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpbkxlZnQpO1xuICBjb25zdCBtYXJnaW5SaWdodCA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luUmlnaHQpO1xuICBcbiAgY29uc3QgdG90YWwgPSB3aWR0aCArIG1hcmdpblJpZ2h0ICsgbWFyZ2luTGVmdDtcblxuICBjb25zdCBjc3MgPSAodCwgdSkgPT4gYFxuICAgICR7Y29tbW9uU3R5bGV9XG4gICAgbWFyZ2luLWxlZnQ6ICR7bWFyZ2luTGVmdCAtIHRvdGFsICogdX1weDsgXG4gICAgb3BhY2l0eTogJHt0ICogb3BhY2l0eX07YDtcbiAgXG4gIHJldHVybiB7XG4gICAgZWFzaW5nLFxuICAgIGR1cmF0aW9uLFxuICAgIGRlbGF5LFxuICAgIGNzc1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzbGlkZVJpZ2h0ID0gKG5vZGUsIHBhcmFtcyA9IHt9KSA9PiB7XG4gIGNvbnN0IHtlYXNpbmcsIGR1cmF0aW9uLCBkZWxheX0gPSB7Li4uZGVmcywgLi4ucGFyYW1zfTtcbiAgY29uc3Qgd2lkdGggPSBub2RlLmNsaWVudFdpZHRoO1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gIGNvbnN0IG1hcmdpbkxlZnQgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpbkxlZnQpO1xuICBjb25zdCBtYXJnaW5SaWdodCA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luUmlnaHQpO1xuICBcbiAgY29uc3QgdG90YWwgPSB3aWR0aCArIG1hcmdpblJpZ2h0ICsgbWFyZ2luTGVmdDtcblxuICBjb25zdCBjc3MgPSAodCwgdSkgPT4gYCR7Y29tbW9uU3R5bGV9IG1hcmdpbi1sZWZ0OiAke21hcmdpbkxlZnQgLSB0b3RhbCAqIHV9cHg7YDtcbiAgXG4gIHJldHVybiB7XG4gICAgZWFzaW5nLFxuICAgIGR1cmF0aW9uLFxuICAgIGRlbGF5LFxuICAgIGNzc1xuICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGZseUxlZnQgPSAobm9kZSwgcGFyYW1zID0ge30pID0+IHtcbiAgY29uc3Qge2Vhc2luZywgZHVyYXRpb24sIGRlbGF5fSA9IHsuLi5kZWZzLCAuLi5wYXJhbXN9O1xuICBjb25zdCB3aWR0aCA9IG5vZGUuY2xpZW50V2lkdGg7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICBjb25zdCBtYXJnaW5MZWZ0ID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5MZWZ0KTtcbiAgY29uc3QgbWFyZ2luUmlnaHQgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpblJpZ2h0KTtcbiAgXG4gIGNvbnN0IHRvdGFsID0gd2lkdGggKyBtYXJnaW5SaWdodCArIG1hcmdpbkxlZnQ7XG5cbiAgY29uc3QgY3NzID0gKHQsIHUpID0+IGBcbiAgICAke2NvbW1vblN0eWxlfSAgXG4gICAgbWFyZ2luLXJpZ2h0OiAke21hcmdpblJpZ2h0IC0gdG90YWwgKiB1fXB4OyBcbiAgICBvcGFjaXR5OiAke3QgKiBvcGFjaXR5fTtgO1xuICBcbiAgcmV0dXJuIHtcbiAgICBlYXNpbmcsXG4gICAgZHVyYXRpb24sXG4gICAgZGVsYXksXG4gICAgY3NzXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNsaWRlTGVmdCA9IChub2RlLCBwYXJhbXMgPSB7fSkgPT4ge1xuICBjb25zdCB7ZWFzaW5nLCBkdXJhdGlvbiwgZGVsYXl9ID0gey4uLmRlZnMsIC4uLnBhcmFtc307XG4gIGNvbnN0IHdpZHRoID0gbm9kZS5jbGllbnRXaWR0aDtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICBjb25zdCBtYXJnaW5MZWZ0ID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5MZWZ0KTtcbiAgY29uc3QgbWFyZ2luUmlnaHQgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpblJpZ2h0KTtcbiAgY29uc3QgdG90YWwgPSB3aWR0aCArIG1hcmdpblJpZ2h0ICsgbWFyZ2luTGVmdDtcbiAgXG4gIGNvbnN0IGNzcyA9ICh0LCB1KSA9PiBgJHtjb21tb25TdHlsZX0gbWFyZ2luLXJpZ2h0OiAke21hcmdpblJpZ2h0IC0gdG90YWwgKiB1fXB4O2BcbiAgXG4gIHJldHVybiB7XG4gICAgZWFzaW5nLFxuICAgIGR1cmF0aW9uLFxuICAgIGRlbGF5LFxuICAgIGNzc1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmbHlEb3duID0gKG5vZGUsIHBhcmFtcyA9IHt9KSA9PiB7XG4gIGNvbnN0IHtlYXNpbmcsIGR1cmF0aW9uLCBkZWxheX0gPSB7Li4uZGVmcywgLi4ucGFyYW1zfTtcbiAgY29uc3Qgd2lkdGggPSBub2RlLmNsaWVudEhlaWdodDtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICBjb25zdCBvcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gIGNvbnN0IG1hcmdpblRvcCA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luVG9wKTtcbiAgY29uc3QgbWFyZ2luQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICBcbiAgY29uc3QgdG90YWwgPSB3aWR0aCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbTtcblxuICBjb25zdCBjc3MgPSAodCwgdSkgPT4gYFxuICAke2NvbW1vblN0eWxlfVxuICAgIG1hcmdpbi10b3A6ICR7bWFyZ2luVG9wIC0gdG90YWwgKiB1fXB4OyBcbiAgICBvcGFjaXR5OiAke3QgKiBvcGFjaXR5fTtgO1xuICBcbiAgcmV0dXJuIHtcbiAgICBlYXNpbmcsXG4gICAgZHVyYXRpb24sXG4gICAgZGVsYXksXG4gICAgY3NzXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNsaWRlRG93biA9IChub2RlLCBwYXJhbXMgPSB7fSkgPT4ge1xuICBjb25zdCB7ZWFzaW5nLCBkdXJhdGlvbiwgZGVsYXl9ID0gey4uLmRlZnMsIC4uLnBhcmFtc307XG4gIGNvbnN0IGhlaWdodCA9IG5vZGUuY2xpZW50SGVpZ2h0O1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gIGNvbnN0IG1hcmdpblRvcCA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luVG9wKTtcbiAgY29uc3QgbWFyZ2luQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICBcbiAgY29uc3QgdG90YWwgPSBoZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b207XG5cbiAgY29uc3QgY3NzID0gKHQsIHUpID0+IGAke2NvbW1vblN0eWxlfSBtYXJnaW4tdG9wOiAke21hcmdpblRvcCAtIHRvdGFsICogdX1weDtgO1xuICBcbiAgcmV0dXJuIHtcbiAgICBlYXNpbmcsXG4gICAgZHVyYXRpb24sXG4gICAgZGVsYXksXG4gICAgY3NzXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZseVVwID0gKG5vZGUsIHBhcmFtcyA9IHt9KSA9PiB7XG4gIGNvbnN0IHtlYXNpbmcsIGR1cmF0aW9uLCBkZWxheX0gPSB7Li4uZGVmcywgLi4ucGFyYW1zfTtcbiAgY29uc3QgaGVpZ2h0ID0gbm9kZS5jbGllbnRIZWlnaHQ7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICBjb25zdCBtYXJnaW5Ub3AgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpblRvcCk7XG4gIGNvbnN0IG1hcmdpbkJvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgXG4gIGNvbnN0IHRvdGFsID0gaGVpZ2h0ICsgbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tO1xuXG4gIGNvbnN0IGNzcyA9ICh0LCB1KSA9PiBgXG4gICR7Y29tbW9uU3R5bGV9XG4gICAgbWFyZ2luLWJvdHRvbTogJHttYXJnaW5Cb3R0b20gLSB0b3RhbCAqIHV9cHg7IFxuICAgIG9wYWNpdHk6ICR7dCAqIG9wYWNpdHl9O2A7XG4gIFxuICByZXR1cm4ge1xuICAgIGVhc2luZyxcbiAgICBkdXJhdGlvbixcbiAgICBkZWxheSxcbiAgICBjc3NcbiAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBzbGlkZVVwID0gKG5vZGUsIHBhcmFtcyA9IHt9KSA9PiB7XG4gIGNvbnN0IHtlYXNpbmcsIGR1cmF0aW9uLCBkZWxheX0gPSB7Li4uZGVmcywgLi4ucGFyYW1zfTtcbiAgY29uc3QgaGVpZ2h0ID0gbm9kZS5jbGllbnRIZWlnaHQ7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgY29uc3QgbWFyZ2luVG9wID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5Ub3ApO1xuICBjb25zdCBtYXJnaW5Cb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gIFxuICBjb25zdCB0b3RhbCA9IGhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbTtcblxuICBjb25zdCBjc3MgPSAodCwgdSkgPT4gYCR7Y29tbW9uU3R5bGV9IG1hcmdpbi1ib3R0b206ICR7bWFyZ2luQm90dG9tIC0gdG90YWwgKiB1fXB4O2A7XG4gIFxuICByZXR1cm4ge1xuICAgIGVhc2luZyxcbiAgICBkdXJhdGlvbixcbiAgICBkZWxheSxcbiAgICBjc3NcbiAgfVxufVxuXG4iLCJleHBvcnQgY29uc3QgY2Fub25pY2FsID0gdXJsID0+IGBodHRwczovL29wZW5yYWRpby5hcHAke3VybH1gOyBcblxuZXhwb3J0IGNvbnN0IGluZGV4VXJsID0gKHtsYW5nfSkgPT4gYC8ke2xhbmd9YDtcblxuZXhwb3J0IGNvbnN0IGNvdW50cnlVcmwgPSAoe2xhbmcsIGNvdW50cnlDb2RlfSkgPT4gYC8ke2xhbmd9LSR7Y291bnRyeUNvZGV9YDtcblxuZXhwb3J0IGNvbnN0IHNlYXJjaEFjdGlvblVybCA9ICh7bGFuZywgY291bnRyeUNvZGV9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgY291bnRyeUNvZGUgPyBcbiAgICAgIGNvdW50cnlVcmwoe2xhbmcsIGNvdW50cnlDb2RlfSkgOlxuICAgICAgaW5kZXhVcmwoe2xhbmd9KVxuICAgICkgKyBcIi9zZWFyY2hcIjtcbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaFVybCA9ICh7bGFuZywgY291bnRyeUNvZGUsIHF9KSA9PiBzZWFyY2hBY3Rpb25Vcmwoe2xhbmcsIGNvdW50cnlDb2RlfSkgKyBcIj9xPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHEpO1xuXG5leHBvcnQgY29uc3Qgc3RhdGlvblVybCA9ICh7bGFuZywgc3RhdGlvbn0pID0+IGNvdW50cnlVcmwoe2xhbmcsIGNvdW50cnlDb2RlOiBzdGF0aW9uLmNvdW50cnlDb2RlfSkgKyBcIi9yYWRpby9cIiArIHN0YXRpb24uc2x1ZztcblxuZXhwb3J0IGNvbnN0IHN0YXRpb25JbWdVcmwgPSAoc2l6ZSwgc3RhdGlvbikgPT4gc3RhdGlvbi5vcmlnaW4gIT0gXCJtdFwiID8gW1xuICBgL3N0YXRpYy9pbWcvc3RhdGlvbnMvcncvd2VicC8ke3NpemV9LyR7c3RhdGlvbi5jb3VudHJ5Q29kZX0uJHtzdGF0aW9uLnNsdWd9LnBuZy53ZWJwYCxcbiAgYC9zdGF0aWMvaW1nL3N0YXRpb25zL3J3L3BuZy8ke3NpemV9LyR7c3RhdGlvbi5jb3VudHJ5Q29kZX0uJHtzdGF0aW9uLnNsdWd9LnBuZ2Bcbl0gOiBbXG4gIGAvc3RhdGljL2ltZy9zdGF0aW9ucy9tdC93ZWJwLyR7c2l6ZX0vJHtzdGF0aW9uLm10LmltZy5sdH0ud2VicGAsXG4gIGAvc3RhdGljL2ltZy9zdGF0aW9ucy9tdC9qcGcvJHtzaXplfS8ke3N0YXRpb24ubXQuaW1nLmx0fS5qcGdgLFxuXTtcblxuZXhwb3J0IGNvbnN0IGxhbmdzVXJsID0gKHtsYW5nfSkgPT4gaW5kZXhVcmwoe2xhbmd9KSArIFwiL2xhbmd1YWdlc1wiO1xuXG5leHBvcnQgY29uc3QgcmVjZW50c1VybCA9ICh7bGFuZ30pID0+IGluZGV4VXJsKHtsYW5nfSkgKyBcIi9yZWNlbnRzXCI7XG5cbmV4cG9ydCBjb25zdCBnZW5yZUxpc3RVcmwgPSAoe2xhbmcsIGNvdW50cnlDb2RlfSkgPT4gXG4gIChjb3VudHJ5Q29kZSA/IFxuICAgIGNvdW50cnlVcmwoe2xhbmcsIGNvdW50cnlDb2RlfSkgOlxuICAgIGluZGV4VXJsKHtsYW5nfSlcbiAgKSArIFwiL2dlbnJlc1wiO1xuXG5cbmV4cG9ydCBjb25zdCBnZW5yZVVybCA9ICh7bGFuZywgY291bnRyeUNvZGUsIGdlbnJlfSkgPT4gZ2VucmVMaXN0VXJsKHtsYW5nLCBjb3VudHJ5Q29kZX0pICsgXCIvXCIgKyBnZW5yZTtcblxuZXhwb3J0IGNvbnN0IHNpZ25hbExpc3RVcmwgPSAoe2xhbmcsIGNvdW50cnlDb2RlLCB0eXBlfSkgPT4ge1xuICByZXR1cm4gKGNvdW50cnlDb2RlID8gY291bnRyeVVybCh7bGFuZywgY291bnRyeUNvZGV9KSA6IGluZGV4VXJsKHtsYW5nfSkpXG4gICAgICAgICArIFwiL3JhZGlvLVwiICsgdHlwZTtcbn1cblxuZXhwb3J0IGNvbnN0IHNpZ25hbFVybCA9ICh7bGFuZywgY291bnRyeUNvZGUsIHR5cGUsIGZyZWN9KSA9PiB7XG4gIHJldHVybiBzaWduYWxMaXN0VXJsKHtsYW5nLCBjb3VudHJ5Q29kZSwgdHlwZX0pICsgXCIvXCIgKyBmcmVjO1xufSIsIjxzdHlsZT5cbiAgLnRvcGJhci10aXRsZSB7XG4gICAgZmxleDogMTtcbiAgICBmb250LXNpemU6IDEuMjVlbTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgZGlyZWN0aW9uOiBsdHI7XG4gIH1cblxuICBhe1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgfVxuXG4gIGEgOmdsb2JhbChwaWN0dXJlKXtcbiAgICB3aWR0aDogMjRweDtcbiAgICBoZWlnaHQ6IDI0cHg7XG4gICAgbWFyZ2luLXJpZ2h0OiAwLjVlbTtcbiAgfVxuXG4gIC8qXG4gIC5mbGFne1xuICAgIHdpZHRoOiAyNHB4O1xuICAgIGhlaWdodDogMjRweDtcbiAgICBtYXJnaW4tcmlnaHQ6IDAuNWVtO1xuICAgIC8vdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0wLjFlbSk7XG4gIH1cbiAgKi9cblxuICAubGl0ZSB7XG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTtcbiAgfVxuXG4gIC8qXG4gIC5hcnJvd3tcbiAgICBtYXJnaW46IDAgMC4yNWVtOyBcbiAgfVxuICAqL1xuPC9zdHlsZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0IENvdW50cnlGbGFnIGZyb20gXCIvQ29tcG9uZW50cy9Db3VudHJ5RmxhZy5zdmVsdGVcIjtcblxuICBpbXBvcnQgKiBhcyBpMThuIGZyb20gXCIvQ29tbW9uL2kxOG5cIjtcbiAgY29uc3Qge3RyYW5zLCBsYW5nLCBjb3VudHJ5Q29kZX0gPSBpMThuLnN0b3JlcygpO1xuICBcbiAgaW1wb3J0IHtmbHlSaWdodH0gZnJvbSBcInN2ZWx0ZS1sYXlvdXQtYXdhcmUtdHJhbnNpdGlvbnNcIjtcblxuICBpbXBvcnQge2luZGV4VXJsLCBjb3VudHJ5VXJsfSBmcm9tIFwiL0NvbW1vbi91cmxzXCI7XG48L3NjcmlwdD5cblxuPGRpdiBjbGFzcz1cInRvcGJhci10aXRsZVwiPlxuICB7I2lmICRjb3VudHJ5Q29kZX1cbiAgICA8YSB0cmFuc2l0aW9uOmZseVJpZ2h0fGxvY2FsPXt7fX0gY2xhc3M9XCJuby1hXCIgaHJlZj17Y291bnRyeVVybCh7bGFuZzogJGxhbmcsIGNvdW50cnlDb2RlOiAkY291bnRyeUNvZGV9KX0gdGl0bGU9eyR0cmFucyhgY291bnRyaWVzLiR7JGNvdW50cnlDb2RlfWApfT5cbiAgICAgIDxDb3VudHJ5RmxhZyBzaXplPXsyNH0gY291bnRyeUNvZGU9eyRjb3VudHJ5Q29kZX0gLz5cbiAgICA8L2E+XG4gIHsvaWZ9XG4gIDxhIGNsYXNzPVwibm8tYVwiIGhyZWY9e2luZGV4VXJsKHtsYW5nOiAkbGFuZ30pfT5vcGVucmFkaW88c3BhbiBjbGFzcz1cImxpdGVcIj4uYXBwPC9zcGFuPjwvYT5cbjwvZGl2PlxuXG5cblxuIiwiaW1wb3J0IHsgY3ViaWNJbk91dCwgbGluZWFyLCBjdWJpY091dCB9IGZyb20gJy4uL2Vhc2luZyc7XG5pbXBvcnQgeyBpc19mdW5jdGlvbiwgYXNzaWduIH0gZnJvbSAnLi4vaW50ZXJuYWwnO1xuXG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG5cclxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XG5cbmZ1bmN0aW9uIGJsdXIobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY0luT3V0LCBhbW91bnQgPSA1LCBvcGFjaXR5ID0gMCB9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHRhcmdldF9vcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgZiA9IHN0eWxlLmZpbHRlciA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS5maWx0ZXI7XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKF90LCB1KSA9PiBgb3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfTsgZmlsdGVyOiAke2Z9IGJsdXIoJHt1ICogYW1vdW50fXB4KTtgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGZhZGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBsaW5lYXIgfSkge1xuICAgIGNvbnN0IG8gPSArZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5vcGFjaXR5O1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IHQgPT4gYG9wYWNpdHk6ICR7dCAqIG99YFxuICAgIH07XG59XG5mdW5jdGlvbiBmbHkobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCwgeCA9IDAsIHkgPSAwLCBvcGFjaXR5ID0gMCB9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHRhcmdldF9vcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICBjb25zdCBvZCA9IHRhcmdldF9vcGFjaXR5ICogKDEgLSBvcGFjaXR5KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAodCwgdSkgPT4gYFxuXHRcdFx0dHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7KDEgLSB0KSAqIHh9cHgsICR7KDEgLSB0KSAqIHl9cHgpO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfWBcbiAgICB9O1xufVxuZnVuY3Rpb24gc2xpZGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCB9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IG9wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCBoZWlnaHQgPSBwYXJzZUZsb2F0KHN0eWxlLmhlaWdodCk7XG4gICAgY29uc3QgcGFkZGluZ190b3AgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApO1xuICAgIGNvbnN0IHBhZGRpbmdfYm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKTtcbiAgICBjb25zdCBtYXJnaW5fdG9wID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5Ub3ApO1xuICAgIGNvbnN0IG1hcmdpbl9ib3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgY29uc3QgYm9yZGVyX3RvcF93aWR0aCA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgIGNvbnN0IGJvcmRlcl9ib3R0b21fd2lkdGggPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlckJvdHRvbVdpZHRoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiB0ID0+IGBvdmVyZmxvdzogaGlkZGVuO2AgK1xuICAgICAgICAgICAgYG9wYWNpdHk6ICR7TWF0aC5taW4odCAqIDIwLCAxKSAqIG9wYWNpdHl9O2AgK1xuICAgICAgICAgICAgYGhlaWdodDogJHt0ICogaGVpZ2h0fXB4O2AgK1xuICAgICAgICAgICAgYHBhZGRpbmctdG9wOiAke3QgKiBwYWRkaW5nX3RvcH1weDtgICtcbiAgICAgICAgICAgIGBwYWRkaW5nLWJvdHRvbTogJHt0ICogcGFkZGluZ19ib3R0b219cHg7YCArXG4gICAgICAgICAgICBgbWFyZ2luLXRvcDogJHt0ICogbWFyZ2luX3RvcH1weDtgICtcbiAgICAgICAgICAgIGBtYXJnaW4tYm90dG9tOiAke3QgKiBtYXJnaW5fYm90dG9tfXB4O2AgK1xuICAgICAgICAgICAgYGJvcmRlci10b3Atd2lkdGg6ICR7dCAqIGJvcmRlcl90b3Bfd2lkdGh9cHg7YCArXG4gICAgICAgICAgICBgYm9yZGVyLWJvdHRvbS13aWR0aDogJHt0ICogYm9yZGVyX2JvdHRvbV93aWR0aH1weDtgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNjYWxlKG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gY3ViaWNPdXQsIHN0YXJ0ID0gMCwgb3BhY2l0eSA9IDAgfSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0YXJnZXRfb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgY29uc3Qgc2QgPSAxIC0gc3RhcnQ7XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKF90LCB1KSA9PiBgXG5cdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSBzY2FsZSgkezEgLSAoc2QgKiB1KX0pO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfVxuXHRcdGBcbiAgICB9O1xufVxuZnVuY3Rpb24gZHJhdyhub2RlLCB7IGRlbGF5ID0gMCwgc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcgPSBjdWJpY0luT3V0IH0pIHtcbiAgICBjb25zdCBsZW4gPSBub2RlLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgaWYgKGR1cmF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHNwZWVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gODAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZHVyYXRpb24gPSBsZW4gLyBzcGVlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZHVyYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbihsZW4pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAodCwgdSkgPT4gYHN0cm9rZS1kYXNoYXJyYXk6ICR7dCAqIGxlbn0gJHt1ICogbGVufWBcbiAgICB9O1xufVxuZnVuY3Rpb24gY3Jvc3NmYWRlKF9hKSB7XG4gICAgdmFyIHsgZmFsbGJhY2sgfSA9IF9hLCBkZWZhdWx0cyA9IF9fcmVzdChfYSwgW1wiZmFsbGJhY2tcIl0pO1xuICAgIGNvbnN0IHRvX3JlY2VpdmUgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgdG9fc2VuZCA9IG5ldyBNYXAoKTtcbiAgICBmdW5jdGlvbiBjcm9zc2ZhZGUoZnJvbSwgbm9kZSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IGQgPT4gTWF0aC5zcXJ0KGQpICogMzAsIGVhc2luZyA9IGN1YmljT3V0IH0gPSBhc3NpZ24oYXNzaWduKHt9LCBkZWZhdWx0cyksIHBhcmFtcyk7XG4gICAgICAgIGNvbnN0IHRvID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgZHggPSBmcm9tLmxlZnQgLSB0by5sZWZ0O1xuICAgICAgICBjb25zdCBkeSA9IGZyb20udG9wIC0gdG8udG9wO1xuICAgICAgICBjb25zdCBkdyA9IGZyb20ud2lkdGggLyB0by53aWR0aDtcbiAgICAgICAgY29uc3QgZGggPSBmcm9tLmhlaWdodCAvIHRvLmhlaWdodDtcbiAgICAgICAgY29uc3QgZCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVsYXksXG4gICAgICAgICAgICBkdXJhdGlvbjogaXNfZnVuY3Rpb24oZHVyYXRpb24pID8gZHVyYXRpb24oZCkgOiBkdXJhdGlvbixcbiAgICAgICAgICAgIGVhc2luZyxcbiAgICAgICAgICAgIGNzczogKHQsIHUpID0+IGBcblx0XHRcdFx0b3BhY2l0eTogJHt0ICogb3BhY2l0eX07XG5cdFx0XHRcdHRyYW5zZm9ybS1vcmlnaW46IHRvcCBsZWZ0O1xuXHRcdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHt1ICogZHh9cHgsJHt1ICogZHl9cHgpIHNjYWxlKCR7dCArICgxIC0gdCkgKiBkd30sICR7dCArICgxIC0gdCkgKiBkaH0pO1xuXHRcdFx0YFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uKGl0ZW1zLCBjb3VudGVycGFydHMsIGludHJvKSB7XG4gICAgICAgIHJldHVybiAobm9kZSwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICBpdGVtcy5zZXQocGFyYW1zLmtleSwge1xuICAgICAgICAgICAgICAgIHJlY3Q6IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlcnBhcnRzLmhhcyhwYXJhbXMua2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJlY3QgfSA9IGNvdW50ZXJwYXJ0cy5nZXQocGFyYW1zLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJwYXJ0cy5kZWxldGUocGFyYW1zLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjcm9zc2ZhZGUocmVjdCwgbm9kZSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5vZGUgaXMgZGlzYXBwZWFyaW5nIGFsdG9nZXRoZXJcbiAgICAgICAgICAgICAgICAvLyAoaS5lLiB3YXNuJ3QgY2xhaW1lZCBieSB0aGUgb3RoZXIgbGlzdClcbiAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIG5lZWQgdG8gc3VwcGx5IGFuIG91dHJvXG4gICAgICAgICAgICAgICAgaXRlbXMuZGVsZXRlKHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxsYmFjayAmJiBmYWxsYmFjayhub2RlLCBwYXJhbXMsIGludHJvKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHRyYW5zaXRpb24odG9fc2VuZCwgdG9fcmVjZWl2ZSwgZmFsc2UpLFxuICAgICAgICB0cmFuc2l0aW9uKHRvX3JlY2VpdmUsIHRvX3NlbmQsIHRydWUpXG4gICAgXTtcbn1cblxuZXhwb3J0IHsgYmx1ciwgY3Jvc3NmYWRlLCBkcmF3LCBmYWRlLCBmbHksIHNjYWxlLCBzbGlkZSB9O1xuIiwiaW1wb3J0IHt3cml0YWJsZX0gZnJvbSBcInN2ZWx0ZS9zdG9yZVwiO1xuXG5leHBvcnQgY29uc3QgcGxheWVyU3RhdGUgPSB3cml0YWJsZSh7fSk7IiwiaW1wb3J0IHt3cml0YWJsZX0gZnJvbSBcInN2ZWx0ZS9zdG9yZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RvcmUoa2V5LCB2YWx1ZSl7XG4gIFxuICBjb25zdCBfZ2V0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgIGlmKGpzb24gIT0gbnVsbCl7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgX3NldCA9ICh2YWx1ZSkgPT4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuXG4gIGxldCBjdXJyZW50ID0gX2dldCgpO1xuICBcbiAgaWYoY3VycmVudCA9PSBudWxsKXtcbiAgICBfc2V0KHZhbHVlKTtcbiAgICBjdXJyZW50ID0gdmFsdWU7XG4gIH1cblxuICBjb25zdCBzdG9yZSA9IHdyaXRhYmxlKGN1cnJlbnQpO1xuXG4gIGNvbnN0IHNldCA9IChuZXdWYWx1ZSkgPT4ge1xuICAgIGN1cnJlbnQgPSBuZXdWYWx1ZTtcbiAgICBfc2V0KG5ld1ZhbHVlKTtcbiAgICBzdG9yZS5zZXQobmV3VmFsdWUpO1xuICB9XG5cbiAgY29uc3QgdXBkYXRlID0gKGNhbGxiYWNrKSA9PiBzZXQoY2FsbGJhY2soY3VycmVudCkpO1xuXG4gIGNvbnN0IGdldCA9ICgpID0+IGN1cnJlbnQ7XG5cbiAgY29uc3Qgc3Vic2NyaWJlID0gKC4uLmFyZ3MpID0+IHN0b3JlLnN1YnNjcmliZSguLi5hcmdzKTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN0b3JhZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgaWYoZXZlbnQua2V5ICE9PSBrZXkpIHJldHVybjtcbiAgICBjdXJyZW50ID0gSlNPTi5wYXJzZShldmVudC5uZXdWYWx1ZSk7XG4gICAgc3RvcmUuc2V0KGN1cnJlbnQpO1xuICB9KVxuXG4gIHJldHVybiB7Z2V0LCBzZXQsIHVwZGF0ZSwgc3Vic2NyaWJlLCBrZXl9XG59IiwiaW1wb3J0IHtzdG9yZX0gZnJvbSBcIi4vUGVyc2lzdGVudFN0b3JlXCI7XG5pbXBvcnQge3dyaXRhYmxlfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XG5cbmV4cG9ydCBsZXQgcmVjZW50TGlzdDtcblxuaWYocHJvY2Vzcy5icm93c2VyKXtcbiAgcmVjZW50TGlzdCA9IHN0b3JlKFwicmVjZW50LXN0YXRpb25zLXYxXCIsIFtdKTtcbn0gZWxzZSB7XG4gIHJlY2VudExpc3QgPSB3cml0YWJsZShbXSlcbn0iLCI8c3R5bGU+XG4uc2xpZGVye1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMC4yNWVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICBiYWNrZ3JvdW5kOiBjdXJyZW50Q29sb3I7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgfVxuXG4gIC50aHVtYntcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA1MCU7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgaGVpZ2h0OiAwLjVlbTtcbiAgICB3aWR0aDogMC41ZW07XG4gICAgYm9yZGVyLXJhZGl1czogMC41ZW07XG4gICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICBib3gtc2hhZG93OiByZ2JhKDAsMCwwLDAuMjUpIDAgMCAycHggMnB4O1xuICB9XG48L3N0eWxlPlxuXG48c2NyaXB0PlxuICBleHBvcnQgbGV0IHZhbHVlID0gMDtcbiAgbGV0IHNsaWRlcjtcblxuICBjb25zdCBoYW5kbGVEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgXG4gICAgY29uc3QgaGFuZGxlRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmNhbmNlbFwiLCBoYW5kbGVFbmQpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCBoYW5kbGVFbmQpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIGhhbmRsZU1vdmUpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZU1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YWx1ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChldmVudC54IC0gcmVjdC54KSAvIHJlY3Qud2lkdGggKSk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIGhhbmRsZU1vdmUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJjYW5jZWxcIiwgaGFuZGxlRW5kKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsIGhhbmRsZUVuZCk7XG5cbiAgICBoYW5kbGVNb3ZlKGV2ZW50KTtcbiAgfVxuXG48L3NjcmlwdD5cblxuPGRpdiBiaW5kOnRoaXM9e3NsaWRlcn0gY2xhc3M9XCJzbGlkZXJcIiBvbjpwb2ludGVyZG93bnxwcmV2ZW50RGVmYXVsdD17aGFuZGxlRG93bn0+XG4gIDxkaXYgY2xhc3M9XCJ0aHVtYlwiIHN0eWxlPVwibGVmdDoge3ZhbHVlICogMTAwfSVcIj48L2Rpdj5cbjwvZGl2PiIsIjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgc2l6ZSA9IFwiMWVtXCI7XG4gIGV4cG9ydCBsZXQgd2lkdGggPSBzaXplO1xuICBleHBvcnQgbGV0IGhlaWdodCA9IHNpemU7XG4gIGV4cG9ydCBsZXQgY29sb3IgPSBcImN1cnJlbnRDb2xvclwiO1xuICBleHBvcnQgbGV0IHZpZXdCb3ggPSBcIjAgMCAyNCAyNFwiO1xuPC9zY3JpcHQ+XG5cbjxzdmcgd2lkdGg9XCJ7d2lkdGh9XCIgaGVpZ2h0PVwie2hlaWdodH1cIiB2aWV3Qm94PVwie3ZpZXdCb3h9XCI+PHBhdGggZD1cIk0xMiw0TDkuOTEsNi4wOUwxMiw4LjE4TTQuMjcsM0wzLDQuMjdMNy43Myw5SDNWMTVIN0wxMiwyMFYxMy4yN0wxNi4yNSwxNy41M0MxNS41OCwxOC4wNCAxNC44MywxOC40NiAxNCwxOC43VjIwLjc3QzE1LjM4LDIwLjQ1IDE2LjYzLDE5LjgyIDE3LjY4LDE4Ljk2TDE5LjczLDIxTDIxLDE5LjczTDEyLDEwLjczTTE5LDEyQzE5LDEyLjk0IDE4LjgsMTMuODIgMTguNDYsMTQuNjRMMTkuOTcsMTYuMTVDMjAuNjIsMTQuOTEgMjEsMTMuNSAyMSwxMkMyMSw3LjcyIDE4LDQuMTQgMTQsMy4yM1Y1LjI5QzE2Ljg5LDYuMTUgMTksOC44MyAxOSwxMk0xNi41LDEyQzE2LjUsMTAuMjMgMTUuNSw4LjcxIDE0LDcuOTdWMTAuMThMMTYuNDUsMTIuNjNDMTYuNSwxMi40MyAxNi41LDEyLjIxIDE2LjUsMTJaXCIgZmlsbD1cIntjb2xvcn1cIi8+PC9zdmc+IiwiPHNjcmlwdD5cbmV4cG9ydCBsZXQgc2l6ZSA9IFwiMS41ZW1cIjtcbmV4cG9ydCBsZXQgd2lkdGggPSBzaXplO1xuZXhwb3J0IGxldCBoZWlnaHQgPSBzaXplO1xuZXhwb3J0IGxldCBjb2xvciA9IFwiY3VycmVudENvbG9yXCI7XG5leHBvcnQgbGV0IGZpbGwgPSBjb2xvclxuZXhwb3J0IGxldCBzdHJva2UgPSBjb2xvcjtcbmV4cG9ydCBsZXQgdmlld0JveCA9IFwiMCAwIDI0IDI0XCI7XG48L3NjcmlwdD5cbjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHt2aWV3Qm94fSB7d2lkdGh9IHtoZWlnaHR9IHtmaWxsfSB7c3Ryb2tlfT48cGF0aCBkPVwiTTMgOXY2aDRsNSA1VjRMNyA5SDN6bTEzLjUgM2MwLTEuNzctMS4wMi0zLjI5LTIuNS00LjAzdjguMDVjMS40OC0uNzMgMi41LTIuMjUgMi41LTQuMDJ6TTE0IDMuMjN2Mi4wNmMyLjg5Ljg2IDUgMy41NCA1IDYuNzFzLTIuMTEgNS44NS01IDYuNzF2Mi4wNmM0LjAxLS45MSA3LTQuNDkgNy04Ljc3cy0yLjk5LTcuODYtNy04Ljc3elwiLz48L3N2Zz4iLCI8c3R5bGU+XG4gIC52b2x1bWV7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBwYWRkaW5nOiAwLjVlbTtcbiAgICAvKlxuICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDEwMHB4O1xuICAgIGJveC1zaGFkb3c6IHJnYmEoMCwwLDAsMC40KSAwIDAgNHB4IDJweDtcbiAgICAqL1xuICB9XG5cbiAgLmljb257XG4gICAgZmxleDogbm9uZTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZGlzcGxheTogZmxleDtcbiAgfVxuXG4gIC5zbGlkZXJ7XG4gICAgd2lkdGg6IDIuNWVtO1xuICAgIGhlaWdodDogMC4yNWVtO1xuICAgIG1hcmdpbi1sZWZ0OiAwLjVlbTtcbiAgICBtYXJnaW4tcmlnaHQ6IC0zZW07XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDIwMG1zIGVhc2UsIG1hcmdpbi1yaWdodCAyMDBtcyBlYXNlO1xuICB9XG5cbiAgLnZvbHVtZTpob3ZlciAuc2xpZGVyLCAudm9sdW1lOmFjdGl2ZSAuc2xpZGVye1xuICAgIG1hcmdpbi1yaWdodDogMC41ZW07XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuPC9zdHlsZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0IFNsaWRlciBmcm9tIFwiL0NvbXBvbmVudHMvU2xpZGVyLnN2ZWx0ZVwiO1xuXG4gIGltcG9ydCBWb2x1bWVPZmYgZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy9Wb2x1bWVPZmYuc3ZlbHRlXCI7XG4gIGltcG9ydCBWb2x1bWVNdXRlIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMvVm9sdW1lTXV0ZS5zdmVsdGVcIjtcbiAgaW1wb3J0IFZvbHVtZURvd24gZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy0wL2Rpc3QvVm9sdW1lRG93bi5zdmVsdGVcIjtcbiAgaW1wb3J0IFZvbHVtZVVwIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMtMC9kaXN0L1ZvbHVtZVVwLnN2ZWx0ZVwiO1xuXG4gIGV4cG9ydCBsZXQgdm9sdW1lID0gMTtcbiAgZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbiAgbGV0IHRvZ2dsZVZvbHVtZSA9IDA7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZSgpe1xuICAgIGlmKHZvbHVtZSA9PT0gMCl7XG4gICAgICBpZih0b2dnbGVWb2x1bWUgPT09IDApIHZvbHVtZSA9IDE7XG4gICAgICBlbHNlIHZvbHVtZSA9IHRvZ2dsZVZvbHVtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9nZ2xlVm9sdW1lID0gdm9sdW1lO1xuICAgICAgdm9sdW1lID0gMDtcbiAgICB9XG4gIH1cbjwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPVwidm9sdW1lXCI+XG5cbiAgPGRpdiBjbGFzcz1cInNsaWRlclwiPlxuICAgIDxTbGlkZXIgYmluZDp2YWx1ZT17dm9sdW1lfSAvPlxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwic3BhY2VyXCI+PC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImljb25cIiBvbjpjbGljaz17dG9nZ2xlfT5cbiAgICB7I2lmIHZvbHVtZSA9PT0gMH1cbiAgICAgIDxWb2x1bWVPZmYge3NpemV9Lz5cbiAgICB7OmVsc2V9XG4gICAgICA8Vm9sdW1lVXAge3NpemV9Lz5cbiAgICB7L2lmfVxuICA8L2Rpdj5cblxuPC9kaXY+IiwiPHNjcmlwdCBjb250ZXh0PVwibW9kdWxlXCI+XG4gIC8vY29uc3Qga2V5bWFwID0ge2x0OiBcImx0XCIsIGd0OiBcImd0XCIsIHc5NjogXCJsdFwifVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgaW1ne1xuICAgIHdpZHRoOiB2YXIoLS13aWR0aCk7XG4gICAgaGVpZ2h0OiBjYWxjKHZhcigtLXdpZHRoKSAqIDAuNjg3NSk7XG4gICAgb2JqZWN0LWZpdDogY292ZXI7XG4gICAgb2JqZWN0LXBvc2l0aW9uOiBjZW50ZXI7XG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICB9XG48L3N0eWxlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQge3N0YXRpb25JbWdVcmx9IGZyb20gXCIvQ29tbW9uL3VybHNcIjtcblxuICBleHBvcnQgbGV0IHN0YXRpb247XG4gIGV4cG9ydCBsZXQgc2l6ZTsgLy8gXCJsdFwiIHwgXCJndFwiIHwgXCJ3OTZcIlxuICBcbiAgLy9jb25zdCBbd2VicCwgbGVnYWN5XSA9IHN0YXRpb25JbWdVcmwoc2l6ZSwgc3RhdGlvbi5pbWdba2V5bWFwW3NpemVdXSk7XG4gICQ6IFt3ZWJwLCBsZWdhY3ldID0gc3RhdGlvbkltZ1VybChzaXplLCBzdGF0aW9uKTtcbiAgJDogbGVnYWN5VHlwZSA9IHN0YXRpb24ub3JpZ2luICE9IFwibXRcIiA/IFwiaW1hZ2UvcG5nXCIgOiBcImltYWdlL2pwZ1wiO1xuPC9zY3JpcHQ+XG5cbjxwaWN0dXJlPlxuICA8c291cmNlIHNyY3NldD17d2VicH0gdHlwZT1cImltYWdlL3dlYnBcIj5cbiAgPGltZyBzcmM9e2xlZ2FjeX0gYWx0PXtzdGF0aW9uLm5hbWV9ID5cbjwvcGljdHVyZT4iLCI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHNpemUgPSBcIjFlbVwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBzaXplO1xuICBleHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbiAgZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuXG48c3ZnIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgdmlld0JveD1cInt2aWV3Qm94fVwiPjxwYXRoIGQ9XCJNOCw1LjE0VjE5LjE0TDE5LDEyLjE0TDgsNS4xNFpcIiBmaWxsPVwie2NvbG9yfVwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHNpemUgPSBcIjFlbVwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBzaXplO1xuICBleHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbiAgZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuXG48c3ZnIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgdmlld0JveD1cInt2aWV3Qm94fVwiPjxwYXRoIGQ9XCJNMTQsMTlIMThWNUgxNE02LDE5SDEwVjVINlYxOVpcIiBmaWxsPVwie2NvbG9yfVwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHNpemUgPSBcIjFlbVwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBzaXplO1xuICBleHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbiAgZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuXG48c3ZnIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgdmlld0JveD1cInt2aWV3Qm94fVwiPjxwYXRoIGQ9XCJNMTksNi40MUwxNy41OSw1TDEyLDEwLjU5TDYuNDEsNUw1LDYuNDFMMTAuNTksMTJMNSwxNy41OUw2LjQxLDE5TDEyLDEzLjQxTDE3LjU5LDE5TDE5LDE3LjU5TDEzLjQxLDEyTDE5LDYuNDFaXCIgZmlsbD1cIntjb2xvcn1cIi8+PC9zdmc+IiwiPHN0eWxlPlxuQGtleWZyYW1lcyBDaXJjdWxhclByb2dyZXNzQ2lyY2xlSW5kZXRlcm1pbmF0ZXtcbiAgMCUge1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IDFweCwgMjAwcHg7XG4gICAgc3Ryb2tlLWRhc2hvZmZzZXQ6IDBweDtcbiAgfVxuXG4gIDUwJSB7XG4gICAgICBzdHJva2UtZGFzaGFycmF5OiAxMDBweCwgMjAwcHg7XG4gICAgICBzdHJva2UtZGFzaG9mZnNldDogLTE1cHg7XG4gIH1cblxuICAxMDAlIHtcbiAgICAgIHN0cm9rZS1kYXNoYXJyYXk6IDEwMHB4LCAyMDBweDtcbiAgICAgIHN0cm9rZS1kYXNob2Zmc2V0OiAtMTI1cHg7XG4gIH1cbn1cblxuQGtleWZyYW1lcyBDaXJjdWxhclByb2dyZXNzUm90YXRle1xuICAxMDAlIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xuICB9XG59XG5cbi5jaXJjdWxhci1wcm9ncmVzc3tcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFuaW1hdGlvbjogQ2lyY3VsYXJQcm9ncmVzc1JvdGF0ZSAxLjRzIGxpbmVhciBpbmZpbml0ZTtcbn1cblxuLmNpcmNsZS5pbmRldGVybWluYXRle1xuICBhbmltYXRpb246IENpcmN1bGFyUHJvZ3Jlc3NDaXJjbGVJbmRldGVybWluYXRlIDEuNHMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XG4gIHN0cm9rZS1kYXNoYXJyYXk6IDgwcHgsIDIwMHB4O1xuICBzdHJva2UtZGFzaG9mZnNldDogMHB4O1xufVxuPC9zdHlsZT5cblxuPHNjcmlwdD5cblxubGV0IGNsYXNzTmFtZSA9IFwiXCI7XG5leHBvcnQge2NsYXNzTmFtZSBhcyBjbGFzc307XG5cbmV4cG9ydCBsZXQgc3R5bGUgPSBcIlwiO1xuZXhwb3J0IGxldCB2YWx1ZSA9IG51bGw7XG5leHBvcnQgbGV0IHZhcmlhbnQgPSBcImluZGV0ZXJtaW5hdGVcIjsgLy8gXCJzdGF0aWNcIiwgXCJkZXRlcm1pbmF0ZVwiXG5leHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcblxuZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbmV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbmV4cG9ydCBsZXQgd2lkdGggPSBzaXplO1xuXG4kOiBpZih2YWx1ZSAhPSBudWxsICYmIHZhcmlhbnQgPT09IFwiaW5kZXRlcm1pbmF0ZVwiKSB2YXJpYW50ID0gXCJzdGF0aWNcIjtcbjwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPVwiY2lyY3VsYXItcHJvZ3Jlc3Mge3ZhcmlhbnR9IHtjbGFzc05hbWV9XCIge3N0eWxlfT5cbiAgPHN2ZyB2aWV3Qm94PVwiMjIgMjIgNDQgNDRcIiB7aGVpZ2h0fSB7d2lkdGh9PlxuICAgIDxjaXJjbGUgY2xhc3M9XCJjaXJjbGUgaW5kZXRlcm1pbmF0ZVwiIGN4PVwiNDRcIiBjeT1cIjQ0XCIgcj1cIjE4XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9e2NvbG9yfSBzdHJva2Utd2lkdGg9XCI1XCI+PC9jaXJjbGU+XG4gIDwvc3ZnPlxuPC9kaXY+IiwiPHN2ZWx0ZTpvcHRpb25zIGFjY2Vzc29ycz17dHJ1ZX0vPlxuXG48c3R5bGU+XG4gIC5mbG9hdGluZ3BsYXllcntcbiAgICBkaXJlY3Rpb246IGx0cjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogdmFyKC0tYWRiYXItaGVpZ2h0KTtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDg2cHg7XG4gICAgXG4gICAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwwLDAsMC4yNSksIDAgMXB4IDVweCByZ2JhKDAsMCwwLDAuMjIpO1xuICAgIGNvbG9yOiAjMjkyOTI5O1xuICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgXG4gICAgYm9yZGVyLXRvcDogcmdiYSgwLDAsMCwwLjE1KSAxcHggc29saWQ7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcblxuICAgIC0tc3BhY2luZzogMC41ZW07XG4gICAgLS1idXR0b24tc2l6ZTogMi41ZW07XG4gIH1cblxuICAucGxheWVye1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgfVxuXG4gIC5pbWFnZXtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIG1hcmdpbi1sZWZ0OiAwLjVlbTtcbiAgICAtLXdpZHRoOiA4NXB4O1xuICAgIHdpZHRoOiB2YXIoLS13aWR0aCk7XG4gICAgYm9yZGVyLXJhZGl1czogMnB4IDAgMCAycHg7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgXG4gIH1cblxuICAudGV4dHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICBmbGV4OiAxO1xuICB9XG5cbiAgLnRleHQgPiBhe1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICBwYWRkaW5nOiAxLjI1ZW07XG4gIH1cblxuICAudm9sdW1le1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgY29sb3I6ICM2NjY7XG4gICAgbWFyZ2luLXJpZ2h0OiB2YXIoLS1zcGFjaW5nKTtcbiAgfVxuXG4gIC50b2dnbGUsIC5jbG9zZXtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZm9udC1zaXplOiAxLjI1ZW07XG4gICAgY29sb3I6ICM2NjY7XG4gICAgYm94LXNpemluZzogY29udGVudC1ib3g7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGZsZXg6IG5vbmU7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICBoZWlnaHQ6IHZhcigtLWJ1dHRvbi1zaXplKTtcbiAgICB3aWR0aDogdmFyKC0tYnV0dG9uLXNpemUpO1xuICAgIG1hcmdpbi1yaWdodDogdmFyKC0tc3BhY2luZyk7XG4gIH1cblxuICAuY292ZXJ7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICByaWdodDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwwLDAsMC41KTtcbiAgfVxuXG4gIC5pY29ue1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgbWFyZ2luOiBhdXRvO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coIzAwMCAwIDAgMnB4KTtcbiAgfVxuXG4gIC5tZWRpYS1lbGVtZW50e1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cblxuICBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA2MDBweCl7XG4gICAgLmZsb2F0aW5ncGxheWVye1xuICAgICAgLS1zcGFjaW5nOiAxZW07XG4gICAgfVxuXG4gICAgLnZvbHVtZXtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgfVxuICB9XG48L3N0eWxlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQge2ZseSwgZmFkZX0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7XG5cbiAgaW1wb3J0IHtwbGF5ZXJTdGF0ZX0gZnJvbSBcIi9TdG9yZXMvcGxheWVyU3RhdGVcIjtcbiAgaW1wb3J0IHtyZWNlbnRMaXN0fSBmcm9tIFwiL1N0b3Jlcy9yZWNlbnRMaXN0XCI7XG5cbiAgLy9pbXBvcnQgU3RhdGVJY29uIGZyb20gXCIvQ29tcG9uZW50cy9TdGF0ZUljb24uc3ZlbHRlXCJcbiAgaW1wb3J0IFZvbHVtZSBmcm9tIFwiL0NvbXBvbmVudHMvVm9sdW1lLnN2ZWx0ZVwiXG4gIGltcG9ydCBTdGF0aW9uSW1hZ2UgZnJvbSBcIi9Db21wb25lbnRzL1N0YXRpb25JbWFnZS5zdmVsdGVcIlxuICBcblxuICBpbXBvcnQgUGxheSBmcm9tIFwic3ZlbHRlLW1hdGVyaWFsLWljb25zL1BsYXkuc3ZlbHRlXCI7XG4gIGltcG9ydCBQYXVzZSBmcm9tIFwic3ZlbHRlLW1hdGVyaWFsLWljb25zL1BhdXNlLnN2ZWx0ZVwiO1xuICBpbXBvcnQgQ2xvc2UgZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy9DbG9zZS5zdmVsdGVcIjtcbiAgaW1wb3J0IExvYWRpbmcgZnJvbSBcIi9Db21wb25lbnRzL0xvYWRpbmcuc3ZlbHRlXCI7XG5cbiAgaW1wb3J0ICogYXMgaTE4biBmcm9tIFwiL0NvbW1vbi9pMThuXCI7XG4gIGNvbnN0IHtsYW5nfSA9IGkxOG4uc3RvcmVzKCk7XG5cbiAgaW1wb3J0IHtzdGF0aW9uVXJsLCBzdGF0aW9uSW1nVXJsfSBmcm9tIFwiL0NvbW1vbi91cmxzXCI7XG5cbiAgZXhwb3J0IGxldCBtZWRpYUVsZW1lbnQgPSBudWxsO1xuICBleHBvcnQgbGV0IHN0YXRpb24gPSBudWxsO1xuICBleHBvcnQgbGV0IHN0YXRlID0gXCJwYXVzZWRcIjsgLy8gcGxheWluZywgbG9hZGluZywgdW5zdGFydGVkXG4gIC8vZXhwb3J0IGxldCByZWFsbHlQbGF5aW5nID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgdm9sdW1lID0gMTtcbiAgLy9leHBvcnQgbGV0IHNob3dWb2x1bWUgPSB0cnVlO1xuICAkOiBoaWRkZW4gPSBzdGF0aW9uID09IG51bGw7XG5cbiAgJDogcGxheWVyU3RhdGUuc2V0KHtzdGF0aW9uLCBzdGF0ZSwgaGlkZGVufSk7XG5cbiAgbGV0IGhsc1Byb21pc2U7XG4gIGNvbnN0IGdldEhscyA9IGFzeW5jICgpID0+IHtcbiAgICBpZih0eXBlb2YgSGxzICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIEhscztcbiAgICBcbiAgICBpZihobHNQcm9taXNlICE9IG51bGwpXG4gICAgICByZXR1cm4gaGxzUHJvbWlzZTtcblxuICAgIHJldHVybiBobHNQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgIHNjcmlwdC5zcmMgPSBcIi9zdGF0aWMvanMvaGxzLmpzXCI7XG4gICAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gcmVzb2x2ZShIbHMpO1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSlcbiAgfVxuXG4gIGxldCBobHMgPSBudWxsO1xuXG4gIGNvbnN0IGhhbmRsZVN0YWxsZWQgPSBldmVudCA9PiBzdGF0ZSA9IFwibG9hZGluZ1wiO1xuICBjb25zdCBoYW5kbGVQbGF5ID0gZXZlbnQgPT4gc3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgY29uc3QgaGFuZGxlUGxheWluZyA9IGV2ZW50ID0+IHN0YXRlID0gXCJwbGF5aW5nXCI7XG4gIGNvbnN0IGhhbmRsZVBhdXNlID0gZXZlbnQgPT4gc3RhdGUgPSBcInBhdXNlZFwiO1xuICBjb25zdCBoYW5kbGVFcnJvciA9IGNvbnNvbGUubG9nO1xuXG4gIGV4cG9ydCBmdW5jdGlvbiBjbG9zZSgpe1xuICAgIG1lZGlhRWxlbWVudC5wYXVzZSgpO1xuICAgIG1lZGlhRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgbWVkaWFFbGVtZW50LmxvYWQoKTtcbiAgICBpZihobHMgIT0gbnVsbCl7XG4gICAgICBobHMuZGVzdHJveSgpO1xuICAgICAgaGxzID0gbnVsbDtcbiAgICB9XG4gICAgc3RhdGlvbiA9IG51bGw7XG4gIH1cblxuICBjb25zdCBwbGF5SGxzID0gYXN5bmMgdXJsID0+IHtcbiAgICBjb25zdCBIbHMgPSBhd2FpdCBnZXRIbHMoKTtcbiAgICBcbiAgICBpZighSGxzLmlzU3VwcG9ydGVkKCkpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRyeXtcbiAgICAgIC8vYWx3YXlzIHByb3h5XG4gICAgICAvL3VybCA9IHVybC5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSA/IFwiL3Byb3h5L1wiICsgdXJsIDogdXJsO1xuICAgICAgdXJsID0gYC9wcm94eS8ke3VybH1gO1xuICAgICAgaGxzID0gbmV3IEhscygpO1xuICAgICAgXG4gICAgICBobHMub24oSGxzLkV2ZW50cy5FUlJPUiwgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHt0eXBlLCBkZXRhaWxzLCBmYXRhbH0gPSBkYXRhO1xuICAgICAgICBmb3IoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKEhscy5FcnJvclR5cGVzKSl7XG4gICAgICAgICAgaWYodHlwZSA9PT0gdmFsdWUpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQsIGRhdGEpO1xuICAgICAgfSlcbiAgICAgIFxuICAgICAgc3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgICAgIGF3YWl0IGhscy5sb2FkU291cmNlKHVybCk7XG4gICAgICBhd2FpdCBobHMuYXR0YWNoTWVkaWEobWVkaWFFbGVtZW50KTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gaGxzLm9uKEhscy5FdmVudHMuTUFOSUZFU1RfUEFSU0VELCByZXNvbHZlKSlcbiAgICAgIGF3YWl0IG1lZGlhRWxlbWVudC5wbGF5KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHBsYXlGaWxlID0gYXN5bmMgdXJsID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gYWx3YXlzIHByb3h5IGh0dHAgKGF2b2lkIGNocm9tZSBibG9jaylcbiAgICAgIGlmKCF1cmwuc3RhcnRzV2l0aChcImh0dHBzXCIpKSB7XG4gICAgICAgIHVybCA9IGAvcHJveHkvJHt1cmx9YDtcbiAgICAgIH1cblxuICAgICAgbWVkaWFFbGVtZW50LnNyYyA9IHVybDtcbiAgICAgIGF3YWl0IG1lZGlhRWxlbWVudC5sb2FkKCk7XG4gICAgICBhd2FpdCBtZWRpYUVsZW1lbnQucGxheSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwbGF5U3RyZWFtID0gc3RyZWFtID0+IHtcbiAgICBjb25zb2xlLmxvZyhBcnJheS5mcm9tKE9iamVjdC52YWx1ZXMoc3RyZWFtKSkpO1xuICAgIGlmKHN0cmVhbS50eXBlID09PSBcImhsc1wiKXtcbiAgICAgIHJldHVybiBwbGF5SGxzKHN0cmVhbS51cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGxheUZpbGUoc3RyZWFtLnVybCk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBsYXkoc3QgPSBudWxsKXtcbiAgICBpZihzdCA9PSBudWxsIHx8IChzdGF0aW9uICYmIHN0YXRpb24uX2lkID09PSBzdC5faWQpKXtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG1lZGlhRWxlbWVudC5wbGF5KCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzdGF0aW9uID0gc3Q7XG5cbiAgICByZWNlbnRMaXN0LnVwZGF0ZShsaXN0ID0+IHtcbiAgICAgIGxldCBoZWxwZXIgPSBsaXN0LmZpbHRlcihpdGVtID0+IGl0ZW0uX2lkICE9PSBzdGF0aW9uLl9pZCk7XG4gICAgICBjb25zdCB7X2lkLCBjb3VudHJ5Q29kZSwgbmFtZSwgc2x1ZywgbXQsIG9yaWdpbn0gPSBzdGF0aW9uO1xuICAgICAgY29uc3QgaXRlbSA9IHtfaWQsIGNvdW50cnlDb2RlLCBuYW1lLCBzbHVnLCBtdCwgb3JpZ2lufTtcbiAgICAgIGhlbHBlciA9IFtpdGVtLCAuLi5oZWxwZXJdLnNsaWNlKDAsIDYwKTtcbiAgICAgIHJldHVybiBoZWxwZXI7XG4gICAgfSlcblxuICAgIGNvbnN0IHN0cmVhbXMgPSBzb3J0U3RyZWFtcyhzdGF0aW9uKTtcbiAgICBcbiAgICBpZihzdHJlYW1zLmxlbmd0aCA9PT0gMCl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHN0cmVhbXMubGVuZ3RoOyBpKyspe1xuICAgICAgY29uc3Qgc3RyZWFtID0gc3RyZWFtc1tpXTtcbiAgICAgIGlmKGF3YWl0IHBsYXlTdHJlYW0oc3RyZWFtKSl7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcGF1c2UoKXtcbiAgICBtZWRpYUVsZW1lbnQucGF1c2UoKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiB0b2dnbGUoKXtcbiAgICBzd2l0Y2goc3RhdGUpe1xuICAgICAgY2FzZSBcInBsYXlpbmdcIjpcbiAgICAgIGNhc2UgXCJsb2FkaW5nXCI6XG4gICAgICAgIHBhdXNlKCk7IGJyZWFrO1xuICAgICAgY2FzZSBcInBhdXNlZFwiOiBcbiAgICAgICAgcGxheSgpOyBicmVhaztcbiAgICB9XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gc29ydFN0cmVhbXMoc3RhdGlvbil7XG4gICAgY29uc3QgYWx3YXlzID0gW107XG4gICAgY29uc3QgcHJvYmFibHkgPSBbXTtcbiAgICBjb25zdCBtYXliZSA9IFtdO1xuICAgIGNvbnN0IGhsc0RpcmVjdCA9IFtdO1xuICAgIGNvbnN0IGhsc1Byb3h5ID0gW107XG4gICAgXG4gICAgc3RhdGlvbi5zdHJlYW1zLmZvckVhY2goc3RyZWFtID0+IHtcbiAgICAgIGlmKHN0cmVhbS50eXBlID09PSBcInJ0bXBcIikgcmV0dXJuO1xuICAgICAgaWYoc3RyZWFtLnR5cGUgPT09IFwiaGxzXCIpe1xuICAgICAgICBpZihzdHJlYW0udXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpKXtcbiAgICAgICAgICBobHNQcm94eS5wdXNoKHN0cmVhbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGxzRGlyZWN0LnB1c2goc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2FuID0gbWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKHN0cmVhbS5taW1lKTtcbiAgICAgICAgaWYoY2FuID09PSBcImFsd2F5c1wiKSBhbHdheXMucHVzaChzdHJlYW0pO1xuICAgICAgICBlbHNlIGlmKGNhbiA9PT0gXCJtYXliZVwiKSBtYXliZS5wdXNoKHN0cmVhbSk7XG4gICAgICAgIGVsc2UgaWYoY2FuID09PSBcInByb2JhYmx5XCIpIHByb2JhYmx5LnB1c2goc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIFxuICAgIHJldHVybiBbLi4uYWx3YXlzLCAuLi5wcm9iYWJseSwgLi4ubWF5YmUsIC4uLmhsc0RpcmVjdCwgLi4uaGxzUHJveHldO1xuICB9XG48L3NjcmlwdD5cblxueyNpZiBzdGF0aW9uICE9IG51bGx9XG4gIDxkaXYgY2xhc3M9XCJmbG9hdGluZ3BsYXllciB7c3RhdGV9XCIgdHJhbnNpdGlvbjpmbHk9e3t4OiAwLCB5OiA1MCwgZHVyYXRpb246IDM1MH19PlxuICAgIFxuICAgIDwhLS0tXG4gICAgPGRpdiBjbGFzcz1cImltYWdlXCIgc3R5bGU9e2ltYWdlU3R5bGV9PlxuICAgICAgPGRpdiBjbGFzcz1cImNvdmVyXCIgb246Y2xpY2s9e3RvZ2dsZX0+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgPFN0YXRlSWNvbiB7c3RhdGV9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICAtLT5cblxuICAgIDxhIGNsYXNzPVwibm8tYSBpbWFnZVwiIGhyZWY9e3N0YXRpb25Vcmwoe2xhbmc6ICRsYW5nLCBzdGF0aW9ufSl9PlxuICAgICAgPFN0YXRpb25JbWFnZSB7c3RhdGlvbn0gc2l6ZT1cInc5NlwiLz5cbiAgICAgIHsjaWYgc3RhdGUgPT09IFwibG9hZGluZ1wifVxuICAgICAgICA8ZGl2IGNsYXNzPVwiY292ZXJcIiB0cmFuc2l0aW9uOmZhZGU9e3tkdXJhdGlvbjogMTAwfX0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgIDxMb2FkaW5nIHNpemU9XCIzMHB4XCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICB7L2lmfVxuICAgIDwvYT5cblxuICAgIDxkaXYgY2xhc3M9XCJ0ZXh0XCI+XG4gICAgICA8YSBjbGFzcz1cIm5vLWFcIiBocmVmPXtzdGF0aW9uVXJsKHtsYW5nOiAkbGFuZywgc3RhdGlvbn0pfT57c3RhdGlvbi5uYW1lfTwvYT5cbiAgICA8L2Rpdj5cblxuICAgIFxuICAgIDxkaXYgY2xhc3M9XCJ2b2x1bWVcIj5cbiAgICAgIDxWb2x1bWUgYmluZDp2b2x1bWUgLz5cbiAgICA8L2Rpdj5cbiAgICBcbiAgICA8ZGl2IGNsYXNzPVwidG9nZ2xlXCIgb246Y2xpY2s9e3RvZ2dsZX0+XG4gICAgICB7I2lmIHN0YXRlID09PSBcInBhdXNlZFwifVxuICAgICAgICA8UGxheSBzaXplPVwiMS41ZW1cIi8+XG4gICAgICB7OmVsc2V9XG4gICAgICAgIDxQYXVzZSBzaXplPVwiMS41ZW1cIiAvPlxuICAgICAgey9pZn1cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJjbG9zZVwiIG9uOmNsaWNrPXtjbG9zZX0+XG4gICAgICA8Q2xvc2Ugc2l6ZT1cIjEuNWVtXCIvPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbnsvaWZ9XG5cbjxhdWRpb1xuICBiaW5kOnRoaXM9e21lZGlhRWxlbWVudH1cbiAgY2xhc3M9XCJtZWRpYS1lbGVtZW50XCJcbiAgYmluZDp2b2x1bWVcbiAgb246c3RhbGxlZD17aGFuZGxlU3RhbGxlZH1cbiAgb246cGxheT17aGFuZGxlUGxheX1cbiAgb246cGxheWluZz17aGFuZGxlUGxheWluZ31cbiAgb246cGF1c2U9e2hhbmRsZVBhdXNlfVxuICBvbjplcnJvcj17aGFuZGxlRXJyb3J9XG4vPiIsIjxzY3JpcHQ+XG5leHBvcnQgbGV0IHNpemUgPSBcIjEuNWVtXCI7XG5leHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbmV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbmV4cG9ydCBsZXQgY29sb3IgPSBcImN1cnJlbnRDb2xvclwiO1xuZXhwb3J0IGxldCBmaWxsID0gY29sb3JcbmV4cG9ydCBsZXQgc3Ryb2tlID0gY29sb3I7XG5leHBvcnQgbGV0IHZpZXdCb3ggPSBcIjAgMCAyNCAyNFwiO1xuPC9zY3JpcHQ+XG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB7dmlld0JveH0ge3dpZHRofSB7aGVpZ2h0fSB7ZmlsbH0ge3N0cm9rZX0+PHBhdGggZD1cIk0xNS41IDE0aC0uNzlsLS4yOC0uMjdDMTUuNDEgMTIuNTkgMTYgMTEuMTEgMTYgOS41IDE2IDUuOTEgMTMuMDkgMyA5LjUgM1MzIDUuOTEgMyA5LjUgNS45MSAxNiA5LjUgMTZjMS42MSAwIDMuMDktLjU5IDQuMjMtMS41N2wuMjcuMjh2Ljc5bDUgNC45OUwyMC40OSAxOWwtNC45OS01em0tNiAwQzcuMDEgMTQgNSAxMS45OSA1IDkuNVM3LjAxIDUgOS41IDUgMTQgNy4wMSAxNCA5LjUgMTEuOTkgMTQgOS41IDE0elwiLz48L3N2Zz4iLCI8c3R5bGU+XG4gIC5zZWFyY2h7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAwIDAgMCAwLjc1ZW07XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjI1KTtcbiAgICBib3JkZXItcmFkaXVzOiAxMDBweDtcbiAgfVxuXG4gIC5maWVsZHtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBwYWRkaW5nOiAwLjVlbTtcbiAgICBvdXRsaW5lOiBub25lO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAvKmJveC1zaGFkb3c6IHJnYmEoMCwwLDAsMC4xNSkgMCAxcHggMnB4IDJweDsqL1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcblxuXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgY29sb3I6ICNmZmY7XG4gIH1cblxuICAuZmllbGQ6OnBsYWNlaG9sZGVye1xuICAgIGNvbG9yOiByZ2JhKDI1NSwyNTUsMjU1LDAuOCk7XG4gIH1cbiAgXG4gIC5pY29ue1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cblxuICAvKiBjbGVhcnMgdGhlICdYJyBmcm9tIEludGVybmV0IEV4cGxvcmVyICovXG4gIGlucHV0W3R5cGU9c2VhcmNoXTo6LW1zLWNsZWFyLFxuICBpbnB1dFt0eXBlPXNlYXJjaF06Oi1tcy1yZXZlYWwge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgd2lkdGg6IDA7XG4gICAgaGVpZ2h0OiAwOyBcbiAgfVxuXG4gIC8qIGNsZWFycyB0aGUgJ1gnIGZyb20gQ2hyb21lICovXG4gIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLWRlY29yYXRpb24sXG4gIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLWNhbmNlbC1idXR0b24sXG4gIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLXJlc3VsdHMtYnV0dG9uLFxuICBpbnB1dFt0eXBlPVwic2VhcmNoXCJdOjotd2Via2l0LXNlYXJjaC1yZXN1bHRzLWRlY29yYXRpb24ge1xuICAgIGRpc3BsYXk6IG5vbmU7IFxufVxuPC9zdHlsZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0IHtnb3RvIGFzIGdvfSBmcm9tIFwiQHNhcHBlci9hcHBcIjtcbiAgaW1wb3J0IHtzdG9yZXN9IGZyb20gXCJAc2FwcGVyL2FwcFwiO1xuICBjb25zdCB7c2Vzc2lvbiwgcGFnZX0gPSBzdG9yZXMoKTtcblxuICBpbXBvcnQgU2VhcmNoIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMtMC9kaXN0L1NlYXJjaC5zdmVsdGVcIjtcbiAgaW1wb3J0IHtzZWFyY2hVcmwsIHNlYXJjaEFjdGlvblVybH0gZnJvbSBcIi9Db21tb24vdXJsc1wiO1xuXG4gIGltcG9ydCAqIGFzIGkxOG4gZnJvbSBcIi9Db21tb24vaTE4blwiO1xuICBjb25zdCB7dHJhbnMsIGxhbmcsIGNvdW50cnlDb2RlfSA9IGkxOG4uc3RvcmVzKCk7XG5cbiAgZXhwb3J0IGxldCB2YWx1ZSA9ICRwYWdlLnF1ZXJ5LnEgfHwgXCJcIjsgXG4gIGV4cG9ydCBsZXQgaW5wdXQgPSB2b2lkIDA7XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHN1Ym1pdCgpe1xuICAgIC8vIFJlbW92ZSBjb3VudHJ5IGxpbWl0ZWQgc2VhcmNoXG4gICAgLy8gdmFsdWUudHJpbSgpICYmIGdvKHNlYXJjaFVybCh7bGFuZzogJGxhbmcsIHE6IHZhbHVlLnRyaW0oKSwgY291bnRyeUNvZGU6ICRjb3VudHJ5Q29kZSB9KSk7XG4gICAgdmFsdWUudHJpbSgpICYmIGdvKHNlYXJjaFVybCh7bGFuZzogJGxhbmcsIHE6IHZhbHVlLnRyaW0oKSB9KSk7XG4gIH1cblxuICBsZXQgYWN0aW9uLCBwbGFjZWhvbGRlcjtcbiAgLy8gUmVtb3ZlIGNvdW50cnkgbGltaXRlZCBzZWFyY2hcbiAgLy8gJDogYWN0aW9uID0gc2VhcmNoQWN0aW9uVXJsKHtsYW5nOiAkbGFuZywgY291bnRyeUNvZGU6ICRjb3VudHJ5Q29kZX0pO1xuICAkOiBhY3Rpb24gPSBzZWFyY2hBY3Rpb25Vcmwoe2xhbmc6ICRsYW5nfSk7XG5cbiAgLy8gUmVtb3ZlIGNvdW50cnkgbGltaXRlZCBzZWFyY2hcbiAgLy8gJDogcGxhY2Vob2xkZXIgPSAkY291bnRyeUNvZGUgPyAkdHJhbnMoXCJzZWFyY2gucGxhY2Vob2xkZXIuY291bnRyeVwiLCB7Y291bnRyeTogJHRyYW5zKGBjb3VudHJpZXMuJHskY291bnRyeUNvZGV9YCl9KSA6ICR0cmFucyhcInNlYXJjaC5wbGFjZWhvbGRlci5nbG9iYWxcIik7XG4gICQ6IHBsYWNlaG9sZGVyID0gJHRyYW5zKFwic2VhcmNoLnBsYWNlaG9sZGVyLmdsb2JhbFwiKTtcbjwvc2NyaXB0PlxuXG48Zm9ybSBjbGFzcz1cInNlYXJjaFwiIG1ldGhvZD1cImdldFwiIHthY3Rpb259IG9uOnN1Ym1pdHxwcmV2ZW50RGVmYXVsdD17c3VibWl0fT5cbiAgPGRpdiBjbGFzcz1cImljb25cIj5cbiAgICA8U2VhcmNoIHNpemU9XCIxLjI1ZW1cIi8+XG4gIDwvZGl2PlxuICA8aW5wdXQgXG4gICAgYmluZDp0aGlzPXtpbnB1dH0gXG4gICAgY2xhc3M9XCJmaWVsZFwiXG4gICAgdHlwZT1cInNlYXJjaFwiXG4gICAgbmFtZT1cInFcIlxuICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgYmluZDp2YWx1ZVxuICAgIHtwbGFjZWhvbGRlcn1cbiAgPlxuPC9mb3JtPiIsIjxzY3JpcHQ+XG5leHBvcnQgbGV0IHNpemUgPSBcIjEuNWVtXCI7XG5leHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbmV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbmV4cG9ydCBsZXQgY29sb3IgPSBcImN1cnJlbnRDb2xvclwiO1xuZXhwb3J0IGxldCBmaWxsID0gY29sb3JcbmV4cG9ydCBsZXQgc3Ryb2tlID0gY29sb3I7XG5leHBvcnQgbGV0IHZpZXdCb3ggPSBcIjAgMCAyNCAyNFwiO1xuPC9zY3JpcHQ+XG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB7dmlld0JveH0ge3dpZHRofSB7aGVpZ2h0fSB7ZmlsbH0ge3N0cm9rZX0+PHBhdGggZD1cIk0zIDE4aDE4di0ySDN2MnptMC01aDE4di0ySDN2MnptMC03djJoMThWNkgzelwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuZXhwb3J0IGxldCBzaXplID0gXCIxLjVlbVwiO1xuZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG5leHBvcnQgbGV0IGhlaWdodCA9IHNpemU7XG5leHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbmV4cG9ydCBsZXQgZmlsbCA9IGNvbG9yXG5leHBvcnQgbGV0IHN0cm9rZSA9IGNvbG9yO1xuZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIge3ZpZXdCb3h9IHt3aWR0aH0ge2hlaWdodH0ge2ZpbGx9IHtzdHJva2V9PjxwYXRoIGQ9XCJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyelwiLz48L3N2Zz4iLCJleHBvcnQgZGVmYXVsdCB7fTsiLCI8c3R5bGU+XG4gIC50b3BiYXIge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiA5OTk5O1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogdmFyKC0tdG9wYmFyLWhlaWdodCk7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGNvbG9yOiB2YXIoLS1jb250cmFzdC1jb2xvcik7XG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjI1KSAwIDFweCAycHggMnB4O1xuICB9XG5cbiAgLnBob25lLFxuICAuZGVza3RvcCB7XG4gICAgaGVpZ2h0OiB2YXIoLS10b3BvYmFyLWhlaWdodCk7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cblxuICAuZGVza3RvcCB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gIEBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDYwMHB4KSB7XG4gICAgLmRlc2t0b3Age1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICB9XG5cbiAgICAucGhvbmUge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gIH1cblxuICAudG91Y2hzcXVhcmUge1xuICAgIGZsZXg6IG5vbmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogdmFyKC0tdG9wYmFyLWhlaWdodCk7XG4gICAgaGVpZ2h0OiB2YXIoLS10b3BiYXItaGVpZ2h0KTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAyMDBtcyBlYXNlO1xuICB9XG5cbiAgLnRvdWNoc3F1YXJlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMjUpO1xuICB9XG5cbiAgLmljb24ge1xuICAgIGZsZXg6IG5vbmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBtYXJnaW46IGF1dG87XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICB9XG5cbiAgLmRlc2t0b3AgOmdsb2JhbCgudG9wYmFyLXRpdGxlKXtcbiAgICBmbGV4OiBub25lO1xuICAgIG1hcmdpbi1yaWdodDogMS41ZW07XG4gIH1cblxuICAuc2VhcmNoIHtcbiAgICBmbGV4OiAxO1xuICB9XG5cbiAgLmRlc2t0b3AgLnNlYXJjaHtcbiAgICBwYWRkaW5nLXJpZ2h0OiAxLjVyZW07XG4gIH1cbjwvc3R5bGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBUb3BiYXJUaXRsZSBmcm9tIFwiLi9Ub3BiYXJUaXRsZS5zdmVsdGVcIjtcbiAgaW1wb3J0IFBsYXllciBmcm9tIFwiLi9QbGF5ZXIuc3ZlbHRlXCI7XG4gIGltcG9ydCBTZWFyY2ggZnJvbSBcIi4vU2VhcmNoLnN2ZWx0ZVwiO1xuXG4gIGltcG9ydCBNZW51IGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMtMC9kaXN0L01lbnUuc3ZlbHRlXCI7XG4gIGltcG9ydCBDbG9zZSBmcm9tIFwic3ZlbHRlLW1hdGVyaWFsLWljb25zLTAvZGlzdC9DbG9zZS5zdmVsdGVcIjtcbiAgaW1wb3J0IFNlYXJjaEljb24gZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy0wL2Rpc3QvU2VhcmNoLnN2ZWx0ZVwiO1xuXG4gIGltcG9ydCBEQVNIIGZyb20gXCIuL0RBU0hcIjtcbiAgaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gXCJzdmVsdGVcIjtcblxuICBjb25zdCB7bmF2T3BlbiwgdG9nZ2xlTmF2fSA9IGdldENvbnRleHQoREFTSCk7XG5cbiAgLy9leHBvcnQgbGV0IG1lbnVPcGVuID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgbW9kZSA9IFwibm9ybWFsXCI7IC8vIG9yIFwic2VhcmNoXCI7XG4gIC8vIGV4cG9ydCBsZXQgdmFsdWUgPSB2b2lkIDA7XG4gIGxldCBtb2JpbGVTZWFyY2g7XG4gIGxldCBzZWFyY2hJbnB1dDtcbiAgbGV0IHN1Ym1pdDtcblxuICBleHBvcnQgbGV0IHRvZ2dsZVNlYXJjaCA9ICgpID0+IHtcbiAgICBpZiAobW9kZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgbW9kZSA9IFwic2VhcmNoXCI7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNlYXJjaElucHV0LmZvY3VzKCksIDEwKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFwic2VhcmNoXCIpIHtcbiAgICAgIG1vZGUgPSBcIm5vcm1hbFwiO1xuICAgIH1cbiAgfTsgIFxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJ0b3BiYXJcIiBjbGFzczptb2RlPlxuXG4gIDxkaXYgY2xhc3M9XCJwaG9uZVwiPlxuICAgIHsjaWYgbW9kZSA9PT0gJ25vcm1hbCd9XG4gICAgICA8ZGl2IGNsYXNzPVwidG91Y2hzcXVhcmVcIiBvbjpjbGljaz17dG9nZ2xlTmF2fT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICB7I2lmICRuYXZPcGVufVxuICAgICAgICAgICAgPENsb3NlIC8+XG4gICAgICAgICAgezplbHNlfVxuICAgICAgICAgICAgPE1lbnUgLz5cbiAgICAgICAgICB7L2lmfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgPFRvcGJhclRpdGxlLz5cblxuICAgICAgPGRpdiBjbGFzcz1cInRvdWNoc3F1YXJlXCIgb246Y2xpY2s9e3RvZ2dsZVNlYXJjaH0+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgPFNlYXJjaEljb24gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICB7OmVsc2UgaWYgbW9kZSA9PT0gJ3NlYXJjaCd9XG4gICAgICA8ZGl2IGNsYXNzPVwidG91Y2hzcXVhcmVcIiBvbjpjbGljaz17dG9nZ2xlU2VhcmNofT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICA8Q2xvc2UgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaFwiPlxuICAgICAgICA8U2VhcmNoIGJpbmQ6aW5wdXQ9e3NlYXJjaElucHV0fSBiaW5kOnRoaXM9e21vYmlsZVNlYXJjaH0vPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0b3VjaHNxdWFyZVwiIG9uOmNsaWNrPXsoKSA9PiBtb2JpbGVTZWFyY2guc3VibWl0KCl9PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgIDxTZWFyY2hJY29uIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgey9pZn1cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImRlc2t0b3BcIj5cbiAgICA8ZGl2IGNsYXNzPVwidG91Y2hzcXVhcmVcIiBvbjpjbGljaz17dG9nZ2xlTmF2fT5cbiAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+XG4gICAgICAgIHsjaWYgJG5hdk9wZW59XG4gICAgICAgICAgPENsb3NlIC8+XG4gICAgICAgIHs6ZWxzZX1cbiAgICAgICAgICA8TWVudSAvPlxuICAgICAgICB7L2lmfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICA8VG9wYmFyVGl0bGUgLz5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWFyY2hcIj5cbiAgICAgIDxTZWFyY2gvPlxuICAgIDwvZGl2PlxuXG4gIDwvZGl2PlxuPC9kaXY+XG4iLCI8c2NyaXB0PlxuZXhwb3J0IGxldCBzaXplID0gXCIxLjVlbVwiO1xuZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG5leHBvcnQgbGV0IGhlaWdodCA9IHNpemU7XG5leHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbmV4cG9ydCBsZXQgZmlsbCA9IGNvbG9yXG5leHBvcnQgbGV0IHN0cm9rZSA9IGNvbG9yO1xuZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIge3ZpZXdCb3h9IHt3aWR0aH0ge2hlaWdodH0ge2ZpbGx9IHtzdHJva2V9PjxwYXRoIGQ9XCJNMTUuNDEgNy40MUwxNCA2bC02IDYgNiA2IDEuNDEtMS40MUwxMC44MyAxMnpcIi8+PC9zdmc+IiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBjb2xvciA9IFwiY3VycmVudENvbG9yXCI7XG4gIGV4cG9ydCBsZXQgdmlld0JveCA9IFwiMCAwIDI0IDI0XCI7XG48L3NjcmlwdD5cblxuPHN2ZyB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIHZpZXdCb3g9XCJ7dmlld0JveH1cIj48cGF0aCBkPVwiTTEyLjg3LDE1LjA3TDEwLjMzLDEyLjU2TDEwLjM2LDEyLjUzQzEyLjEsMTAuNTkgMTMuMzQsOC4zNiAxNC4wNyw2SDE3VjRIMTBWMkg4VjRIMVY2SDEyLjE3QzExLjUsNy45MiAxMC40NCw5Ljc1IDksMTEuMzVDOC4wNywxMC4zMiA3LjMsOS4xOSA2LjY5LDhINC42OUM1LjQyLDkuNjMgNi40MiwxMS4xNyA3LjY3LDEyLjU2TDIuNTgsMTcuNThMNCwxOUw5LDE0TDEyLjExLDE3LjExTDEyLjg3LDE1LjA3TTE4LjUsMTBIMTYuNUwxMiwyMkgxNEwxNS4xMiwxOUgxOS44N0wyMSwyMkgyM0wxOC41LDEwTTE1Ljg4LDE3TDE3LjUsMTIuNjdMMTkuMTIsMTdIMTUuODhaXCIgZmlsbD1cIntjb2xvcn1cIi8+PC9zdmc+IiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBjb2xvciA9IFwiY3VycmVudENvbG9yXCI7XG4gIGV4cG9ydCBsZXQgdmlld0JveCA9IFwiMCAwIDI0IDI0XCI7XG48L3NjcmlwdD5cblxuPHN2ZyB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIHZpZXdCb3g9XCJ7dmlld0JveH1cIj48cGF0aCBkPVwiTTE3LjksMTcuMzlDMTcuNjQsMTYuNTkgMTYuODksMTYgMTYsMTZIMTVWMTNBMSwxIDAgMCwwIDE0LDEySDhWMTBIMTBBMSwxIDAgMCwwIDExLDlWN0gxM0EyLDIgMCAwLDAgMTUsNVY0LjU5QzE3LjkzLDUuNzcgMjAsOC42NCAyMCwxMkMyMCwxNC4wOCAxOS4yLDE1Ljk3IDE3LjksMTcuMzlNMTEsMTkuOTNDNy4wNSwxOS40NCA0LDE2LjA4IDQsMTJDNCwxMS4zOCA0LjA4LDEwLjc4IDQuMjEsMTAuMjFMOSwxNVYxNkEyLDIgMCAwLDAgMTEsMThNMTIsMkExMCwxMCAwIDAsMCAyLDEyQTEwLDEwIDAgMCwwIDEyLDIyQTEwLDEwIDAgMCwwIDIyLDEyQTEwLDEwIDAgMCwwIDEyLDJaXCIgZmlsbD1cIntjb2xvcn1cIi8+PC9zdmc+IiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBjb2xvciA9IFwiY3VycmVudENvbG9yXCI7XG4gIGV4cG9ydCBsZXQgdmlld0JveCA9IFwiMCAwIDI0IDI0XCI7XG48L3NjcmlwdD5cblxuPHN2ZyB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIHZpZXdCb3g9XCJ7dmlld0JveH1cIj48cGF0aCBkPVwiTTEyLDIwQTgsOCAwIDAsMSA0LDEyQTgsOCAwIDAsMSAxMiw0QTgsOCAwIDAsMSAyMCwxMkE4LDggMCAwLDEgMTIsMjBNMTIsMkExMCwxMCAwIDAsMCAyLDEyQTEwLDEwIDAgMCwwIDEyLDIyQTEwLDEwIDAgMCwwIDIyLDEyQTEwLDEwIDAgMCwwIDEyLDJNMTYuMjQsNy43NkMxNS4wNyw2LjU4IDEzLjUzLDYgMTIsNlYxMkw3Ljc2LDE2LjI0QzEwLjEsMTguNTggMTMuOSwxOC41OCAxNi4yNCwxNi4yNEMxOC41OSwxMy45IDE4LjU5LDEwLjEgMTYuMjQsNy43NlpcIiBmaWxsPVwie2NvbG9yfVwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHNpemUgPSBcIjFlbVwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBzaXplO1xuICBleHBvcnQgbGV0IGNvbG9yID0gXCJjdXJyZW50Q29sb3JcIjtcbiAgZXhwb3J0IGxldCB2aWV3Qm94ID0gXCIwIDAgMjQgMjRcIjtcbjwvc2NyaXB0PlxuXG48c3ZnIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgdmlld0JveD1cInt2aWV3Qm94fVwiPjxwYXRoIGQ9XCJNOSw3VjE3SDExVjEzSDE0VjExSDExVjlIMTVWN0g5TTUsM0gxOUEyLDIgMCAwLDEgMjEsNVYxOUEyLDIgMCAwLDEgMTksMjFINUEyLDIgMCAwLDEgMywxOVY1QTIsMiAwIDAsMSA1LDNaXCIgZmlsbD1cIntjb2xvcn1cIi8+PC9zdmc+IiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzaXplID0gXCIxZW1cIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IHNpemU7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gc2l6ZTtcbiAgZXhwb3J0IGxldCBjb2xvciA9IFwiY3VycmVudENvbG9yXCI7XG4gIGV4cG9ydCBsZXQgdmlld0JveCA9IFwiMCAwIDI0IDI0XCI7XG48L3NjcmlwdD5cblxuPHN2ZyB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIHZpZXdCb3g9XCJ7dmlld0JveH1cIj48cGF0aCBkPVwiTTEyLDJBMTAsMTAgMCAwLDEgMjIsMTJBMTAsMTAgMCAwLDEgMTIsMjJBMTAsMTAgMCAwLDEgMiwxMkExMCwxMCAwIDAsMSAxMiwyTTExLDdBMiwyIDAgMCwwIDksOVYxN0gxMVYxM0gxM1YxN0gxNVY5QTIsMiAwIDAsMCAxMyw3SDExTTExLDlIMTNWMTFIMTFWOVpcIiBmaWxsPVwie2NvbG9yfVwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBmYWRlIH0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7XG4gIGltcG9ydCBDbG9zZSBmcm9tIFwic3ZlbHRlLW1hdGVyaWFsLWljb25zLTAvZGlzdC9DaGV2cm9uTGVmdC5zdmVsdGVcIjtcbiAgaW1wb3J0IExhbmdzIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMvVHJhbnNsYXRlLnN2ZWx0ZVwiO1xuICBpbXBvcnQgQ291bnRyaWVzIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMvRWFydGguc3ZlbHRlXCI7XG4gIGltcG9ydCBSZWNlbnRzIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMvVGltZWxhcHNlLnN2ZWx0ZVwiO1xuICBpbXBvcnQgR2VucmVzIGZyb20gXCJzdmVsdGUtbWF0ZXJpYWwtaWNvbnMvR29vZ2xlUGFnZXMuc3ZlbHRlXCI7XG4gIGltcG9ydCBGbXMgZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy9BbHBoYUZCb3guc3ZlbHRlXCI7XG4gIGltcG9ydCBBbXMgZnJvbSBcInN2ZWx0ZS1tYXRlcmlhbC1pY29ucy9BbHBoYUFDaXJjbGUuc3ZlbHRlXCI7XG5cbiAgaW1wb3J0IHsgc3RvcmVzIH0gZnJvbSBcIkBzYXBwZXIvYXBwXCI7XG4gIGNvbnN0IHsgcGFnZSB9ID0gc3RvcmVzKCk7XG5cbiAgaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgaW1wb3J0IERBU0ggZnJvbSBcIi4vREFTSFwiO1xuICBjb25zdCB7IG5hdk9wZW4sIGNsb3NlTmF2LCBvcGVuTmF2IH0gPSBnZXRDb250ZXh0KERBU0gpO1xuXG4gIGltcG9ydCB7XG4gICAgaW5kZXhVcmwsXG4gICAgbGFuZ3NVcmwsXG4gICAgcmVjZW50c1VybCxcbiAgICBnZW5yZUxpc3RVcmwsXG4gICAgc2lnbmFsTGlzdFVybFxuICB9IGZyb20gXCIvQ29tbW9uL3VybHNcIjtcblxuICBpbXBvcnQgKiBhcyBpMThuIGZyb20gXCIvQ29tbW9uL2kxOG5cIjtcbiAgY29uc3QgeyBsYW5nLCB0cmFucywgY291bnRyeUNvZGUsIGNvdW50cnkgfSA9IGkxOG4uc3RvcmVzKCk7XG5cbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSBldmVudCA9PiB7XG4gICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICBkbyB7XG4gICAgICBpZiAodGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcbiAgICAgICAgbmF2T3Blbi5zZXQoZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IHdoaWxlICgodGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQpKTtcbiAgfTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIC5jb3ZlciB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xuICAgIHotaW5kZXg6IDE1MDAwO1xuICB9XG4gIC5tZW51IHtcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICB3aWR0aDogMzAwcHg7XG4gICAgbWF4LXdpZHRoOiA4MCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHotaW5kZXg6IDE1MTAwO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTA1JSk7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDE1MG1zIGVhc2UtaW4tb3V0O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgfVxuICAub3BlbiA+IC5tZW51IHtcbiAgICB0cmFuc2Zvcm06IG5vbmU7XG4gIH1cbiAgLnRpdGxlIHtcbiAgICBmb250LXNpemU6IDEuNXJlbTtcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDE1MG1zIGVhc2U7XG4gICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJvcmRlci1ib3R0b206IHJnYmEoMCwgMCwgMCwgMC4xNSkgMXB4IHNvbGlkO1xuICAgIGZsZXg6IG5vbmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cbiAgLnRpdGxlIHNwYW4ge1xuICAgIG9wYWNpdHk6IDAuNDtcbiAgfVxuICAuY2xvc2Uge1xuICAgIGZsZXg6IG5vbmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmb250LXNpemU6IDAuNzVlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIDIwMG1zIGVhc2U7XG4gIH1cbiAgLmNsb3NlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDYxLCA5MCwgMjU0LCAwLjI1KTtcbiAgfVxuICAuY29udGVudCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGZsZXg6IDE7XG4gICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICBvdmVyZmxvdy14OiBoaWRkZW47XG4gICAgZm9udC1zaXplOiAxLjI1ZW07XG4gIH1cblxuICAuZ3JvdXAge1xuICAgIHBhZGRpbmc6IDAuNWVtIDA7XG4gICAgZmxleDogbm9uZTtcbiAgfVxuXG4gIC5ncm91cCArIC5ncm91cCB7XG4gICAgYm9yZGVyLXRvcDogcmdiYSgwLCAwLCAwLCAwLjE1KSAxcHggc29saWQ7XG4gIH1cblxuICAuY29udGVudCBhIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICBwYWRkaW5nOiAwLjVlbSAxZW07XG4gIH1cblxuICAuY29udGVudCBhID4gc3BhbiB7XG4gICAgbWFyZ2luLWxlZnQ6IDAuNzVlbTtcbiAgfVxuXG4gIC5sYW5ncyB7XG4gICAgbWFyZ2luLXRvcDogYXV0bztcbiAgfVxuPC9zdHlsZT5cblxuPG5hdiBjbGFzcz1cIm5hdlwiIGNsYXNzOm9wZW49eyRuYXZPcGVufT5cbiAgeyNpZiAkbmF2T3Blbn1cbiAgICA8ZGl2XG4gICAgICB0cmFuc2l0aW9uOmZhZGU9e3sgZHVyYXRpb246IDIwMCB9fVxuICAgICAgY2xhc3M9XCJjb3ZlclwiXG4gICAgICBvbjpjbGljaz17Y2xvc2VOYXZ9IC8+XG4gIHsvaWZ9XG4gIDxkaXYgY2xhc3M9XCJtZW51XCIgb246Y2xpY2s9e2hhbmRsZUNsaWNrfT5cbiAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjbG9zZVwiIG9uOmNsaWNrPXtjbG9zZU5hdn0+XG4gICAgICAgIDxDbG9zZSAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8YSBjbGFzcz1cIm5vLWFcIiBocmVmPXtpbmRleFVybCh7IGxhbmc6ICRsYW5nIH0pfT5cbiAgICAgICAgb3BlbnJhZGlvXG4gICAgICAgIDxzcGFuPi5hcHA8L3NwYW4+XG4gICAgICA8L2E+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBzY3JvbGxiYXJcIj5cblxuICAgICAgPGRpdiBjbGFzcz1cImdyb3VwXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGEgY2xhc3M9XCJuby1hXCIgaHJlZj17cmVjZW50c1VybCh7IGxhbmc6ICRsYW5nIH0pfT5cbiAgICAgICAgICAgIDxSZWNlbnRzIC8+XG4gICAgICAgICAgICA8c3Bhbj57JHRyYW5zKCduYXYucmVjZW50cycpfTwvc3Bhbj5cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXBcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5vLWFcIiBocmVmPXtpbmRleFVybCh7IGxhbmc6ICRsYW5nIH0pfT5cbiAgICAgICAgICAgIDxDb3VudHJpZXMgLz5cbiAgICAgICAgICAgIDxzcGFuPnskdHJhbnMoJ25hdi5jb3VudHJpZXMnKX08L3NwYW4+XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPCEtLVxuICAgICAgPGRpdj5cbiAgICAgICAgPGEgY2xhc3M9XCJuby1hXCIgaHJlZj17Z2VucmVMaXN0VXJsKHtsYW5nOiAkbGFuZywgY291bnRyeUNvZGU6ICRjb3VudHJ5Q29kZX0pfT5cbiAgICAgICAgICA8R2VucmVzIC8+XG4gICAgICAgICAgPHNwYW4+eyR0cmFucyhcIm5hdi5nZW5yZXNcIil9PC9zcGFuPlxuICAgICAgICA8L2E+XG4gICAgICA8L2Rpdj5cbiAgICAgIC0tPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXBcIj5cbiAgICAgICAgeyNpZiAhJGNvdW50cnkgfHwgKCRjb3VudHJ5ICYmICRjb3VudHJ5LmZtQ291bnQpfVxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBjbGFzcz1cIm5vLWFcIlxuICAgICAgICAgICAgICBocmVmPXtzaWduYWxMaXN0VXJsKHtcbiAgICAgICAgICAgICAgICBsYW5nOiAkbGFuZyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnZm0nLFxuICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlOiAkY291bnRyeUNvZGVcbiAgICAgICAgICAgICAgfSl9PlxuICAgICAgICAgICAgICA8Rm1zIC8+XG4gICAgICAgICAgICAgIDxzcGFuPnskdHJhbnMoJ25hdi5mbXMnKX08L3NwYW4+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIHsvaWZ9XG5cbiAgICAgICAgeyNpZiAhJGNvdW50cnkgfHwgKCRjb3VudHJ5ICYmICRjb3VudHJ5LmFtQ291bnQpfVxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBjbGFzcz1cIm5vLWFcIlxuICAgICAgICAgICAgICBocmVmPXtzaWduYWxMaXN0VXJsKHtcbiAgICAgICAgICAgICAgICBsYW5nOiAkbGFuZyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYW0nLFxuICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlOiAkY291bnRyeUNvZGVcbiAgICAgICAgICAgICAgfSl9PlxuICAgICAgICAgICAgICA8QW1zIC8+XG4gICAgICAgICAgICAgIDxzcGFuPnskdHJhbnMoJ25hdi5hbXMnKX08L3NwYW4+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIHsvaWZ9XG4gICAgICA8L2Rpdj5cblxuICAgICAgPCEtLSBUT0RPOiBNT1ZFIFRPIEZPT1RFUiAtLT5cbiAgICAgIDxkaXYgY2xhc3M9XCJncm91cCBsYW5nc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibGFuZ3NcIj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5vLWFcIiBocmVmPXtsYW5nc1VybCh7IGxhbmc6ICRsYW5nIH0pfT5cbiAgICAgICAgICAgIDxMYW5ncyAvPlxuICAgICAgICAgICAgPHNwYW4+eyR0cmFucygnbmF2LmxhbmdzJyl9PC9zcGFuPlxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG48L25hdj5cbiIsImxldCBwbGF5ZXIgPSBudWxsO1xuXG5leHBvcnQgY29uc3Qgc2V0UGxheWVyID0gKHBsKSA9PiBwbGF5ZXIgPSBwbDtcblxuZXhwb3J0IGNvbnN0IGdldFBsYXllciA9ICgpID0+IHBsYXllcjsiLCI8c3R5bGU+XG4gIC5kYXNoYm9hcmR7XG4gICAgcGFkZGluZy10b3A6IHZhcigtLXRvcGJhci1oZWlnaHQpO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgfVxuXG4gIC5vci1hZGJhciB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGJvdHRvbTogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogdmFyKC0tYWRiYXItaGVpZ2h0KTtcbiAgICBtYXgtaGVpZ2h0OiB2YXIoLS1hZGJhci1oZWlnaHQpO1xuICAgIG1pbi1oZWlnaHQ6IHZhcigtLWFkYmFyLWhlaWdodCk7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBiYWNrZ3JvdW5kOiAjZGRkO1xuICAgIGJvcmRlci10b3A6ICM5OTkgMXB4IHNvbGlkO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB9XG5cbiAgaW5zIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gIH1cbjwvc3R5bGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBUb3BiYXIgZnJvbSBcIi4vVG9wYmFyLnN2ZWx0ZVwiO1xuICBpbXBvcnQgUGxheWVyIGZyb20gXCIuL1BsYXllci5zdmVsdGVcIjtcbiAgLy9pbXBvcnQgRmxvYXRpbmdMaXN0IGZyb20gXCIuL0Zsb2F0aW5nTGlzdC5zdmVsdGVcIjtcbiAgaW1wb3J0IE5hdiBmcm9tIFwiLi9OYXYuc3ZlbHRlXCI7XG5cbiAgaW1wb3J0IHsgc2V0Q29udGV4dCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XG4gIGltcG9ydCBEQVNIIGZyb20gXCIuL0RBU0hcIlxuICBleHBvcnQgY29uc3QgbmF2T3BlbiA9IHdyaXRhYmxlKGZhbHNlKTtcbiAgc2V0Q29udGV4dChEQVNILCB7XG4gICAgbmF2T3BlbixcbiAgICBjbG9zZU5hdjogKCkgPT4gbmF2T3Blbi5zZXQoZmFsc2UpLFxuICAgIG9wZW5OYXY6ICgpID0+IG5hdk9wZW4uc2V0KHRydWUpLFxuICAgIHRvZ2dsZU5hdjogKCkgPT4gbmF2T3Blbi51cGRhdGUoYiA9PiAhYilcbiAgfSk7XG5cblxuXHRpbXBvcnQge3NldFBsYXllcn0gZnJvbSBcIi9TdG9yZXMvcGxheWVyXCI7XG4gIGxldCBwbGF5ZXI7XG4gICQ6IHNldFBsYXllcihwbGF5ZXIpO1xuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJkYXNoYm9hcmRcIj5cbiAgPFRvcGJhci8+XG4gIDxtYWluIGNsYXNzPVwibWFpblwiPlxuICAgIDxzbG90Lz5cbiAgPC9tYWluPlxuICA8TmF2Lz5cbiAgPFBsYXllciBiaW5kOnRoaXM9e3BsYXllcn0gLz5cbiAgPGRpdiBjbGFzcz1cIm9yLWFkYmFyXCI+XG4gICAgPGlucyBjbGFzcz1cImFkc2J5Z29vZ2xlXCJcbiAgICAgICAgIHN0eWxlPVwiZGlzcGxheTpibG9ja1wiXG4gICAgICAgICBkYXRhLWFkLWNsaWVudD1cImNhLXB1Yi02MjI5NjU2MzczNDk0MjYzXCJcbiAgICAgICAgIGRhdGEtYWQtc2xvdD1cIjc5MDE1NjkwNzBcIlxuICAgICAgICAgZGF0YS1hZC1mb3JtYXQ9XCJhdXRvXCJcbiAgICAgICAgIGRhdGEtYWR0ZXN0PVwib25cIlxuICAgICAgICAgZGF0YS1mdWxsLXdpZHRoLXJlc3BvbnNpdmU9XCJ0cnVlXCI+XG4gICAgPC9pbnM+XG4gIDwvZGl2PlxuPC9kaXY+IiwiPHNjcmlwdD5cbiAgaW1wb3J0IHtzdG9yZXN9IGZyb20gXCJAc2FwcGVyL2FwcFwiO1xuICBjb25zdCB7cGFnZX0gPSBzdG9yZXMoKTsgXG5cbiAgaW1wb3J0ICogYXMgaTE4biBmcm9tIFwiL0NvbW1vbi9pMThuXCI7XG4gIGNvbnN0IHtjb3VudHJ5Q29kZX0gPSBpMThuLnN0b3JlcygpO1xuICBcbiAgaW1wb3J0IHtjYW5vbmljYWx9IGZyb20gXCIvQ29tbW9uL3VybHNcIjtcblxuICBpbXBvcnQgbWFwIGZyb20gXCIvZGIvZGF0YS9sYW5ncy5qc29uXCI7XG4gICQ6IGxhbmdzID0gT2JqZWN0LnZhbHVlcyhtYXApLm1hcChsYW5nID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdXJsOiBjYW5vbmljYWwoXCIvXCIgKyBsYW5nLmNvZGUgKyAkcGFnZS5wYXRoLnNsaWNlKDMpKSxcbiAgICAgIC8vbGFuZzogbGFuZy5jb2RlICsgKCRjb3VudHJ5Q29kZSA/IChcIi1cIiArICRjb3VudHJ5Q29kZS50b1VwcGVyQ2FzZSgpKSA6IFwiXCIpXG4gICAgICBsYW5nOiBsYW5nLmNvZGVcbiAgICB9XG4gIH0pO1xuPC9zY3JpcHQ+XG5cbjxzdmVsdGU6aGVhZD5cbiAgeyNlYWNoIGxhbmdzIGFzIGxhbmd9XG4gICAgPGxpbmsgcmVsPVwiYWx0ZXJuYXRlXCIgaHJlZmxhbmc9e2xhbmcubGFuZ30gaHJlZj17bGFuZy51cmx9PlxuICB7L2VhY2h9XG48L3N2ZWx0ZTpoZWFkPiIsIjxzY3JpcHQ+XG5cdC8vaW1wb3J0IHtzZXRDb250ZXh0fSBmcm9tIFwic3ZlbHRlXCI7XG5cblx0aW1wb3J0IERhc2hib2FyZCBmcm9tIFwiL0NvbXBvbmVudHMvRGFzaGJvYXJkLnN2ZWx0ZVwiO1xuXG5cdGltcG9ydCBBbHRlcm5hdGVzIGZyb20gXCIvQ29tcG9uZW50cy9BbHRlcm5hdGVzLnN2ZWx0ZVwiO1xuXG5cdGltcG9ydCB7c3RvcmVzfSBmcm9tIFwiQHNhcHBlci9hcHBcIjtcblx0Y29uc3Qge3BhZ2UsIHNlc3Npb259ID0gc3RvcmVzKCk7XG5cblx0aW1wb3J0ICogYXMgaTE4biBmcm9tIFwiL0NvbW1vbi9pMThuXCI7XG5cdGNvbnN0IHtsYW5nLCB0cmFucywgY291bnRyeUNvZGV9ID0gaTE4bi5zdG9yZXMoKTtcbjwvc2NyaXB0PlxuXG48QWx0ZXJuYXRlcy8+XG5cbjxEYXNoYm9hcmQ+XG5cdDxzbG90Lz5cbjwvRGFzaGJvYXJkPiIsIjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgc3RhdHVzO1xuICBleHBvcnQgbGV0IGVycm9yO1xuPC9zY3JpcHQ+XG5cbjxkaXY+XG4gIHtzdGF0dXN9XG48L2Rpdj5cblxuPGRpdj5cbiAge2Vycm9yLm1lc3NhZ2V9XG48L2Rpdj4iLCI8IS0tIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgU2FwcGVyIOKAlCBkbyBub3QgZWRpdCBpdCEgLS0+XG48c2NyaXB0PlxuXHRpbXBvcnQgeyBzZXRDb250ZXh0IH0gZnJvbSAnc3ZlbHRlJztcblx0aW1wb3J0IHsgQ09OVEVYVF9LRVkgfSBmcm9tICcuL3NoYXJlZCc7XG5cdGltcG9ydCBMYXlvdXQgZnJvbSAnLi4vLi4vLi4vcm91dGVzL19sYXlvdXQuc3ZlbHRlJztcblx0aW1wb3J0IEVycm9yIGZyb20gJy4uLy4uLy4uL3JvdXRlcy9fZXJyb3Iuc3ZlbHRlJztcblxuXHRleHBvcnQgbGV0IHN0b3Jlcztcblx0ZXhwb3J0IGxldCBlcnJvcjtcblx0ZXhwb3J0IGxldCBzdGF0dXM7XG5cdGV4cG9ydCBsZXQgc2VnbWVudHM7XG5cdGV4cG9ydCBsZXQgbGV2ZWwwO1xuXHRleHBvcnQgbGV0IGxldmVsMSA9IG51bGw7XG5cblx0c2V0Q29udGV4dChDT05URVhUX0tFWSwgc3RvcmVzKTtcbjwvc2NyaXB0PlxuXG48TGF5b3V0IHNlZ21lbnQ9XCJ7c2VnbWVudHNbMF19XCIgey4uLmxldmVsMC5wcm9wc30+XG5cdHsjaWYgZXJyb3J9XG5cdFx0PEVycm9yIHtlcnJvcn0ge3N0YXR1c30vPlxuXHR7OmVsc2V9XG5cdFx0PHN2ZWx0ZTpjb21wb25lbnQgdGhpcz1cIntsZXZlbDEuY29tcG9uZW50fVwiIHsuLi5sZXZlbDEucHJvcHN9Lz5cblx0ey9pZn1cbjwvTGF5b3V0PiIsIi8vIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgU2FwcGVyIOKAlCBkbyBub3QgZWRpdCBpdCFcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUm9vdCB9IGZyb20gJy4uLy4uLy4uL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZSc7XG5leHBvcnQgeyBwcmVsb2FkIGFzIHJvb3RfcHJlbG9hZCB9IGZyb20gJy4vc2hhcmVkJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRXJyb3JDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZSc7XG5cbmV4cG9ydCBjb25zdCBpZ25vcmUgPSBbXTtcblxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudHMgPSBbXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL1tsYW5nKFthLXpdezJ9KV0vaW5kZXguc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6W2xhbmcoW2Etel17Mn0pXS9pbmRleC5zdmVsdGVfX1wiXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL1tsYW5nKFthLXpdezJ9KV0vbGFuZ3VhZ2VzLnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOltsYW5nKFthLXpdezJ9KV0vbGFuZ3VhZ2VzLnN2ZWx0ZV9fXCJcblx0fSxcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvW2xhbmcoW2Etel17Mn0pXS9yZWNlbnRzLnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOltsYW5nKFthLXpdezJ9KV0vcmVjZW50cy5zdmVsdGVfX1wiXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL1tsYW5nKFthLXpdezJ9KV0vcmFkaW8tW3NpZ25hbFR5cGUoYW18Zm0pXS9pbmRleC5zdmVsdGVcIiksXG5cdFx0Y3NzOiBcIl9fU0FQUEVSX0NTU19QTEFDRUhPTERFUjpbbGFuZyhbYS16XXsyfSldL3JhZGlvLVtzaWduYWxUeXBlKGFtfGZtKV0vaW5kZXguc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9bbGFuZyhbYS16XXsyfSldL3JhZGlvLVtzaWduYWxUeXBlKGFtfGZtKV0vW3NpZ25hbEZyZWMoWzAtOV0rfFswLTldKy5bMC05XSspXS5zdmVsdGVcIiksXG5cdFx0Y3NzOiBcIl9fU0FQUEVSX0NTU19QTEFDRUhPTERFUjpbbGFuZyhbYS16XXsyfSldL3JhZGlvLVtzaWduYWxUeXBlKGFtfGZtKV0vW3NpZ25hbEZyZWMoWzAtOV0rfFswLTldKy5bMC05XSspXS5zdmVsdGVfX1wiXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL1tsYW5nKFthLXpdezJ9KV0vc2VhcmNoLnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOltsYW5nKFthLXpdezJ9KV0vc2VhcmNoLnN2ZWx0ZV9fXCJcblx0fSxcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvW2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vaW5kZXguc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6W2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vaW5kZXguc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9bbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9yYWRpby1bc2lnbmFsVHlwZShhbXxmbSldL2luZGV4LnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOltsYW5nQ291bnRyeShbYS16XXsyfS1bYS16XXsyfSldL3JhZGlvLVtzaWduYWxUeXBlKGFtfGZtKV0vaW5kZXguc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9bbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9yYWRpby1bc2lnbmFsVHlwZShhbXxmbSldL1tzaWduYWxGcmVjKFswLTldK3xbMC05XSsuWzAtOV0rKV0uc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6W2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vcmFkaW8tW3NpZ25hbFR5cGUoYW18Zm0pXS9bc2lnbmFsRnJlYyhbMC05XSt8WzAtOV0rLlswLTldKyldLnN2ZWx0ZV9fXCJcblx0fSxcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvW2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vc2VhcmNoLnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOltsYW5nQ291bnRyeShbYS16XXsyfS1bYS16XXsyfSldL3NlYXJjaC5zdmVsdGVfX1wiXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL1tsYW5nQ291bnRyeShbYS16XXsyfS1bYS16XXsyfSldL3JhZGlvL1tzdGF0aW9uXS5zdmVsdGVcIiksXG5cdFx0Y3NzOiBcIl9fU0FQUEVSX0NTU19QTEFDRUhPTERFUjpbbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9yYWRpby9bc3RhdGlvbl0uc3ZlbHRlX19cIlxuXHR9XG5dO1xuXG5leHBvcnQgY29uc3Qgcm91dGVzID0gKGQgPT4gW1xuXHR7XG5cdFx0Ly8gW2xhbmcoW2Etel17Mn0pXS9pbmRleC5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcLyhbYS16XXsyfSlcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgaTogMCwgcGFyYW1zOiBtYXRjaCA9PiAoeyBsYW5nOiBkKG1hdGNoWzFdKSB9KSB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBbbGFuZyhbYS16XXsyfSldL2xhbmd1YWdlcy5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcLyhbYS16XXsyfSlcXC9sYW5ndWFnZXNcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdG51bGwsXG5cdFx0XHR7IGk6IDEsIHBhcmFtczogbWF0Y2ggPT4gKHsgbGFuZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gW2xhbmcoW2Etel17Mn0pXS9yZWNlbnRzLnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvKFthLXpdezJ9KVxcL3JlY2VudHNcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdG51bGwsXG5cdFx0XHR7IGk6IDIsIHBhcmFtczogbWF0Y2ggPT4gKHsgbGFuZzogZChtYXRjaFsxXSkgfSkgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gW2xhbmcoW2Etel17Mn0pXS9yYWRpby1bc2lnbmFsVHlwZShhbXxmbSldL2luZGV4LnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvKFthLXpdezJ9KVxcL3JhZGlvLShhbXxmbSlcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdG51bGwsXG5cdFx0XHR7IGk6IDMsIHBhcmFtczogbWF0Y2ggPT4gKHsgbGFuZzogZChtYXRjaFsxXSksIHNpZ25hbFR5cGU6IGQobWF0Y2hbMl0pIH0pIH1cblx0XHRdXG5cdH0sXG5cblx0e1xuXHRcdC8vIFtsYW5nKFthLXpdezJ9KV0vcmFkaW8tW3NpZ25hbFR5cGUoYW18Zm0pXS9bc2lnbmFsRnJlYyhbMC05XSt8WzAtOV0rLlswLTldKyldLnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvKFthLXpdezJ9KVxcL3JhZGlvLShhbXxmbSlcXC8oWzAtOV0rfFswLTldKy5bMC05XSspXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHRudWxsLFxuXHRcdFx0bnVsbCxcblx0XHRcdHsgaTogNCwgcGFyYW1zOiBtYXRjaCA9PiAoeyBsYW5nOiBkKG1hdGNoWzFdKSwgc2lnbmFsVHlwZTogZChtYXRjaFsyXSksIHNpZ25hbEZyZWM6IGQobWF0Y2hbM10pIH0pIH1cblx0XHRdXG5cdH0sXG5cblx0e1xuXHRcdC8vIFtsYW5nKFthLXpdezJ9KV0vc2VhcmNoLnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvKFthLXpdezJ9KVxcL3NlYXJjaFxcLz8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0bnVsbCxcblx0XHRcdHsgaTogNSwgcGFyYW1zOiBtYXRjaCA9PiAoeyBsYW5nOiBkKG1hdGNoWzFdKSB9KSB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBbbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9pbmRleC5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcLyhbYS16XXsyfS1bYS16XXsyfSlcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgaTogNiwgcGFyYW1zOiBtYXRjaCA9PiAoeyBsYW5nQ291bnRyeTogZChtYXRjaFsxXSkgfSkgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gW2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vcmFkaW8tW3NpZ25hbFR5cGUoYW18Zm0pXS9pbmRleC5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcLyhbYS16XXsyfS1bYS16XXsyfSlcXC9yYWRpby0oYW18Zm0pXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHRudWxsLFxuXHRcdFx0eyBpOiA3LCBwYXJhbXM6IG1hdGNoID0+ICh7IGxhbmdDb3VudHJ5OiBkKG1hdGNoWzFdKSwgc2lnbmFsVHlwZTogZChtYXRjaFsyXSkgfSkgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gW2xhbmdDb3VudHJ5KFthLXpdezJ9LVthLXpdezJ9KV0vcmFkaW8tW3NpZ25hbFR5cGUoYW18Zm0pXS9bc2lnbmFsRnJlYyhbMC05XSt8WzAtOV0rLlswLTldKyldLnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvKFthLXpdezJ9LVthLXpdezJ9KVxcL3JhZGlvLShhbXxmbSlcXC8oWzAtOV0rfFswLTldKy5bMC05XSspXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHRudWxsLFxuXHRcdFx0bnVsbCxcblx0XHRcdHsgaTogOCwgcGFyYW1zOiBtYXRjaCA9PiAoeyBsYW5nQ291bnRyeTogZChtYXRjaFsxXSksIHNpZ25hbFR5cGU6IGQobWF0Y2hbMl0pLCBzaWduYWxGcmVjOiBkKG1hdGNoWzNdKSB9KSB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBbbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9zZWFyY2guc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC8oW2Etel17Mn0tW2Etel17Mn0pXFwvc2VhcmNoXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHRudWxsLFxuXHRcdFx0eyBpOiA5LCBwYXJhbXM6IG1hdGNoID0+ICh7IGxhbmdDb3VudHJ5OiBkKG1hdGNoWzFdKSB9KSB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBbbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9yYWRpby9bc3RhdGlvbl0uc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC8oW2Etel17Mn0tW2Etel17Mn0pXFwvcmFkaW9cXC8oW15cXC9dKz8pXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHRudWxsLFxuXHRcdFx0bnVsbCxcblx0XHRcdHsgaTogMTAsIHBhcmFtczogbWF0Y2ggPT4gKHsgbGFuZ0NvdW50cnk6IGQobWF0Y2hbMV0pLCBzdGF0aW9uOiBkKG1hdGNoWzJdKSB9KSB9XG5cdFx0XVxuXHR9XG5dKShkZWNvZGVVUklDb21wb25lbnQpO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0aW1wb3J0KFwiL2hvbWUvcmFtaXJvL0Rldi9vcGVucmFkaW8uYXBwL25vZGVfbW9kdWxlcy9zYXBwZXIvc2FwcGVyLWRldi1jbGllbnQuanNcIikudGhlbihjbGllbnQgPT4ge1xuXHRcdGNsaWVudC5jb25uZWN0KDEwMDAwKTtcblx0fSk7XG59IiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJ3N2ZWx0ZSc7XG5pbXBvcnQgeyBDT05URVhUX0tFWSB9IGZyb20gJy4vaW50ZXJuYWwvc2hhcmVkJztcbmltcG9ydCB7IHdyaXRhYmxlIH0gZnJvbSAnc3ZlbHRlL3N0b3JlJztcbmltcG9ydCBBcHAgZnJvbSAnLi9pbnRlcm5hbC9BcHAuc3ZlbHRlJztcbmltcG9ydCB7IGlnbm9yZSwgcm91dGVzLCByb290X3ByZWxvYWQsIGNvbXBvbmVudHMsIEVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi9pbnRlcm5hbC9tYW5pZmVzdC1jbGllbnQnO1xuXG5mdW5jdGlvbiBnb3RvKGhyZWYsIG9wdHMgPSB7IHJlcGxhY2VTdGF0ZTogZmFsc2UgfSkge1xuXHRjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwoaHJlZiwgZG9jdW1lbnQuYmFzZVVSSSkpO1xuXG5cdGlmICh0YXJnZXQpIHtcblx0XHRfaGlzdG9yeVtvcHRzLnJlcGxhY2VTdGF0ZSA/ICdyZXBsYWNlU3RhdGUnIDogJ3B1c2hTdGF0ZSddKHsgaWQ6IGNpZCB9LCAnJywgaHJlZik7XG5cdFx0cmV0dXJuIG5hdmlnYXRlKHRhcmdldCwgbnVsbCkudGhlbigoKSA9PiB7fSk7XG5cdH1cblxuXHRsb2NhdGlvbi5ocmVmID0gaHJlZjtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGYgPT4ge30pOyAvLyBuZXZlciByZXNvbHZlc1xufVxuXG5jb25zdCBpbml0aWFsX2RhdGEgPSB0eXBlb2YgX19TQVBQRVJfXyAhPT0gJ3VuZGVmaW5lZCcgJiYgX19TQVBQRVJfXztcblxubGV0IHJlYWR5ID0gZmFsc2U7XG5sZXQgcm9vdF9jb21wb25lbnQ7XG5sZXQgY3VycmVudF90b2tlbjtcbmxldCByb290X3ByZWxvYWRlZDtcbmxldCBjdXJyZW50X2JyYW5jaCA9IFtdO1xubGV0IGN1cnJlbnRfcXVlcnkgPSAne30nO1xuXG5jb25zdCBzdG9yZXMgPSB7XG5cdHBhZ2U6IHdyaXRhYmxlKHt9KSxcblx0cHJlbG9hZGluZzogd3JpdGFibGUobnVsbCksXG5cdHNlc3Npb246IHdyaXRhYmxlKGluaXRpYWxfZGF0YSAmJiBpbml0aWFsX2RhdGEuc2Vzc2lvbilcbn07XG5cbmxldCAkc2Vzc2lvbjtcbmxldCBzZXNzaW9uX2RpcnR5O1xuXG5zdG9yZXMuc2Vzc2lvbi5zdWJzY3JpYmUoYXN5bmMgdmFsdWUgPT4ge1xuXHQkc2Vzc2lvbiA9IHZhbHVlO1xuXG5cdGlmICghcmVhZHkpIHJldHVybjtcblx0c2Vzc2lvbl9kaXJ0eSA9IHRydWU7XG5cblx0Y29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldChuZXcgVVJMKGxvY2F0aW9uLmhyZWYpKTtcblxuXHRjb25zdCB0b2tlbiA9IGN1cnJlbnRfdG9rZW4gPSB7fTtcblx0Y29uc3QgeyByZWRpcmVjdCwgcHJvcHMsIGJyYW5jaCB9ID0gYXdhaXQgaHlkcmF0ZV90YXJnZXQodGFyZ2V0KTtcblx0aWYgKHRva2VuICE9PSBjdXJyZW50X3Rva2VuKSByZXR1cm47IC8vIGEgc2Vjb25kYXJ5IG5hdmlnYXRpb24gaGFwcGVuZWQgd2hpbGUgd2Ugd2VyZSBsb2FkaW5nXG5cblx0YXdhaXQgcmVuZGVyKHJlZGlyZWN0LCBicmFuY2gsIHByb3BzLCB0YXJnZXQucGFnZSk7XG59KTtcblxubGV0IHByZWZldGNoaW5nXG5cblxuID0gbnVsbDtcbmZ1bmN0aW9uIHNldF9wcmVmZXRjaGluZyhocmVmLCBwcm9taXNlKSB7XG5cdHByZWZldGNoaW5nID0geyBocmVmLCBwcm9taXNlIH07XG59XG5cbmxldCB0YXJnZXQ7XG5mdW5jdGlvbiBzZXRfdGFyZ2V0KGVsZW1lbnQpIHtcblx0dGFyZ2V0ID0gZWxlbWVudDtcbn1cblxubGV0IHVpZCA9IDE7XG5mdW5jdGlvbiBzZXRfdWlkKG4pIHtcblx0dWlkID0gbjtcbn1cblxubGV0IGNpZDtcbmZ1bmN0aW9uIHNldF9jaWQobikge1xuXHRjaWQgPSBuO1xufVxuXG5jb25zdCBfaGlzdG9yeSA9IHR5cGVvZiBoaXN0b3J5ICE9PSAndW5kZWZpbmVkJyA/IGhpc3RvcnkgOiB7XG5cdHB1c2hTdGF0ZTogKHN0YXRlLCB0aXRsZSwgaHJlZikgPT4ge30sXG5cdHJlcGxhY2VTdGF0ZTogKHN0YXRlLCB0aXRsZSwgaHJlZikgPT4ge30sXG5cdHNjcm9sbFJlc3RvcmF0aW9uOiAnJ1xufTtcblxuY29uc3Qgc2Nyb2xsX2hpc3RvcnkgPSB7fTtcblxuZnVuY3Rpb24gZXh0cmFjdF9xdWVyeShzZWFyY2gpIHtcblx0Y29uc3QgcXVlcnkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRpZiAoc2VhcmNoLmxlbmd0aCA+IDApIHtcblx0XHRzZWFyY2guc2xpY2UoMSkuc3BsaXQoJyYnKS5mb3JFYWNoKHNlYXJjaFBhcmFtID0+IHtcblx0XHRcdGxldCBbLCBrZXksIHZhbHVlID0gJyddID0gLyhbXj1dKikoPzo9KC4qKSk/Ly5leGVjKGRlY29kZVVSSUNvbXBvbmVudChzZWFyY2hQYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKSkpO1xuXHRcdFx0aWYgKHR5cGVvZiBxdWVyeVtrZXldID09PSAnc3RyaW5nJykgcXVlcnlba2V5XSA9IFtxdWVyeVtrZXldXTtcblx0XHRcdGlmICh0eXBlb2YgcXVlcnlba2V5XSA9PT0gJ29iamVjdCcpIChxdWVyeVtrZXldICkucHVzaCh2YWx1ZSk7XG5cdFx0XHRlbHNlIHF1ZXJ5W2tleV0gPSB2YWx1ZTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gcXVlcnk7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdF90YXJnZXQodXJsKSB7XG5cdGlmICh1cmwub3JpZ2luICE9PSBsb2NhdGlvbi5vcmlnaW4pIHJldHVybiBudWxsO1xuXHRpZiAoIXVybC5wYXRobmFtZS5zdGFydHNXaXRoKGluaXRpYWxfZGF0YS5iYXNlVXJsKSkgcmV0dXJuIG51bGw7XG5cblx0bGV0IHBhdGggPSB1cmwucGF0aG5hbWUuc2xpY2UoaW5pdGlhbF9kYXRhLmJhc2VVcmwubGVuZ3RoKTtcblxuXHRpZiAocGF0aCA9PT0gJycpIHtcblx0XHRwYXRoID0gJy8nO1xuXHR9XG5cblx0Ly8gYXZvaWQgYWNjaWRlbnRhbCBjbGFzaGVzIGJldHdlZW4gc2VydmVyIHJvdXRlcyBhbmQgcGFnZSByb3V0ZXNcblx0aWYgKGlnbm9yZS5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi50ZXN0KHBhdGgpKSkgcmV0dXJuO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0Y29uc3Qgcm91dGUgPSByb3V0ZXNbaV07XG5cblx0XHRjb25zdCBtYXRjaCA9IHJvdXRlLnBhdHRlcm4uZXhlYyhwYXRoKTtcblxuXHRcdGlmIChtYXRjaCkge1xuXHRcdFx0Y29uc3QgcXVlcnkgPSBleHRyYWN0X3F1ZXJ5KHVybC5zZWFyY2gpO1xuXHRcdFx0Y29uc3QgcGFydCA9IHJvdXRlLnBhcnRzW3JvdXRlLnBhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0Y29uc3QgcGFyYW1zID0gcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyhtYXRjaCkgOiB7fTtcblxuXHRcdFx0Y29uc3QgcGFnZSA9IHsgaG9zdDogbG9jYXRpb24uaG9zdCwgcGF0aCwgcXVlcnksIHBhcmFtcyB9O1xuXG5cdFx0XHRyZXR1cm4geyBocmVmOiB1cmwuaHJlZiwgcm91dGUsIG1hdGNoLCBwYWdlIH07XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZV9lcnJvcih1cmwpIHtcblx0Y29uc3QgeyBob3N0LCBwYXRobmFtZSwgc2VhcmNoIH0gPSBsb2NhdGlvbjtcblx0Y29uc3QgeyBzZXNzaW9uLCBwcmVsb2FkZWQsIHN0YXR1cywgZXJyb3IgfSA9IGluaXRpYWxfZGF0YTtcblxuXHRpZiAoIXJvb3RfcHJlbG9hZGVkKSB7XG5cdFx0cm9vdF9wcmVsb2FkZWQgPSBwcmVsb2FkZWQgJiYgcHJlbG9hZGVkWzBdO1xuXHR9XG5cblx0Y29uc3QgcHJvcHMgPSB7XG5cdFx0ZXJyb3IsXG5cdFx0c3RhdHVzLFxuXHRcdHNlc3Npb24sXG5cdFx0bGV2ZWwwOiB7XG5cdFx0XHRwcm9wczogcm9vdF9wcmVsb2FkZWRcblx0XHR9LFxuXHRcdGxldmVsMToge1xuXHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0c3RhdHVzLFxuXHRcdFx0XHRlcnJvclxuXHRcdFx0fSxcblx0XHRcdGNvbXBvbmVudDogRXJyb3JDb21wb25lbnRcblx0XHR9LFxuXHRcdHNlZ21lbnRzOiBwcmVsb2FkZWRcblxuXHR9O1xuXHRjb25zdCBxdWVyeSA9IGV4dHJhY3RfcXVlcnkoc2VhcmNoKTtcblx0cmVuZGVyKG51bGwsIFtdLCBwcm9wcywgeyBob3N0LCBwYXRoOiBwYXRobmFtZSwgcXVlcnksIHBhcmFtczoge30gfSk7XG59XG5cbmZ1bmN0aW9uIHNjcm9sbF9zdGF0ZSgpIHtcblx0cmV0dXJuIHtcblx0XHR4OiBwYWdlWE9mZnNldCxcblx0XHR5OiBwYWdlWU9mZnNldFxuXHR9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBuYXZpZ2F0ZSh0YXJnZXQsIGlkLCBub3Njcm9sbCwgaGFzaCkge1xuXHRpZiAoaWQpIHtcblx0XHQvLyBwb3BzdGF0ZSBvciBpbml0aWFsIG5hdmlnYXRpb25cblx0XHRjaWQgPSBpZDtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBjdXJyZW50X3Njcm9sbCA9IHNjcm9sbF9zdGF0ZSgpO1xuXG5cdFx0Ly8gY2xpY2tlZCBvbiBhIGxpbmsuIHByZXNlcnZlIHNjcm9sbCBzdGF0ZVxuXHRcdHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBjdXJyZW50X3Njcm9sbDtcblxuXHRcdGlkID0gY2lkID0gKyt1aWQ7XG5cdFx0c2Nyb2xsX2hpc3RvcnlbY2lkXSA9IG5vc2Nyb2xsID8gY3VycmVudF9zY3JvbGwgOiB7IHg6IDAsIHk6IDAgfTtcblx0fVxuXG5cdGNpZCA9IGlkO1xuXG5cdGlmIChyb290X2NvbXBvbmVudCkgc3RvcmVzLnByZWxvYWRpbmcuc2V0KHRydWUpO1xuXG5cdGNvbnN0IGxvYWRlZCA9IHByZWZldGNoaW5nICYmIHByZWZldGNoaW5nLmhyZWYgPT09IHRhcmdldC5ocmVmID9cblx0XHRwcmVmZXRjaGluZy5wcm9taXNlIDpcblx0XHRoeWRyYXRlX3RhcmdldCh0YXJnZXQpO1xuXG5cdHByZWZldGNoaW5nID0gbnVsbDtcblxuXHRjb25zdCB0b2tlbiA9IGN1cnJlbnRfdG9rZW4gPSB7fTtcblx0Y29uc3QgeyByZWRpcmVjdCwgcHJvcHMsIGJyYW5jaCB9ID0gYXdhaXQgbG9hZGVkO1xuXHRpZiAodG9rZW4gIT09IGN1cnJlbnRfdG9rZW4pIHJldHVybjsgLy8gYSBzZWNvbmRhcnkgbmF2aWdhdGlvbiBoYXBwZW5lZCB3aGlsZSB3ZSB3ZXJlIGxvYWRpbmdcblxuXHRhd2FpdCByZW5kZXIocmVkaXJlY3QsIGJyYW5jaCwgcHJvcHMsIHRhcmdldC5wYWdlKTtcblx0aWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuXG5cdGlmICghbm9zY3JvbGwpIHtcblx0XHRsZXQgc2Nyb2xsID0gc2Nyb2xsX2hpc3RvcnlbaWRdO1xuXG5cdFx0aWYgKGhhc2gpIHtcblx0XHRcdC8vIHNjcm9sbCBpcyBhbiBlbGVtZW50IGlkIChmcm9tIGEgaGFzaCksIHdlIG5lZWQgdG8gY29tcHV0ZSB5LlxuXHRcdFx0Y29uc3QgZGVlcF9saW5rZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoLnNsaWNlKDEpKTtcblxuXHRcdFx0aWYgKGRlZXBfbGlua2VkKSB7XG5cdFx0XHRcdHNjcm9sbCA9IHtcblx0XHRcdFx0XHR4OiAwLFxuXHRcdFx0XHRcdHk6IGRlZXBfbGlua2VkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBzY3JvbGw7XG5cdFx0aWYgKHNjcm9sbCkgc2Nyb2xsVG8oc2Nyb2xsLngsIHNjcm9sbC55KTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiByZW5kZXIocmVkaXJlY3QsIGJyYW5jaCwgcHJvcHMsIHBhZ2UpIHtcblx0aWYgKHJlZGlyZWN0KSByZXR1cm4gZ290byhyZWRpcmVjdC5sb2NhdGlvbiwgeyByZXBsYWNlU3RhdGU6IHRydWUgfSk7XG5cblx0c3RvcmVzLnBhZ2Uuc2V0KHBhZ2UpO1xuXHRzdG9yZXMucHJlbG9hZGluZy5zZXQoZmFsc2UpO1xuXG5cdGlmIChyb290X2NvbXBvbmVudCkge1xuXHRcdHJvb3RfY29tcG9uZW50LiRzZXQocHJvcHMpO1xuXHR9IGVsc2Uge1xuXHRcdHByb3BzLnN0b3JlcyA9IHtcblx0XHRcdHBhZ2U6IHsgc3Vic2NyaWJlOiBzdG9yZXMucGFnZS5zdWJzY3JpYmUgfSxcblx0XHRcdHByZWxvYWRpbmc6IHsgc3Vic2NyaWJlOiBzdG9yZXMucHJlbG9hZGluZy5zdWJzY3JpYmUgfSxcblx0XHRcdHNlc3Npb246IHN0b3Jlcy5zZXNzaW9uXG5cdFx0fTtcblx0XHRwcm9wcy5sZXZlbDAgPSB7XG5cdFx0XHRwcm9wczogYXdhaXQgcm9vdF9wcmVsb2FkZWRcblx0XHR9O1xuXG5cdFx0Ly8gZmlyc3QgbG9hZCDigJQgcmVtb3ZlIFNTUidkIDxoZWFkPiBjb250ZW50c1xuXHRcdGNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NhcHBlci1oZWFkLXN0YXJ0Jyk7XG5cdFx0Y29uc3QgZW5kID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NhcHBlci1oZWFkLWVuZCcpO1xuXG5cdFx0aWYgKHN0YXJ0ICYmIGVuZCkge1xuXHRcdFx0d2hpbGUgKHN0YXJ0Lm5leHRTaWJsaW5nICE9PSBlbmQpIGRldGFjaChzdGFydC5uZXh0U2libGluZyk7XG5cdFx0XHRkZXRhY2goc3RhcnQpO1xuXHRcdFx0ZGV0YWNoKGVuZCk7XG5cdFx0fVxuXG5cdFx0cm9vdF9jb21wb25lbnQgPSBuZXcgQXBwKHtcblx0XHRcdHRhcmdldCxcblx0XHRcdHByb3BzLFxuXHRcdFx0aHlkcmF0ZTogdHJ1ZVxuXHRcdH0pO1xuXHR9XG5cblx0Y3VycmVudF9icmFuY2ggPSBicmFuY2g7XG5cdGN1cnJlbnRfcXVlcnkgPSBKU09OLnN0cmluZ2lmeShwYWdlLnF1ZXJ5KTtcblx0cmVhZHkgPSB0cnVlO1xuXHRzZXNzaW9uX2RpcnR5ID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHBhcnRfY2hhbmdlZChpLCBzZWdtZW50LCBtYXRjaCwgc3RyaW5naWZpZWRfcXVlcnkpIHtcblx0Ly8gVE9ETyBvbmx5IGNoZWNrIHF1ZXJ5IHN0cmluZyBjaGFuZ2VzIGZvciBwcmVsb2FkIGZ1bmN0aW9uc1xuXHQvLyB0aGF0IGRvIGluIGZhY3QgZGVwZW5kIG9uIGl0ICh1c2luZyBzdGF0aWMgYW5hbHlzaXMgb3Jcblx0Ly8gcnVudGltZSBpbnN0cnVtZW50YXRpb24pXG5cdGlmIChzdHJpbmdpZmllZF9xdWVyeSAhPT0gY3VycmVudF9xdWVyeSkgcmV0dXJuIHRydWU7XG5cblx0Y29uc3QgcHJldmlvdXMgPSBjdXJyZW50X2JyYW5jaFtpXTtcblxuXHRpZiAoIXByZXZpb3VzKSByZXR1cm4gZmFsc2U7XG5cdGlmIChzZWdtZW50ICE9PSBwcmV2aW91cy5zZWdtZW50KSByZXR1cm4gdHJ1ZTtcblx0aWYgKHByZXZpb3VzLm1hdGNoKSB7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KHByZXZpb3VzLm1hdGNoLnNsaWNlKDEsIGkgKyAyKSkgIT09IEpTT04uc3RyaW5naWZ5KG1hdGNoLnNsaWNlKDEsIGkgKyAyKSkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBoeWRyYXRlX3RhcmdldCh0YXJnZXQpXG5cblxuXG4ge1xuXHRjb25zdCB7IHJvdXRlLCBwYWdlIH0gPSB0YXJnZXQ7XG5cdGNvbnN0IHNlZ21lbnRzID0gcGFnZS5wYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuXG5cdGxldCByZWRpcmVjdCA9IG51bGw7XG5cblx0Y29uc3QgcHJvcHMgPSB7IGVycm9yOiBudWxsLCBzdGF0dXM6IDIwMCwgc2VnbWVudHM6IFtzZWdtZW50c1swXV0gfTtcblxuXHRjb25zdCBwcmVsb2FkX2NvbnRleHQgPSB7XG5cdFx0ZmV0Y2g6ICh1cmwsIG9wdHMpID0+IGZldGNoKHVybCwgb3B0cyksXG5cdFx0cmVkaXJlY3Q6IChzdGF0dXNDb2RlLCBsb2NhdGlvbikgPT4ge1xuXHRcdFx0aWYgKHJlZGlyZWN0ICYmIChyZWRpcmVjdC5zdGF0dXNDb2RlICE9PSBzdGF0dXNDb2RlIHx8IHJlZGlyZWN0LmxvY2F0aW9uICE9PSBsb2NhdGlvbikpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDb25mbGljdGluZyByZWRpcmVjdHNgKTtcblx0XHRcdH1cblx0XHRcdHJlZGlyZWN0ID0geyBzdGF0dXNDb2RlLCBsb2NhdGlvbiB9O1xuXHRcdH0sXG5cdFx0ZXJyb3I6IChzdGF0dXMsIGVycm9yKSA9PiB7XG5cdFx0XHRwcm9wcy5lcnJvciA9IHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycgPyBuZXcgRXJyb3IoZXJyb3IpIDogZXJyb3I7XG5cdFx0XHRwcm9wcy5zdGF0dXMgPSBzdGF0dXM7XG5cdFx0fVxuXHR9O1xuXG5cdGlmICghcm9vdF9wcmVsb2FkZWQpIHtcblx0XHRyb290X3ByZWxvYWRlZCA9IGluaXRpYWxfZGF0YS5wcmVsb2FkZWRbMF0gfHwgcm9vdF9wcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRob3N0OiBwYWdlLmhvc3QsXG5cdFx0XHRwYXRoOiBwYWdlLnBhdGgsXG5cdFx0XHRxdWVyeTogcGFnZS5xdWVyeSxcblx0XHRcdHBhcmFtczoge31cblx0XHR9LCAkc2Vzc2lvbik7XG5cdH1cblxuXHRsZXQgYnJhbmNoO1xuXHRsZXQgbCA9IDE7XG5cblx0dHJ5IHtcblx0XHRjb25zdCBzdHJpbmdpZmllZF9xdWVyeSA9IEpTT04uc3RyaW5naWZ5KHBhZ2UucXVlcnkpO1xuXHRcdGNvbnN0IG1hdGNoID0gcm91dGUucGF0dGVybi5leGVjKHBhZ2UucGF0aCk7XG5cblx0XHRsZXQgc2VnbWVudF9kaXJ0eSA9IGZhbHNlO1xuXG5cdFx0YnJhbmNoID0gYXdhaXQgUHJvbWlzZS5hbGwocm91dGUucGFydHMubWFwKGFzeW5jIChwYXJ0LCBpKSA9PiB7XG5cdFx0XHRjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbaV07XG5cblx0XHRcdGlmIChwYXJ0X2NoYW5nZWQoaSwgc2VnbWVudCwgbWF0Y2gsIHN0cmluZ2lmaWVkX3F1ZXJ5KSkgc2VnbWVudF9kaXJ0eSA9IHRydWU7XG5cblx0XHRcdHByb3BzLnNlZ21lbnRzW2xdID0gc2VnbWVudHNbaSArIDFdOyAvLyBUT0RPIG1ha2UgdGhpcyBsZXNzIGNvbmZ1c2luZ1xuXHRcdFx0aWYgKCFwYXJ0KSByZXR1cm4geyBzZWdtZW50IH07XG5cblx0XHRcdGNvbnN0IGogPSBsKys7XG5cblx0XHRcdGlmICghc2Vzc2lvbl9kaXJ0eSAmJiAhc2VnbWVudF9kaXJ0eSAmJiBjdXJyZW50X2JyYW5jaFtpXSAmJiBjdXJyZW50X2JyYW5jaFtpXS5wYXJ0ID09PSBwYXJ0LmkpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRfYnJhbmNoW2ldO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWdtZW50X2RpcnR5ID0gZmFsc2U7XG5cblx0XHRcdGNvbnN0IHsgZGVmYXVsdDogY29tcG9uZW50LCBwcmVsb2FkIH0gPSBhd2FpdCBsb2FkX2NvbXBvbmVudChjb21wb25lbnRzW3BhcnQuaV0pO1xuXG5cdFx0XHRsZXQgcHJlbG9hZGVkO1xuXHRcdFx0aWYgKHJlYWR5IHx8ICFpbml0aWFsX2RhdGEucHJlbG9hZGVkW2kgKyAxXSkge1xuXHRcdFx0XHRwcmVsb2FkZWQgPSBwcmVsb2FkXG5cdFx0XHRcdFx0PyBhd2FpdCBwcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRcdFx0XHRob3N0OiBwYWdlLmhvc3QsXG5cdFx0XHRcdFx0XHRwYXRoOiBwYWdlLnBhdGgsXG5cdFx0XHRcdFx0XHRxdWVyeTogcGFnZS5xdWVyeSxcblx0XHRcdFx0XHRcdHBhcmFtczogcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyh0YXJnZXQubWF0Y2gpIDoge31cblx0XHRcdFx0XHR9LCAkc2Vzc2lvbilcblx0XHRcdFx0XHQ6IHt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJlbG9hZGVkID0gaW5pdGlhbF9kYXRhLnByZWxvYWRlZFtpICsgMV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAocHJvcHNbYGxldmVsJHtqfWBdID0geyBjb21wb25lbnQsIHByb3BzOiBwcmVsb2FkZWQsIHNlZ21lbnQsIG1hdGNoLCBwYXJ0OiBwYXJ0LmkgfSk7XG5cdFx0fSkpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHByb3BzLmVycm9yID0gZXJyb3I7XG5cdFx0cHJvcHMuc3RhdHVzID0gNTAwO1xuXHRcdGJyYW5jaCA9IFtdO1xuXHR9XG5cblx0cmV0dXJuIHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfTtcbn1cblxuZnVuY3Rpb24gbG9hZF9jc3MoY2h1bmspIHtcblx0Y29uc3QgaHJlZiA9IGBjbGllbnQvJHtjaHVua31gO1xuXHRpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGlua1tocmVmPVwiJHtocmVmfVwiXWApKSByZXR1cm47XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKChmdWxmaWwsIHJlamVjdCkgPT4ge1xuXHRcdGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cdFx0bGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG5cdFx0bGluay5ocmVmID0gaHJlZjtcblxuXHRcdGxpbmsub25sb2FkID0gKCkgPT4gZnVsZmlsKCk7XG5cdFx0bGluay5vbmVycm9yID0gcmVqZWN0O1xuXG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRfY29tcG9uZW50KGNvbXBvbmVudClcblxuXG4ge1xuXHQvLyBUT0RPIHRoaXMgaXMgdGVtcG9yYXJ5IOKAlCBvbmNlIHBsYWNlaG9sZGVycyBhcmVcblx0Ly8gYWx3YXlzIHJld3JpdHRlbiwgc2NyYXRjaCB0aGUgdGVybmFyeVxuXHRjb25zdCBwcm9taXNlcyA9ICh0eXBlb2YgY29tcG9uZW50LmNzcyA9PT0gJ3N0cmluZycgPyBbXSA6IGNvbXBvbmVudC5jc3MubWFwKGxvYWRfY3NzKSk7XG5cdHByb21pc2VzLnVuc2hpZnQoY29tcG9uZW50LmpzKCkpO1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4odmFsdWVzID0+IHZhbHVlc1swXSk7XG59XG5cbmZ1bmN0aW9uIGRldGFjaChub2RlKSB7XG5cdG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gcHJlZmV0Y2goaHJlZikge1xuXHRjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwoaHJlZiwgZG9jdW1lbnQuYmFzZVVSSSkpO1xuXG5cdGlmICh0YXJnZXQpIHtcblx0XHRpZiAoIXByZWZldGNoaW5nIHx8IGhyZWYgIT09IHByZWZldGNoaW5nLmhyZWYpIHtcblx0XHRcdHNldF9wcmVmZXRjaGluZyhocmVmLCBoeWRyYXRlX3RhcmdldCh0YXJnZXQpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJlZmV0Y2hpbmcucHJvbWlzZTtcblx0fVxufVxuXG5mdW5jdGlvbiBzdGFydChvcHRzXG5cbikge1xuXHRpZiAoJ3Njcm9sbFJlc3RvcmF0aW9uJyBpbiBfaGlzdG9yeSkge1xuXHRcdF9oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gJ21hbnVhbCc7XG5cdH1cblxuXHRzZXRfdGFyZ2V0KG9wdHMudGFyZ2V0KTtcblxuXHRhZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZV9jbGljayk7XG5cdGFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgaGFuZGxlX3BvcHN0YXRlKTtcblxuXHQvLyBwcmVmZXRjaFxuXHRhZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdHJpZ2dlcl9wcmVmZXRjaCk7XG5cdGFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZV9tb3VzZW1vdmUpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRjb25zdCB7IGhhc2gsIGhyZWYgfSA9IGxvY2F0aW9uO1xuXG5cdFx0X2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IHVpZCB9LCAnJywgaHJlZik7XG5cblx0XHRjb25zdCB1cmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuXG5cdFx0aWYgKGluaXRpYWxfZGF0YS5lcnJvcikgcmV0dXJuIGhhbmRsZV9lcnJvcigpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldCh1cmwpO1xuXHRcdGlmICh0YXJnZXQpIHJldHVybiBuYXZpZ2F0ZSh0YXJnZXQsIHVpZCwgdHJ1ZSwgaGFzaCk7XG5cdH0pO1xufVxuXG5sZXQgbW91c2Vtb3ZlX3RpbWVvdXQ7XG5cbmZ1bmN0aW9uIGhhbmRsZV9tb3VzZW1vdmUoZXZlbnQpIHtcblx0Y2xlYXJUaW1lb3V0KG1vdXNlbW92ZV90aW1lb3V0KTtcblx0bW91c2Vtb3ZlX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHR0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KTtcblx0fSwgMjApO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KSB7XG5cdGNvbnN0IGEgPSBmaW5kX2FuY2hvcihldmVudC50YXJnZXQpO1xuXHRpZiAoIWEgfHwgYS5yZWwgIT09ICdwcmVmZXRjaCcpIHJldHVybjtcblxuXHRwcmVmZXRjaChhLmhyZWYpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfY2xpY2soZXZlbnQpIHtcblx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdC8vIE1JVCBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzI2xpY2Vuc2Vcblx0aWYgKHdoaWNoKGV2ZW50KSAhPT0gMSkgcmV0dXJuO1xuXHRpZiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50LnNoaWZ0S2V5KSByZXR1cm47XG5cdGlmIChldmVudC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0Y29uc3QgYSA9IGZpbmRfYW5jaG9yKGV2ZW50LnRhcmdldCk7XG5cdGlmICghYSkgcmV0dXJuO1xuXG5cdGlmICghYS5ocmVmKSByZXR1cm47XG5cblx0Ly8gY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdGNvbnN0IHN2ZyA9IHR5cGVvZiBhLmhyZWYgPT09ICdvYmplY3QnICYmIGEuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXHRjb25zdCBocmVmID0gU3RyaW5nKHN2ZyA/IChhKS5ocmVmLmJhc2VWYWwgOiBhLmhyZWYpO1xuXG5cdGlmIChocmVmID09PSBsb2NhdGlvbi5ocmVmKSB7XG5cdFx0aWYgKCFsb2NhdGlvbi5oYXNoKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIElnbm9yZSBpZiB0YWcgaGFzXG5cdC8vIDEuICdkb3dubG9hZCcgYXR0cmlidXRlXG5cdC8vIDIuIHJlbD0nZXh0ZXJuYWwnIGF0dHJpYnV0ZVxuXHRpZiAoYS5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgYS5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKSByZXR1cm47XG5cblx0Ly8gSWdub3JlIGlmIDxhPiBoYXMgYSB0YXJnZXRcblx0aWYgKHN2ZyA/IChhKS50YXJnZXQuYmFzZVZhbCA6IGEudGFyZ2V0KSByZXR1cm47XG5cblx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmKTtcblxuXHQvLyBEb24ndCBoYW5kbGUgaGFzaCBjaGFuZ2VzXG5cdGlmICh1cmwucGF0aG5hbWUgPT09IGxvY2F0aW9uLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IGxvY2F0aW9uLnNlYXJjaCkgcmV0dXJuO1xuXG5cdGNvbnN0IHRhcmdldCA9IHNlbGVjdF90YXJnZXQodXJsKTtcblx0aWYgKHRhcmdldCkge1xuXHRcdGNvbnN0IG5vc2Nyb2xsID0gYS5oYXNBdHRyaWJ1dGUoJ3NhcHBlci1ub3Njcm9sbCcpO1xuXHRcdG5hdmlnYXRlKHRhcmdldCwgbnVsbCwgbm9zY3JvbGwsIHVybC5oYXNoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdF9oaXN0b3J5LnB1c2hTdGF0ZSh7IGlkOiBjaWQgfSwgJycsIHVybC5ocmVmKTtcblx0fVxufVxuXG5mdW5jdGlvbiB3aGljaChldmVudCkge1xuXHRyZXR1cm4gZXZlbnQud2hpY2ggPT09IG51bGwgPyBldmVudC5idXR0b24gOiBldmVudC53aGljaDtcbn1cblxuZnVuY3Rpb24gZmluZF9hbmNob3Iobm9kZSkge1xuXHR3aGlsZSAobm9kZSAmJiBub2RlLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTsgLy8gU1ZHIDxhPiBlbGVtZW50cyBoYXZlIGEgbG93ZXJjYXNlIG5hbWVcblx0cmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZV9wb3BzdGF0ZShldmVudCkge1xuXHRzY3JvbGxfaGlzdG9yeVtjaWRdID0gc2Nyb2xsX3N0YXRlKCk7XG5cblx0aWYgKGV2ZW50LnN0YXRlKSB7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcblx0XHRjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KHVybCk7XG5cdFx0aWYgKHRhcmdldCkge1xuXHRcdFx0bmF2aWdhdGUodGFyZ2V0LCBldmVudC5zdGF0ZS5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBoYXNoY2hhbmdlXG5cdFx0c2V0X3VpZCh1aWQgKyAxKTtcblx0XHRzZXRfY2lkKHVpZCk7XG5cdFx0X2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IGNpZCB9LCAnJywgbG9jYXRpb24uaHJlZik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJlZmV0Y2hSb3V0ZXMocGF0aG5hbWVzKSB7XG5cdHJldHVybiByb3V0ZXNcblx0XHQuZmlsdGVyKHBhdGhuYW1lc1xuXHRcdFx0PyByb3V0ZSA9PiBwYXRobmFtZXMuc29tZShwYXRobmFtZSA9PiByb3V0ZS5wYXR0ZXJuLnRlc3QocGF0aG5hbWUpKVxuXHRcdFx0OiAoKSA9PiB0cnVlXG5cdFx0KVxuXHRcdC5yZWR1Y2UoKHByb21pc2UsIHJvdXRlKSA9PiBwcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKHJvdXRlLnBhcnRzLm1hcChwYXJ0ID0+IHBhcnQgJiYgbG9hZF9jb21wb25lbnQoY29tcG9uZW50c1twYXJ0LmldKSkpO1xuXHRcdH0pLCBQcm9taXNlLnJlc29sdmUoKSk7XG59XG5cbmNvbnN0IHN0b3JlcyQxID0gKCkgPT4gZ2V0Q29udGV4dChDT05URVhUX0tFWSk7XG5cbmV4cG9ydCB7IGdvdG8sIHByZWZldGNoLCBwcmVmZXRjaFJvdXRlcywgc3RhcnQsIHN0b3JlcyQxIGFzIHN0b3JlcyB9O1xuIiwiaW1wb3J0ICogYXMgc2FwcGVyIGZyb20gJ0BzYXBwZXIvYXBwJztcblxuc2FwcGVyLnN0YXJ0KHtcblx0dGFyZ2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2FwcGVyJylcbn0pOyJdLCJuYW1lcyI6WyJ0aGlzIiwiaXNPYmplY3QiLCJnZXQiLCJmb3JtYXQiLCJzYXBwZXJTdG9yZXMiLCJnZXRTdG9yZVZhbHVlIiwibGFuZ3MiLCJpMThuLnN0b3JlcyIsImxpbmVhciIsInN0b3JlcyIsImdvIiwiRXJyb3JDb21wb25lbnQiLCJkZXRhY2giLCJyb290X3ByZWxvYWQiLCJzdG9yZXMkMSIsInNhcHBlci5zdGFydCJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxJQUFJLEdBQUcsR0FBRztBQUNuQixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDMUI7QUFDQSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRztB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QUMsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLEtBQUssVUFBVSxDQUFDO0FBQzFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BHQSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQy9CO0FBQ0EsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sR0FBRyxFQUFFLEtBQUs7QUFDbEQ7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHQyxRQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCO0FBQ0EsRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQztBQUMzQixJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkUsS0FBSztBQUNMLElBQUksT0FBTyxHQUFHLENBQUM7QUFDZixHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU9DLFlBQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDM0IsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBSSxHQUFHLElBQUks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LENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDckQsR0FBRztBQUNILEVBQUU7QUFDRjtBQUNBLENBQUM7QUFDRDtBQUNBLEVBQUUsT0FBTyxFQUFFLGtDQUFrQztBQUM3QyxFQUFFLEtBQUssRUFBRTtBQUNULEdBQUcsSUFBSTtBQUNQLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlFLEdBQUc7QUFDSCxFQUFFO0FBQ0Y7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxFQUFFLE9BQU8sRUFBRSwwREFBMEQ7QUFDckUsRUFBRSxLQUFLLEVBQUU7QUFDVCxHQUFHLElBQUk7QUFDUCxHQUFHLElBQUk7QUFDUCxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3ZHLEdBQUc7QUFDSCxFQUFFO0FBQ0Y7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxFQUFFLE9BQU8sRUFBRSwyQkFBMkI7QUFDdEMsRUFBRSxLQUFLLEVBQUU7QUFDVCxHQUFHLElBQUk7QUFDUCxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDckQsR0FBRztBQUNILEVBQUU7QUFDRjtB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
