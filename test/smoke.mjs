/**
 * Headless smoke test for the mobile client bundle: executes the module
 * factory with stubbed React/DOM/cordis faces and asserts the wiring.
 */
const calls = { styles: [], registered: [], injected: [] };

globalThis.window = {
	__ModuleLoader__: {
		load(def) {
			globalThis.__definition = def;
		}
	}
};

const React = {
	createElement(type, props, ...children) {
		return { type, props: props ?? {}, children };
	},
	Fragment: Symbol("Fragment"),
	useState: (init) => [typeof init === "function" ? init() : init, () => {}],
	useEffect: () => {},
	useLayoutEffect: () => {},
	useCallback: (fn) => fn,
	useMemo: (fn) => fn(),
	useSyncExternalStore: (_sub, read) => read()
};

await import("../lib/client.js");
const definition = globalThis.__definition;
if (!definition) throw new Error("module never registered");
if (definition.id !== "dsh-client-ui-mobile") throw new Error("unexpected id: " + definition.id);

const exports = definition.factory((specifier) => {
	if (specifier === "react") return React;
	throw new Error("unexpected require: " + specifier);
});

if (typeof exports.apply !== "function") throw new Error("missing apply");
if (!Array.isArray(exports.inject)) throw new Error("missing inject");
if (!exports.inject.includes("layout") || !exports.inject.includes("slots")) throw new Error("bad inject: " + exports.inject);

const disposers = [];
const ctx = {
	effect(fn) {
		const dispose = fn();
		if (typeof dispose === "function") disposers.push(dispose);
		return () => {};
	},
	slots: {
		inject(key, cb) {
			calls.injected.push(key);
			cb();
		},
		register(options, component) {
			calls.registered.push({ options, component });
			return () => {};
		},
		entriesOfSlot() {
			return [{ options: { id: "plugins" } }];
		},
		subscribe() {
			return () => {};
		}
	},
	layout: {
		panelInfo: { subscribe: () => () => {}, getSnapshot: () => ({ activePanelId: null }) },
		selectPanel() {},
		toggleSidebar() {}
	}
};

const document = {
	documentElement: { lang: "zh-CN" },
	createElement: () => ({ dataset: {}, textContent: "" }),
	head: { appendChild: (el) => calls.styles.push(el) },
	querySelector: () => null,
	querySelectorAll: () => []
};
globalThis.document = document;

exports.apply(ctx);

if (calls.styles.length !== 1) throw new Error("stylesheet not injected: " + calls.styles.length);
if (!calls.styles[0].dataset.pluginCss?.endsWith("/mobile.css")) throw new Error("bad style tag");
if (!calls.styles[0].textContent.includes("@media (max-width: 768px)")) throw new Error("stylesheet lost its media query");
if (!calls.injected.includes("shell.bottom")) throw new Error("did not inject into shell.bottom");
const nav = calls.registered.find((entry) => entry.options.name === "shell.bottom");
if (!nav || typeof nav.component !== "function") throw new Error("shell.bottom component not registered");

const tree = nav.component();
const kinds = tree.children.filter(Boolean).map((child) => child.props?.className ?? child.type);
if (!kinds.includes("dshm-bar") || !kinds.includes("dshm-backdrop")) throw new Error("bar tree malformed: " + kinds);
const buttons = tree.children[1].children.filter(Boolean);
if (buttons.length !== 4) throw new Error("expected 4 buttons (chat, sessions, plugins, desktop), got " + buttons.length);
if (buttons[0].children.at(-1).children[0] !== "对话") throw new Error("zh copy not selected");
if (buttons[3].children.at(-1).children[0] !== "桌面版") throw new Error("desktop toggle missing");

// ── frame tagging: explicit column pins ───────────────────────────────────────
function el(attrs = {}) {
	const map = new Map(Object.entries(attrs));
	const node = {
		children: [],
		get firstElementChild() {
			return node.children[0] ?? null;
		},
		get nextElementSibling() {
			const parent = node.parent;
			if (parent === void 0) return null;
			return parent.children[parent.children.indexOf(node) + 1] ?? null;
		},
		setAttribute: (key, value) => map.set(key, value),
		removeAttribute: (key) => map.delete(key),
		hasAttribute: (key) => map.has(key),
		getAttribute: (key) => map.get(key) ?? null
	};
	return node;
}
const sidebar = el();
const center = el();
const rightbar = el({ "data-rightbar-col": "" });
const bottom = el({ "data-shell-bottom": "" });
const frame = el();
frame.children = [sidebar, center, rightbar, bottom];
for (const child of frame.children) child.parent = frame;

const tag = exports.__tagFrame;
if (typeof tag !== "function") throw new Error("tagFrame not exposed");
tag(frame, true);
if (!frame.hasAttribute("data-dshm-frame")) throw new Error("frame not tagged");
if (sidebar.getAttribute("data-dshm-col") !== "sidebar") throw new Error("sidebar column not pinned");
if (center.getAttribute("data-dshm-col") !== "center") throw new Error("centre column not pinned -> content lands in a 0px track");
if (rightbar.getAttribute("data-dshm-col") !== "rightbar") throw new Error("rightbar column not pinned");
if (bottom.hasAttribute("data-dshm-col")) throw new Error("bottom row must stay auto-placed");
tag(frame, false);
for (const node of frame.children) {
	if (node.hasAttribute("data-dshm-col") || node.hasAttribute("data-dshm-sidebar")) throw new Error("tag left behind after disable");
}

console.log("ok: styles", calls.styles.length, "| slots", calls.injected.join(","), "| buttons", buttons.length, "| columns pinned");
