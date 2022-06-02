# babel-plugin-auto-report-error

Babel plugin helps report the error in the try catch statement or promise catch statement. You can 
 use `/* report-disabled */` comment to disabled this rules in some catch body.
## Usage

```bash
npm install babel-plugin-auto-report-error -D
```

or

```bash
yarn add babel-plugin-auto-report-error -D
```

Via `.babelrc.js` or `babel.config.js` or babel-loader.

```javascript
{
  "plugins": [["babel-plugin-auto-report-error", options]]
}
```

## options


### reportExpression

The option add reportExpression into the top of catch statement. `reportExpression` is be string.

**Default**: "" `(Required)`

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        // set your report expression
        reportExpression: "window.report",
      },
    ],
  ];
}
```

### reportTryCatch

The option add reportTryCatch will auto inserted report function. `reportTryCatch` is be boolean.
Insert try catch .
**Default**: true

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        reportTryCatch: true,
      },
    ],
  ];
}
```

### reportPromiseCatch

The option add reportPromiseCatch will auto inserted report function. `reportPromiseCatch` is be boolean. Insert Promise.catch .

**Default**: true

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        reportPromiseCatch: true,
      },
    ],
  ];
}
```

### autoFillParam

The option add autoFillParam will auto fill missing parameters of the function. `autoFillParam` is be boolean.

**Default**: true

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        autoFillParam: true,
      },
    ],
  ];
}
```

### autoFillParamName

The option add autoFillParamName that can help you custom your error param name. `autoFillParamName` is be string.

**Default**: 'err'

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        autoFillParamName: "err",
      },
    ],
  ];
}
```

### exclude

The option add exclude that the plugin doesn't take effect in the excluded file. `Exclude` is set as an array .

**Default**: ['node_modules']

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        exclude: ["node_modules"],
      },
    ],
  ];
}
```

### include

The option add include that the plugin takes effect in the included file. `Include` is set as an array.

**Default**: []

```javascript
{
  plugins: [
    [
      "babel-plugin-auto-report-error",
      {
        include: ["src/view"],
      },
    ],
  ];
}
```

## Example

### From

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      "babel-plugin-auto-report-error.js",
      {
        reportExpression: "window.report",
      },
    ],
  ],
};
```

```javascript

function promiseCatchFn() {
  Promise.resolve()
    .then(() => {})
    .catch(() => {
      console.log("la la la ");
    });
}
```

### To

```javascript

function promiseCatchFn() {
  Promise.resolve()
    .then(() => {})
    .catch((error) => {
      window.report(error,filename,lineNo,colNo);
      console.log("la la la ");
    });
}
```


---

Or:

```javascript

function promiseCatchFn() {
  Promise.resolve()
    .then(() => {})
    .catch(() => {
      // disabled the rules;
      /* report-disabled */
      console.log("la la la ");
    });
}
```

### To

```javascript

function promiseCatchFn() {
  Promise.resolve()
    .then(() => {})
    .catch((error) => {
      /* report-disabled */
      console.log("la la la ");
    });
}
```
