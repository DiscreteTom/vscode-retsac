import { ELR } from "retsac";

new ELR.AdvancedBuilder()
  .define({
    fn_def: `
      pub fn identifier@funcName '(' (param (',' param)*)? ')' ':' identifier@retTypeName '{'
        stmt*
      '}'
    `,
  })
  .define({
    stmt: `assign_stmt | ret_stmt | incr_stmt | decr_stmt | if_stmt`,
  })
  .define({
    assign_stmt: `let identifier@varName ':' identifier@typeName '=' exp ';'`,
  });
