![](https://raw.githubusercontent.com/Cumcord/assets/main/spitroast/banner.svg)

# spitroast
A very simple JavaScript monkeypatcher library that inserts your code in both ends.

# Usage
```js
// ESM
import * as spitroast from "spitroast";

// CJS
const spitroast = require("spitroast");

const exampleObject = { testFunction: () => {} };

// Patches that run before the original function
spitroast.before("testFunction", exampleObject, (args) => { // `args` is an array of arguments passed to the original function
  console.log("Before");

  // You can modify `args` directly, or return an array to replace the original arguments
}, false); // Changing the second argument to true here  would make the patch one-time, meaning it would unpatch after being called once

exampleObject.testFunction(); // logs "Before"

// Patches that run after the original function
spitroast.after("testFunction", exampleObject, (args, ret) => { // `ret` is the return value of the original function
  console.log("After");

  // You can modify `ret` directly, or return something to replace the original return value
});

// Patches that replace the original function
const unpatch = spitroast.instead("testFunction", exampleObject, (args, orig) => { // `orig` is the original function itself
  console.log("Instead");
});

// Patches inherit context from the original function, just use `this` as normal

exampleObject.testFunction(); // Patches stack - This logs "Before", "Instead", "After"

// Unpatches are as simple as calling the return value of the patch function
unpatch(); // Now if you call the function it'll log just "Before" and "After"

// You can also unpatch EVERY patch, but be careful with this!
spitroast.unpatchAll();
```
