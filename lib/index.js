const {
  handleMatchComment,
  handleMatchFileRange,
  handleDuplicateReportExp,
  generateExpressionNode,
  generateReportParams,
  generateErrorParam,
} = require("./utils/tools");
module.exports = function (
  { template: babelTemplate, types: babelTypes },
  {
    reportExpression,
    reportTryCatch = true,
    reportPromiseCatch = true,
    autoFillParam = true,
    autoFillParamName = "err",
    exclude = ["node_modules"],
    include = [],
  }
) {
  return {
    visitor: {
      TryStatement(path, state) {
        if (!reportTryCatch) return;
        if (!reportExpression)
          return console.error(
            "[babel-plugin-auto-report-error]:  reportExpression is required"
          );
        console.log(path.scope.getBinding());
        if (babelTypes.isCatchClause(path.node.handler)) {
          if (exclude.length && handleMatchFileRange(exclude, state.filename))
            return;

          if (include.length && !handleMatchFileRange(include, state.filename))
            return;
          const getCatchHandlerBody = path.node.handler.body;
          const getCatchBody = getCatchHandlerBody.body || [];
          if (getCatchBody.length) {
            if (getCatchBody.some((item) => handleMatchComment(item))) return;
          } else {
            if (
              getCatchHandlerBody.innerComments &&
              getCatchHandlerBody.innerComments.some((item) =>
                handleMatchComment(item)
              )
            )
              return;
          }

          if (handleDuplicateReportExp(getCatchHandlerBody, reportExpression))
            return;

          const {
            errorParamName,
            errorParamNode,
            isIdentifier,
          } = generateErrorParam(
            path.node.handler.param,
            autoFillParamName,
            babelTypes
          );
          // 不需要自动填充参数的情况或者参数存在解构的情况
          if (
            (!autoFillParam && errorParamNode) ||
            (!errorParamNode && !isIdentifier)
          )
            return;
          if (errorParamNode) {
            /**
             * origin
             * try {} catch {}
             *
             * transform
             *
             * try {} catch (err) {}
             */
            path.node.handler.param = errorParamNode;
          }

          const { filename, lineNo, columnNo } = generateReportParams(
            state,
            path.node.loc
          );

          const reportExpressionNode = generateExpressionNode({
            babelTemplate,
            expression: reportExpression,
            error: errorParamName,
            filename,
            lineNo,
            columnNo,
          });
          getCatchBody.unshift(reportExpressionNode);
        }
      },

      CallExpression(path, state) {
        if (!reportPromiseCatch) return;
        if (!reportExpression)
          return console.error(
            "[babel-plugin-auto-report-error]:  reportExpression is required"
          );
        if (exclude.length && handleMatchFileRange(exclude, state.filename))
          return;

        if (include.length && !handleMatchFileRange(include, state.filename))
          return;
        const callee = path.node.callee;
        if (callee.property && callee.property.name === "catch") {
          const args = path.node.arguments;
          if (!args.length) return;
          const [catchCbFnExp] = args; // 参数中的第一个节点内容
          const getCatchBody = catchCbFnExp.body.body || []; // 节点中的内容

          if (getCatchBody.length) {
            if (
              getCatchBody.some(
                (bodyItem) =>
                  bodyItem.leadingComments &&
                  bodyItem.leadingComments.some((item) =>
                    handleMatchComment(item)
                  )
              )
            )
              return;
          } else {
            if (
              catchCbFnExp.body.innerComments &&
              catchCbFnExp.body.innerComments.some((item) =>
                handleMatchComment(item)
              )
            )
              return;
          }

          if (handleDuplicateReportExp(catchCbFnExp.body, reportExpression))
            return;

          const {
            errorParamName,
            errorParamNode,
            isIdentifier,
          } = generateErrorParam(
            catchCbFnExp.params[0],
            autoFillParamName,
            babelTypes
          );

          // 不需要自动填充参数的情况或者参数存在解构的情况
          if (
            (!autoFillParam && errorParamNode) ||
            (!errorParamNode && !isIdentifier)
          )
            return;

          if (errorParamNode) {
            /**
             * origin
             * Promise.catch(() => {})
             *
             * transform
             *
             * Promise.catch((err) => {})
             */
            catchCbFnExp.params.push(errorParamNode);
          }

          const { filename, lineNo, columnNo } = generateReportParams(
            state,
            catchCbFnExp.loc
          );

          const reportExpressionNode = generateExpressionNode({
            babelTemplate,
            expression: reportExpression,
            error: errorParamName,
            filename,
            lineNo,
            columnNo,
          });
          getCatchBody.unshift(reportExpressionNode);
        }
      },
    },
  };
};
