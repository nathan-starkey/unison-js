# Unison
Unison is a small and simple library that enables cross-site communication on null-origin webpages. It acts as a wrapper for `window.postMessage` and `window.onMessage`, allowing this process to be smplified into asynchronous functions.


## Usage
```javascript
// Create a new Unison instance
let unison = Unison();
```
Unison uses `window.opener`, `window.parent` or `window` as the parent window object. Alternatively, you can provide a window object through the constructor:
```javascript
Unison(windowObject);
```
#### Parent window
```javascript
// Functions must be defined in the parent window
unison.define("join", function (a, b) {
  return a + "-" + b;
});
```
#### Child window
```javascript
// Functions can then be used in child windows
let join = unison.declare("join");

console.log(await join("hello", "world")); // Output: "hello-world"
```

## Helper functions
The Unison object contains some helper functions:
```javascript
unison.getWindowParent();
// Returns the window parent: window.opener, window.parent, or null

unison.hasWindowParent();
// Returns true if the window has a parent

unison.getActingParent();
// Returns the parent window that Unison will post messages to
```

## Notes
- Unison uses `window.postMessage` to transport data such as function arguments. Because of the serialization process that takes place, [some objects are not suitable](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#things_that_dont_work_with_structured_clone) arguments.
