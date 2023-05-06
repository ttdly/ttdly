const fs = require("fs");
const github = require("@actions/github");
const core = require("@actions/core");
const octokit = github.getOctokit(process.argv[2]);
const fetcher = octokit.graphql;

async function run() {
  let readme = "";
  let posts = `\n<pre>\n<strong>近期发布</strong>\n`;
  const baseURL = "https://blog.152527.xyz/posts/";
  const baseInfo = fs.readFileSync("base.md", { encoding: "utf-8" });
  const data = await fetcher(`
  query{
    repository(name: "ttdly.github.io", owner: "ttdly") {
      discussions(first: 5, states: OPEN) {
        nodes {
          title
          number
          createdAt
        }
      }
    }
  }`);
  console.log(JSON.stringify(data.repository.discussions.nodes));
  for (elem of data.repository.discussions.nodes) {
    let date = new Date(elem.createdAt);
    let dateStr = `${date.getFullYear()}-${date
      .getMonth()
      .toString()
      .padStart(2, "0")}-${(date.getDay() + 1).toString().padStart(2, "0")}`;
    posts =
      posts +
      `\n${dateStr} <a href="${baseURL}${elem.number}.html" target="_blank">${elem.title}</a>`;
  }
  posts += `\n</pre>\n\n`;
  const time = `\n更新时间:${new Date().toLocaleDateString("zh-CN")}`;
  readme = baseInfo + posts + time;
  fs.writeFileSync("README.md", readme);
}

try {
  run();
} catch (e) {
  core.setFailed(e);
}
