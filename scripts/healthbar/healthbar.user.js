// ==UserScript==
// @name          Healthbar
// @namespace     https://tampermonkey.net/
// @version       1.0.1
// @description   Shows health bars for all entities which have health.
// @license       MIT
// @icon          https://florr.io/favicon-32x32.png
// @author        Ponyo
// @match         *://florr.io/*
// @run-at        document-start
// ==/UserScript==

(() => {

	function base64ToUint8Array(base64Str) {
		const raw = atob(base64Str);
		return Uint8Array.from(Array.prototype.map.call(raw, (x) => {
			return x.charCodeAt(0);
		}));
	}

	async function modifyWebAssembly() {
		const response = await fetch(`https://raw.githubusercontent.com/CantRunRiver/florrlab/main/scripts/healthbar/client.pack`, {
			"headers": {
				"Content-Type": "text/plain; charset=ASCII"
			}
		});
		const pack = await response.text();
		const modifiedWebAssemblyMap = pack.split("\n");
		const createdAt = new Date(Number(modifiedWebAssemblyMap[0]));
		const build = modifiedWebAssemblyMap[1];
		const uint8 = base64ToUint8Array(modifiedWebAssemblyMap.slice(2).join(""));
		console.log("Build:", build, "created at", createdAt);
		return uint8.buffer;
	}

	WebAssembly.instantiateStreaming = (source, importObject) => {
		return new Promise(async (resolve, reject) => {
			const buffer = await source.arrayBuffer();
			const instance = WebAssembly.instantiate(buffer, importObject);
			resolve(instance);
		});
	};

	WebAssembly.instantiate = new Proxy(WebAssembly.instantiate, {
		"apply": async (target, thisArg, args) => {
			const buffer = await modifyWebAssembly();
			args[0] = buffer;
			return target.apply(thisArg, args);
		}
	});

})();
