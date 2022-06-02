const generate = require("@babel/generator").default;
const handleMatchComment = (node) => {
  if (!node) return false;
  const reg = /\s{0,}report-disabled\s{0,}/;
  return reg.test(node.value);
};

const generateExpressionNode = ({
  babelTemplate,
  expression,
  error,
  filename,
  lineNo,
  columnNo,
}) => {
  const build = babelTemplate(`
    ${expression}(${error},'${filename}',${lineNo},${columnNo})
  `);
  const ast = build();
  return ast;
};

const generateReportParams = (state = {}, loc = {}) => {
  return {
    filename: state.filename || null,
    lineNo: loc.start ? loc.start.line : null,
    columnNo: loc.start ? loc.start.column : null,
  };
};

const handleMatchFileRange = (fileRange = [], filename = "") => {
  return fileRange.some((range) => filename.includes(range));
};
const DEFAULT_ERROR_PARAM_NAME = "err";

const handleDuplicateReportExp = (node, reportExpression) => {
  const { code } = generate(node);
  const rowCodeList = code.split("\n"); // 每行代码
  return rowCodeList.some((rowCode) => {
    const commentIdx = rowCode.indexOf("//");
    const reportExp = rowCode.indexOf(reportExpression);
    return (commentIdx >= -1 && reportExp >= -1 && reportExp < commentIdx) ||
      (reportExp > -1 && commentIdx === -1)
      ? true
      : false;
  });
};

const generateErrorParam = (node, defaultErrorParamName, babelTypes) => {
  if (!node) {
    return {
      errorParamName: defaultErrorParamName || DEFAULT_ERROR_PARAM_NAME,
      errorParamNode: babelTypes.identifier(DEFAULT_ERROR_PARAM_NAME),
      isIdentifier: false,
    };
  }
  return {
    errorParamName: node.name,
    errorParamNode: "",
    isIdentifier: babelTypes.isIdentifier(node),
  };
};

module.exports = {
  handleMatchComment,
  generateExpressionNode,
  generateReportParams,
  generateErrorParam,
  handleMatchFileRange,
  handleDuplicateReportExp,
};
