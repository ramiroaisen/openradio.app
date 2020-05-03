import { S as SvelteComponentDev, i as init, d as dispatch_dev, s as safe_not_equal, ad as assign, ae as exclude_internal_props, C as create_component, D as claim_component, E as mount_component, af as get_spread_update, ag as get_spread_object, p as transition_in, v as transition_out, F as destroy_component } from './client.34d0e543.js';
import './Page.17ccbce0.js';
import './RadioList.0e3babd3.js';
import { C as Component } from './signal.cc3bc73c.js';
export { p as preload } from './signal.cc3bc73c.js';

/* src/routes/[langCountry([a-z]{2}-[a-z]{2})]/radio-[signalType(am|fm)]/[signalFrec([0-9]+|[0-9]+.[0-9]+)].svelte generated by Svelte v3.18.2 */

function create_fragment(ctx) {
	let current;
	const component_spread_levels = [/*$$props*/ ctx[0]];
	let component_props = {};

	for (let i = 0; i < component_spread_levels.length; i += 1) {
		component_props = assign(component_props, component_spread_levels[i]);
	}

	const component = new Component({ props: component_props, $$inline: true });

	const block = {
		c: function create() {
			create_component(component.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(component.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(component, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const component_changes = (dirty & /*$$props*/ 1)
			? get_spread_update(component_spread_levels, [get_spread_object(/*$$props*/ ctx[0])])
			: {};

			component.$set(component_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(component.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(component.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(component, detaching);
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
	$$self.$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class U5BsignalFrec_u5B0_9u5D_u7Cu5B0_9u5D_u5B0_9u5D_u5D extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "U5BsignalFrec_u5B0_9u5D_u7Cu5B0_9u5D_u5B0_9u5D_u5D",
			options,
			id: create_fragment.name
		});
	}
}

export default U5BsignalFrec_u5B0_9u5D_u7Cu5B0_9u5D_u5B0_9u5D_u5D;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiW3NpZ25hbEZyZWMoWzAtOV0rfFswLTldKy5bMC05XSspXS5iMjBhOTRmZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3JvdXRlcy9bbGFuZ0NvdW50cnkoW2Etel17Mn0tW2Etel17Mn0pXS9yYWRpby1bc2lnbmFsVHlwZShhbXxmbSldL1tzaWduYWxGcmVjKFswLTldK3xbMC05XSsuWzAtOV0rKV0uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgY29udGV4dD1cIm1vZHVsZVwiPlxuICBpbXBvcnQgQ29tcG9uZW50LCB7cHJlbG9hZH0gZnJvbSBcIi9yb3V0ZXMvX3NoYXJlZC9zaWduYWwuc3ZlbHRlXCI7XG4gIGV4cG9ydCB7cHJlbG9hZH07XG48L3NjcmlwdD5cblxuPENvbXBvbmVudCB7Li4uJCRwcm9wc30vPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OENBS2UsR0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrRUFBUCxHQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=