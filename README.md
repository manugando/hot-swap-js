# hot-swap-js
A small library to hot swap page content without reloading the entire page.

## How to use it
Just initialize the tool:

```javascript
new HotSwap(onHotSwapStart, executeContentSwap).init();
```

`onHotSwapStart` is called when the library starts to load the other page.
In this function you should hide the content of the current page that will be replaced during the other callback.
This function can return a promise.

`executeContentSwap` is called when the other page is loaded and is ready to swap the current one.
This function will receive as a parameter the full document of the page requested, so you can use it to swap the content.
This function can return a promise.
