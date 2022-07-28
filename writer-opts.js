"use strict";

const Q = require("q");
const readFile = Q.denodeify(require("fs").readFile);
const resolve = require("path").resolve;

module.exports = Q.all([
  readFile(resolve(__dirname, "./templates/template.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/header.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/commit.hbs"), "utf-8"),
]).spread((template, header, commit) => {
  const writerOpts = getWriterOpts();

  writerOpts.mainTemplate = template;
  writerOpts.headerPartial = header;
  writerOpts.commitPartial = commit;

  return writerOpts;
});

function getWriterOpts() {
  return {
    transform: (commit, context) => {
      if (!commit.tag || typeof commit.tag !== "string") {
        return;
      }

      commit.shortHash = commit.hash.substring(0, 7);

      commit.message = commit.message.replace(
        /#[1-9]\d*/g,
        ($1) =>
          `[${$1}](${context.host}/${context.owner}/${
            context.repository
          }/issues/${$1.replace("#", "")})`
      );

      if (commit.tag === "doc" || commit.tag === "docs") {
        commit.tag = "📘 Documents";
      } else if (commit.tag === "feat") {
        commit.tag = "✨ Features";
      } else if (commit.tag === "fix") {
        commit.tag = "🐞 Bug Fixed";
      } else if (commit.tag === "style") {
        commit.tag = "🎨 Styles";
      } else if (commit.tag === "refactor") {
        commit.tag = "✏ Refactor";
      } else if (commit.tag === "test") {
        commit.tag = "🔨 Test";
      } else if (commit.tag === "chore") {
        commit.tag = "🛠 Chores";
      } else if (commit.tag === "perf") {
        commit.tag = "📈 Performance";
      } else if (commit.tag === "merge") {
        commit.tag = "🔗 Merge";
      } else if (commit.tag === "revert") {
        commit.tag = "⬅ Revert";
      } else if (commit.tag === "build") {
        commit.tag = "🧱 Build";
      }
      return commit;
    },
    groupBy: "tag",
    commitGroupsSort: "title",
    commitsSort: ["tag", "message"],
  };
}
