const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const HTML5ToPDF = require("html5-to-pdf");
const path = require("path");
inquirer
  .prompt({
    message: "Enter your GitHub username:",
    name: "username"
  })
  .then(function({ username }) {
    username = "TonyV1487";
    const mainUrl = `https://api.github.com/users/${username}`;
    const repoUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
    const followersUrl = `https://api.github.com/users/${username}/followers`;
    const followingUrl = `https://api.github.com/users/${username}/following`;

    axios
      .all([
        axios.get(mainUrl),
        axios.get(repoUrl),
        axios.get(followersUrl),
        axios.get(followingUrl)
      ])
      .then(
        axios.spread((mainRes, repoRes, followersRes, followingRes) => {
          // Profile image
          const avatarUrl = mainRes.data.avatar_url;
          // * User name
          const fullName = mainRes.data.name;
          console.log(fullName);
          // * Links to the following:
          //   * User location via Google Maps
          const location = mainRes.data.location;
          //   * User GitHub profile
          const profileUrl = mainRes.data.url;
          //   * User blog
          const blogUrl = mainRes.data.blog;
          // * User bio
          const bio = mainRes.data.bio;
          // * Number of public repositories
          const repoNames = repoRes.data.map(function(repo) {
            return repo.name;
          });
          const repoNameCount = repoNames.length;

          // * Number of followers
          const followersId = followersRes.data.map(function(followers) {
            return followers.id;
          });
          const followersCount = followersId.length;

          // * Number of GitHub stars
          // * Number of users following
          const followingId = followingRes.data.map(function(following) {
            return following.id;
          });
          const followingCount = followingId.length;

          return (htmlStr = `
<!DOCTYPE html>
<html lang="en">
<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
</head>
<body>
      <div>${repoNameCount}</div>
</body>
</html>
`);
        })
      )
      .then(htmlStr => {
        fs.writeFile("index.html", htmlStr, () => {});
      })
      .then(() => {
        /* read the file from filesystem */
        /* convert to pdf */
        const run = async () => {
          const html5ToPDF = new HTML5ToPDF({
            inputPath: path.join(__dirname, "index.html"),
            outputPath: path.join(__dirname, "great.pdf"),
            options: { printBackground: true }
          });
          await html5ToPDF.start();
          await html5ToPDF.build();
          await html5ToPDF.close();
          console.log("DONE");
          process.exit(0);
        };
        return run();
      });
  });
