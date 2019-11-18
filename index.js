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
          const starCount = repoRes.data.reduce((acc, curr) => {
            acc += curr.stargazers_count;
            return acc;
          }, 0);

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
                <!-- Adding normalize css -->
              <link
                rel="stylesheet"
                href="https://necolas.github.io/normalize.css/8.0.1/normalize.css"
              />
              <!-- Adding bootstrap -->
              <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
              <!-- Adding FontAwesome -->
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
              <!-- Adding local CSS file -->
              <link rel="stylesheet" type="text/css" href="style.css" />
                <title>Document</title>
          </head>
          <body>
          <div class="container-fluid">
              <div class="row">
              <div class="col-2"></div>
                <div class="col-8 flexCenter">
                <img class="profileImg" src="${avatarUrl}">
                </div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
                <div class="col-8 flexCenter"><h1>Hi!</h1></div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
        <div class="col-8 flexCenter"><h1>My name is ${fullName}<h1></h1></div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
                <div class="col-8">
                  ${bio}
                  </div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
                <div class="col-8 flexSpaceEvenly">
                  <i class="fa fa-location-arrow">${location}</i>
                  <a href="${profileUrl}"><i class="fa fa-github-alt">GitHub</i></a>
                  <a href="http://${blogUrl}"><i class="fa fa-rss">Blog</i></a>
                </div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
                <div class="col-4 d-flex flex-column textCenter">
                  <div>Public Repositories</div>
                  <div>${repoNameCount}</div>
                </div>
                <div class="col-4 d-flex flex-column textCenter"><div>Followers</div><div>${followersCount}</div></div>
                <div class="col-2"></div>
              </div>
              <div class="row leadMargin10">
                <div class="col-2"></div>
                <div class="col-4 d-flex flex-column textCenter"><div>GitHub Stars</div><div>${starCount}</div></div>
                <div class="col-4 d-flex flex-column textCenter"><div>Following</div><div>${followingCount}</div></div>
                <div class="col-2"></div>
              </div>
          </div>
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
            inputPath: path.join(__dirname, "./index.html"),
            outputPath: path.join(__dirname, "./great.pdf"),
            include: [path.join(__dirname, "./style.css")],
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
