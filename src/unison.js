function Unison(parent) {
	// Declare local working vars
	var nextUID = 0;
	var listeners = [];
	var definitions = {};
	var declarations = {};
	var storage = {};
	
	
	// Preset definitions to allow for cross frame storage
	define("set", function (key, value) {
		storage[key] = value;
	});
	
	define("get", function (key) {
		return storage[key] === undefined ? null : storage[key];
	});


	// Declare a function that is defined in another frame
	function declare(id) {
		// Store the declaration locally
		declarations[id] = declaration;
		
		function declaration() {
			var uid = nextUID++;
			
			// Post a /call/ message to the parent frame
			getActingParent().postMessage({ __unison: ["call", uid, id, Array.from(arguments)] }, "*");
			
			// Wait for a promise to be resolved with the result
			return new Promise(function (resolve) {
				listeners.push({ uid, resolve });
			});
		}
		
		return declaration;
	}


	// Define a function in the current frame
	function define(id, definition) {
		if(!definition)
			throw Error("a function definition is required");
		
		// Store the definition locally
		definitions[id] = definition;
	}
	
	
	function getWindowParent() {
		return window.opener || (window.parent === window ? null : window.parent);
	}
	
	
	function hasWindowParent() {
		return getWindowParent() ? true : false;
	}
	
	
	function getActingParent() {
		return parent || getWindowParent() || window;
	}


	window.addEventListener("message", function (event) {
		// Check to see if this is a Unison event
		if(event.data && event.data.__unison) {
			var data = event.data.__unison;
			
			// Another frame has called a function
			if(data[0] === "call") {
				var uid = data[1];
				var id = data[2];
				var args = data[3];
				var definition = definitions[id];
				
				// Call the function
				var result = definition.apply(null, args);
				
				// Callback the result
				event.source.postMessage({ __unison: ["callback", uid, result] }, "*");
			}
			
			// The parent frame has given us a callback result
			else if(data[0] === "callback") {
				var uid = data[1];
				var result = data[2];
				
				// Find the listener that matches this result
				for (var i=0; i<listeners.length; ++i) {
					var listener = listeners[i];
					
					if (listener.uid === uid) {
						// Remove the listener and resolve the pending promise
						listeners.splice(i, 1);
						listener.resolve(result);
						break;
					}
				}
			}
		}
	});
	
	
	return { declare, define, getWindowParent, hasWindowParent, getActingParent };
}