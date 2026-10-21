window.__ModuleLoader__.load({
	id: "dsh-client-ui-mobile",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");

		const PLUGIN_ID = "dsh-client-ui-mobile";
		/** Persisted manual switch: "0" turns the adaptive layout off. */
		const STORAGE_KEY = "dsh-client-ui-mobile.enabled";

		const CSS = [
			// Everything is scoped to the frame this plugin tags, so a failed
			// mount can never half-break the desktop layout.
			"[data-dshm-frame]{--dshm-bar-height:56px}",
			// Hide every piece of our chrome whenever the phone layout is off
			// (desktop width, or the user switched it off on a phone).
			"@media (min-width: 769px){.dshm-bar,.dshm-backdrop,.dshm-pill{display:none !important}}",
			"@media (max-width: 768px){",
			// Dynamic viewport height: keeps the composer above the browser bar.
			"html,body,#root{height:100dvh}",
			// One column: both side tracks collapse and drawers overlay instead.
			"[data-dshm-frame]{grid-template-columns:0px minmax(0,1fr) 0px !important;",
			"height:calc(100dvh - var(--dshm-keyboard-inset,0px)) !important;",
			"overflow-x:hidden;--dsh-composer-side-clearance:4px}",
			// The sidebar leaves the grid flow when it becomes a drawer; pin all
			// three columns so auto-placement cannot shift the centre into track 1.
			"[data-dshm-frame] > [data-dshm-col=\"sidebar\"]{grid-column:1;grid-row:1}",
			"[data-dshm-frame] > [data-dshm-col=\"center\"]{grid-column:2;grid-row:1;min-width:0}",
			"[data-dshm-frame] > [data-dshm-col=\"rightbar\"]{grid-column:3;grid-row:1;min-width:0}",
			// Desktop column resize handles are not touch targets.
			"[data-dshm-frame] > div[class*=\"_handle\"]{display:none !important}",
			// Navigation column becomes an overlay drawer.
			"[data-dshm-sidebar]{position:fixed !important;inset:0 auto 0 0 !important;",
			"width:min(86vw,300px) !important;height:100dvh;box-sizing:border-box;z-index:30;",
			"padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);",
			"transform:translateX(-102%);box-shadow:0 0 48px rgb(0 0 0 / 22%);overscroll-behavior:contain;",
			"background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base,#fff));",
			"visibility:hidden;transition:transform 220ms cubic-bezier(.2,.7,.2,1),visibility 0s linear 220ms}",
			"[data-dshm-frame]:not([data-sidebar-collapsed]) [data-dshm-sidebar]{transform:translateX(0);",
			"visibility:visible;transition:transform 220ms cubic-bezier(.2,.7,.2,1)}",
			// The sidebar body keeps its inline px width; stretch it to the drawer.
			"[data-dshm-frame]:not([data-sidebar-collapsed]) [data-dshm-sidebar] > *{width:100% !important}",
			".dshm-backdrop{position:fixed;inset:0;z-index:25;background:rgb(0 0 0 / 32%);",
			"opacity:0;pointer-events:none;transition:opacity 220ms;touch-action:none}",
			"[data-dshm-frame]:not([data-sidebar-collapsed]) .dshm-backdrop{opacity:1;pointer-events:auto}",
			// Bottom navigation, inside the frame's own bottom grid row.
			".dshm-bar{display:flex;align-items:stretch;justify-content:space-around;gap:2px;",
			"height:calc(var(--dshm-bar-height) + env(safe-area-inset-bottom));",
			"padding-bottom:env(safe-area-inset-bottom);",
			"padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);",
			"border-top:.5px solid var(--dsw-alias-border-l3,rgb(0 0 0 / 8%));",
			"background:var(--dsw-alias-bg-base,#fff);position:relative;z-index:29}",
			".dshm-btn{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;",
			"justify-content:center;gap:3px;border:0;background:transparent;padding:4px 0;margin:0;",
			"color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;line-height:1;",
			"border-radius:10px;cursor:pointer;touch-action:manipulation;",
			"-webkit-tap-highlight-color:transparent}",
			".dshm-btn svg{width:22px;height:22px;flex:none}",
			".dshm-btn[aria-pressed=\"true\"]{color:var(--dsw-alias-label-primary,#111);",
			"background:color-mix(in srgb,currentColor 8%,transparent)}",
			// The way back once the adaptive layout is switched off.
			".dshm-pill{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));",
			"z-index:26;display:inline-flex;align-items:center;gap:6px;",
			"border:.5px solid var(--dsw-alias-border-l2,rgb(0 0 0 / 12%));border-radius:999px;",
			"padding:9px 14px;font-size:12px;line-height:1;",
			"background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#111);",
			"box-shadow:0 4px 16px rgb(0 0 0 / 18%);cursor:pointer;",
			"-webkit-tap-highlight-color:transparent;touch-action:manipulation}",
			".dshm-pill svg{width:16px;height:16px;flex:none}",
			// iOS zooms the page when a focused field is under 16px.
			"[data-dshm-frame] [contenteditable=\"true\"],[data-dshm-frame] input,[data-dshm-frame] textarea{font-size:16px !important}",
			// Wide content scrolls inside its own box instead of the page.
			"[data-dshm-frame] pre{max-width:100%;overflow-x:auto}",
			"[data-dshm-frame] table{display:block;max-width:100%;overflow-x:auto}",
			// The right panel keeps a px width for docked mode; phones get it full-screen.
			"[data-dshm-frame] [data-rightbar-col] > [data-sidebar-right-open]{position:fixed !important;inset:0 0 0 auto !important;",
			"width:100vw !important;max-width:100vw !important;z-index:28}",
			"[data-dshm-frame] [role=\"dialog\"]{max-width:calc(100vw - 24px) !important}",
			// The settings modal portals to document.body, outside the frame, so it
			// is keyed by its own stable attribute and the html-level switch flag.
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"]{width:100vw !important;max-width:100vw !important;",
			"height:100dvh !important;border-radius:0 !important;flex-direction:column !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav{position:relative;width:100% !important;flex:none;",
			"flex-direction:row !important;align-items:center;gap:6px;",
			"padding:calc(8px + env(safe-area-inset-top)) 10px 8px !important;",
			"overflow-x:auto;overflow-y:hidden;scrollbar-width:none;",
			"border-bottom:.5px solid var(--dsw-alias-border-l2,rgb(0 0 0 / 10%))}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav::-webkit-scrollbar{display:none}",
			// Keep the title as the dialog's accessible name, out of the tab strip.
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav > div:first-child{",
			"position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav > div:last-child{",
			"flex-direction:row !important;gap:6px;overflow:visible !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav button{flex:0 0 auto !important;",
			"width:auto !important;height:36px !important;padding:0 14px !important;border-radius:999px !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > nav button > :last-child{",
			"flex:0 0 auto !important;overflow:visible !important;text-overflow:clip !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > div{min-width:0;min-height:0}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > div > div:first-child{",
			"height:auto !important;padding:6px 12px !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] > div > div:last-child{",
			"padding:0 14px calc(24px + env(safe-area-inset-bottom)) !important}",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] pre,",
			"html[data-dshm-mobile] [data-shortcut-modal=\"settings\"] table{max-width:100%;overflow-x:auto}",
			"}"
		].join("");

		/** Copy for the two supported GUI languages. */
		const COPY = {
			zh: {
				nav: "主导航",
				chat: "对话",
				sessions: "会话",
				plugins: "插件",
				desktop: "桌面版",
				mobile: "手机版"
			},
			en: {
				nav: "Main navigation",
				chat: "Chat",
				sessions: "Sessions",
				plugins: "Plugins",
				desktop: "Desktop",
				mobile: "Mobile"
			}
		};

		/** Pick copy from the document language, defaulting to English. */
		function copy() {
			const lang = (typeof document !== "undefined" && document.documentElement.lang) || "";
			return lang.toLowerCase().startsWith("zh") ? COPY.zh : COPY.en;
		}

		/**
		 * Read the manual switch, letting `?dshm=off` / `?dshm=on` override it.
		 * The URL form is the escape hatch when the adaptive layout itself is
		 * what makes the page unusable.
		 */
		function readEnabled() {
			try {
				const override = new URLSearchParams(window.location.search).get("dshm");
				if (override === "off" || override === "on") {
					writeEnabled(override === "on");
					return override === "on";
				}
			} catch {
				// Non-browser URL handling: fall through to storage.
			}
			try {
				return window.localStorage.getItem(STORAGE_KEY) !== "0";
			} catch {
				return true;
			}
		}

		/** Persist the manual switch; storage failures must not break the toggle. */
		function writeEnabled(value) {
			try {
				window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
			} catch {
				// Private mode: the switch stays in-memory for this page.
			}
		}

		/** Build one stroked 24x24 icon. */
		function icon(children) {
			return React.createElement(
				"svg",
				{
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.7,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					focusable: "false"
				},
				children
			);
		}

		const ICONS = {
			chat: icon([React.createElement("path", { key: "p", d: "M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 4V5.5Z" })]),
			sessions: icon([React.createElement("path", { key: "p", d: "M4 6h16M4 12h16M4 18h10" })]),
			plugins: icon([
				React.createElement("path", { key: "a", d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" }),
				React.createElement("path", { key: "b", d: "M14 17h6" })
			]),
			desktop: icon([
				React.createElement("rect", { key: "r", x: 3, y: 4, width: 18, height: 12, rx: 2 }),
				React.createElement("path", { key: "p", d: "M9 20h6M12 16v4" })
			]),
			mobile: icon([
				React.createElement("rect", { key: "r", x: 7, y: 2.5, width: 10, height: 19, rx: 2.5 }),
				React.createElement("path", { key: "p", d: "M11 18h2" })
			])
		};

		/** Install the stylesheet for exactly the owning plugin lifetime. */
		function installStyles(ctx) {
			if (typeof document === "undefined") return;
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = PLUGIN_ID + "/mobile.css";
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "mobile-ui: stylesheet");
		}

		/**
		 * Track the on-screen keyboard (iOS shrinks the visual viewport without
		 * resizing the layout viewport) and expose it as a frame height inset.
		 * @param ctx - owning plugin context.
		 */
		function installViewportInset(ctx) {
			if (typeof window === "undefined" || !window.visualViewport) return;
			ctx.effect(() => {
				const viewport = window.visualViewport;
				const root = document.documentElement;
				const apply = () => {
					// Pinch-zoom also shrinks the visual viewport; leave layout alone then.
					if (viewport.scale > 1.01) return;
					const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
					root.style.setProperty("--dshm-keyboard-inset", Math.round(inset) + "px");
				};
				apply();
				viewport.addEventListener("resize", apply);
				viewport.addEventListener("scroll", apply);
				return () => {
					viewport.removeEventListener("resize", apply);
					viewport.removeEventListener("scroll", apply);
					root.style.removeProperty("--dshm-keyboard-inset");
				};
			}, "mobile-ui: keyboard inset");
		}

		/** Let env(safe-area-inset-*) resolve to real notches on iOS. */
		function ensureViewportFit() {
			if (typeof document === "undefined") return;
			const meta = document.querySelector('meta[name="viewport"]');
			if (meta === null) return;
			const content = meta.getAttribute("content") || "";
			if (content.includes("viewport-fit=cover")) return;
			meta.setAttribute("content", content.trim() + ", viewport-fit=cover");
		}

		/**
		 * Mark or unmark the frame so the stylesheet applies to it alone. The
		 * three columns are pinned explicitly: the drawer leaves grid flow, and
		 * auto-placement would otherwise shift the centre into the 0px track.
		 * @param frame - the AppFrame element, or null before it exists.
		 * @param enabled - whether the adaptive layout is on.
		 */
		function tagFrame(frame, enabled) {
			if (typeof document !== "undefined") {
				document.documentElement.toggleAttribute("data-dshm-mobile", enabled);
			}
			if (frame === null || frame === void 0) return;
			if (!enabled) {
				for (const el of [frame, ...frame.children]) {
					el.removeAttribute("data-dshm-frame");
					el.removeAttribute("data-dshm-sidebar");
					el.removeAttribute("data-dshm-col");
				}
				return;
			}
			const rightbar = [...frame.children].find((el) => el.hasAttribute("data-rightbar-col")) || null;
			const sidebar = frame.firstElementChild;
			const center = sidebar === null ? null : sidebar.nextElementSibling;
			frame.setAttribute("data-dshm-frame", "");
			if (sidebar !== null) {
				sidebar.setAttribute("data-dshm-sidebar", "");
				sidebar.setAttribute("data-dshm-col", "sidebar");
			}
			if (center !== null && !center.hasAttribute("data-shell-bottom")) {
				center.setAttribute("data-dshm-col", "center");
			}
			if (rightbar !== null) rightbar.setAttribute("data-dshm-col", "rightbar");
		}

		const inject = ["slots", "layout"];

		/**
		 * Mobile shell: tags the frame and its columns, then fills `shell.bottom`
		 * with either the bottom navigation or, when switched off, a small
		 * floating pill that switches the adaptive layout back on.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			installStyles(ctx);
			installViewportInset(ctx);
			ensureViewportFit();

			const layout = ctx.layout;
			const slots = ctx.slots;

			/** Whether a main panel is currently registered under this id. */
			function hasPanel(id) {
				try {
					return slots.entriesOfSlot("sidebar.panellist").some((entry) => entry.options && entry.options.id === id);
				} catch {
					return false;
				}
			}

			function MobileShell() {
				const [enabled, setEnabled] = React.useState(readEnabled);
				const [panelRevision, setPanelRevision] = React.useState(0);
				const [drawer, setDrawer] = React.useState(false);
				const [frame, setFrame] = React.useState(null);

				const subscribePanel = React.useCallback((cb) => layout.panelInfo.subscribe(cb), []);
				const readPanel = React.useCallback(() => layout.panelInfo.getSnapshot(), []);
				const panelInfo = React.useSyncExternalStore(subscribePanel, readPanel, readPanel);

				// The frame exists as soon as the shell renders; it does not depend
				// on this slot's own output, so the switch works in both states.
				// Tagging happens in a layout effect to avoid a desktop-layout flash.
				React.useLayoutEffect(() => {
					const row = document.querySelector("[data-shell-bottom]");
					const el = row === null ? null : row.parentElement;
					setFrame((prev) => (prev === el ? prev : el));
					tagFrame(el, enabled);
				}, [enabled, frame]);

				React.useEffect(() => {
					if (frame === null) return;
					const sync = () => setDrawer(!frame.hasAttribute("data-sidebar-collapsed"));
					sync();
					const observer = new MutationObserver(sync);
					observer.observe(frame, { attributes: true, attributeFilter: ["data-sidebar-collapsed"] });
					return () => observer.disconnect();
				}, [frame]);

				React.useEffect(() => {
					try {
						return slots.subscribe("sidebar.panellist", () => setPanelRevision((n) => n + 1));
					} catch {
						// The panellist slot may not be declared yet; the bar still works.
						return void 0;
					}
				}, [slots]);

				// On phones, tapping anything inside the drawer navigates: close it.
				React.useEffect(() => {
					if (frame === null || !enabled) return;
					const column = frame.firstElementChild;
					if (column === null) return;
					const onClick = (event) => {
						const target = event.target;
						const actionable = target && target.closest && target.closest("a,button,[role=\"button\"],[data-session-id]");
						if (actionable && !frame.hasAttribute("data-sidebar-collapsed")) {
							window.setTimeout(() => {
								if (!frame.hasAttribute("data-sidebar-collapsed")) layout.toggleSidebar();
							}, 0);
						}
					};
					column.addEventListener("click", onClick);
					return () => column.removeEventListener("click", onClick);
				}, [frame, enabled]);

				/** Close the drawer before leaving the adaptive layout. */
				const closeDrawer = React.useCallback(() => {
					if (frame !== null && !frame.hasAttribute("data-sidebar-collapsed")) layout.toggleSidebar();
				}, [frame]);

				/** Switch the adaptive layout; the choice persists on this device. */
				const toggle = React.useCallback((next) => {
					closeDrawer();
					writeEnabled(next);
					setEnabled(next);
				}, [closeDrawer]);

				const labels = copy();
				const activePanel = panelInfo.activePanelId;
				const plugins = React.useMemo(() => hasPanel("plugins"), [panelRevision]);

				if (!enabled) {
					return React.createElement(
						"button",
						{
							type: "button",
							className: "dshm-pill",
							title: labels.mobile,
							"aria-label": labels.mobile,
							onClick: () => toggle(true)
						},
						ICONS.mobile,
						React.createElement("span", null, labels.mobile)
					);
				}

				return React.createElement(
					React.Fragment,
					null,
					React.createElement("div", {
						className: "dshm-backdrop",
						"aria-hidden": "true",
						onClick: closeDrawer
					}),
					React.createElement(
						"nav",
						{ className: "dshm-bar", "aria-label": labels.nav },
						React.createElement(
							"button",
							{
								type: "button",
								className: "dshm-btn",
								"aria-pressed": activePanel === null ? "true" : "false",
								onClick: () => {
									closeDrawer();
									try {
										layout.selectPanel(null);
									} catch {
										// Keep the shell intact if navigation rejects.
									}
								}
							},
							ICONS.chat,
							React.createElement("span", null, labels.chat)
						),
						React.createElement(
							"button",
							{
								type: "button",
								className: "dshm-btn",
								"aria-pressed": drawer ? "true" : "false",
								"aria-expanded": drawer ? "true" : "false",
								onClick: () => layout.toggleSidebar()
							},
							ICONS.sessions,
							React.createElement("span", null, labels.sessions)
						),
						plugins
							? React.createElement(
								"button",
								{
									type: "button",
									className: "dshm-btn",
									"aria-pressed": activePanel === "plugins" ? "true" : "false",
									onClick: () => {
										closeDrawer();
										try {
											layout.selectPanel("plugins");
										} catch {
											// Panel disappeared between render and tap.
										}
									}
								},
								ICONS.plugins,
								React.createElement("span", null, labels.plugins)
							)
							: null,
						React.createElement(
							"button",
							{
								type: "button",
								className: "dshm-btn",
								"aria-pressed": "false",
								title: labels.desktop,
								onClick: () => toggle(false)
							},
							ICONS.desktop,
							React.createElement("span", null, labels.desktop)
						)
					)
				);
			}

			ctx.slots.inject("shell.bottom", () => ctx.slots.register({ name: "shell.bottom" }, MobileShell));

			// Tagging is a DOM fact, not a rendered one: drop it with the plugin.
			ctx.effect(() => () => {
				document.documentElement.removeAttribute("data-dshm-mobile");
				for (const el of document.querySelectorAll("[data-dshm-frame],[data-dshm-sidebar],[data-dshm-col]")) {
					el.removeAttribute("data-dshm-frame");
					el.removeAttribute("data-dshm-sidebar");
					el.removeAttribute("data-dshm-col");
				}
			}, "mobile-ui: frame tags");
		}

		exports.apply = apply;
		exports.inject = inject;
		// Exposed for the headless smoke test only; the loader ignores it.
		exports.__tagFrame = tagFrame;
		return module.exports;
	}
});
