"use strict";

const babel = require("@babel/core");
const path = require("path");
const reportExpression = "window.report";
const getMatchedList = (value, regExp = reportExpression) => {
  const reg = new RegExp(regExp, "g");
  return [...value.matchAll(reg)];
};
test(`测试try-catch没有参数的情况`, () => {
  const input = `
    try {
    } catch {
      console.log("我是没有参数的catch");
    }
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      console.log("code", code);
      const list = getMatchedList(code);
      console.log("list", list);
      expect(list.length).toBe(1);
    });
});

test(`测试try-catch有参数的情况`, () => {
  const input = `
    try {
    } catch(error) {
      console.log("我是没有参数的catch");
    }
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
            reportTryCatch: true, // 是否插入try catch中的错误
            reportPromiseCatch: true, // 是否插入promise catch中的错误
            exclude: ["node_modules"],
            include: [],
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(1);
    });
});

test(`测试promise.catch没有参数的情况`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch(() => {})
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(1);
    });
});

test(`测试promise.catch有参数的情况`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {})
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      console.log("这里", code);
      const list = getMatchedList(code);
      expect(list.length).toBe(1);
    });
});

test(`测试已经声明了上报函数的情况`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {
     ${reportExpression}()
   })
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      console.log("!!!", code);
      const list = getMatchedList(code);
      expect(list.length).toBe(1);
    });
});

test(`测试上报函数被注释的情况`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {
     // ${reportExpression}()
   })
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(2);
    });
});

test(`测试有注释并且空函数体的情况/* report-disabled */`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {
     /* report-disabled */
   })
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(0);
    });
});

test(`测试有注释并且有函数体的情况/* report-disabled */`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {
     /* report-disabled */
     console.log('had body')
     const body = 'body lala !'
   })
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(0);
    });
});

test(`测试多个promise.catch的情况`, () => {
  const input = `
   Promise.resolve().then(() => {}).catch((error) => {
     console.log('had body')
     const body = 'body lala !'
   }).catch(() => {})
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(2);
    });
});

test(`测试多个try-catch嵌套的情况`, () => {
  const input = `
  try {
    const name = 'la la la !'
  } catch (error) {
    try {
      const name = 'la2 la2 la2 !'
    } catch {

    }
  }
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(2);
    });
});


test(`测试props.reportTryCatch = false`, () => {
  const input = `
    try {
    } catch {
      console.log("我是没有参数的catch");
    }
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
            reportTryCatch: false,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(0);
    });
});

test(`测试props.autoFillParams = false`, () => {
  const input = `
    try {
    } catch {
      console.log("我是没有参数的catch");
    }
`;
  babel
    .transformAsync(input, {
      plugins: [
        [
          path.join(__dirname, "../lib/index"),
          {
            reportExpression,
            reportTryCatch: false,
          },
        ],
      ],
    })
    .then(({ code }) => {
      const list = getMatchedList(code);
      expect(list.length).toBe(0);
    });
});
