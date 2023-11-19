// Generate retsac.tmLanguage.json
// Usage: ts-node utils/tmlg.ts

import { TmBuilder } from "tmlb";
import { writeFileSync } from "fs";
import { compose } from "@discretetom/r-compose";

const language = new TmBuilder({ scopeName: "source.definition.retsac" })
  // grammar
  .append({
    name: "constant.other.grammar.retsac",
    match: compose(({ concat, lookahead, escape }) =>
      concat(
        /\w+/, // [[grammar]]
        /\b/,
        // can't be followed by `@` since it's used for [[@rename]]
        lookahead(escape("@"), { negative: true })
      )
    ).source,
  })
  // literals
  .append({
    name: "string.quoted.double.retsac",
    match: compose(({ concat, escape, any, not, lookahead }) =>
      concat(
        // [[double quote literal]]
        escape('"'), // open quote
        any(not(escape('"'))), // content, ignore escaped quotes
        escape('"'), // close quote
        // can't be followed by `@` since it's used for [[@rename]]
        lookahead(escape("@"), { negative: true })
      )
    ).source,
  })
  .append({
    name: "string.quoted.single.retsac",
    match: compose(({ concat, escape, any, not, lookahead }) =>
      concat(
        // [[single quote literal]]
        escape("'"), // open quote
        any(not(escape("'"))), // content, ignore escaped quotes
        escape("'"), // close quote
        // can't be followed by `@` since it's used for [[@rename]]
        lookahead(escape("@"), { negative: true })
      )
    ).source,
  })
  // [[rename]]
  .append({
    name: "meta.grammar.retsac",
    match: compose(({ concat, escape, any, select, not, lookahead, capture }) =>
      concat(
        capture(
          select(
            // [[@grammar]]
            /\w+/,
            // [[@double quote literal]]
            concat(
              escape('"'), // open quote
              any(not(escape('"'))), // content, ignore escaped quotes
              escape('"') // close quote
            ),
            // [[@single quote literal]]
            concat(
              escape("'"), // open quote
              any(not(escape("'"))), // content, ignore escaped quotes
              escape("'") // close quote
            )
          )
        ),
        capture(escape("@")),
        capture(/\w+/), // the new name
        // can't be followed by another `@`
        lookahead(escape("@"), { negative: true })
      )
    ).source,
    captures: {
      "1": {
        name: "comment.line.double-slash.retsac",
      },
      "2": {
        name: "keyword.operator.new.retsac",
      },
      "3": {
        name: "variable.other.constant.retsac",
      },
    },
  })
  // `|`
  .append({
    name: "keyword.other.retsac",
    match: compose(({ escape }) => escape("|")).source,
  })
  // advanced parser builder quantifiers
  .append({
    name: "keyword.operator.quantifier.retsac",
    match: compose(({ select, escape }) =>
      select(escape("?"), escape("*"), escape("+"))
    ).source,
  })
  // advanced parser builder borders
  .append({
    name: "variable.other.constant.retsac",
    match: compose(({ escape, select }) => select(escape("("), escape(")")))
      .source,
  })
  .build({ validate: true });

language.injectionSelector =
  "L:string.template.ts -punctuation.definition.string.template -meta.template.expression";

writeFileSync(
  "./syntaxes/retsac.tmLanguage.json",
  JSON.stringify(language, null, 2),
  "utf-8"
);
