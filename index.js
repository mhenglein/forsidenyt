const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const ejs = require("ejs");
const util = require(__dirname + "/util.js");
const moment = require("moment");
moment.locale("da");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));

const minuteInterval = 15;
const interval = minuteInterval * 60 * 1000;

// setInterval(function () {
//   updateTable();
// }, interval);

app.get("/", (req, res) => {
  headlinesPol = scrapePolitiken();
  headlinesJP = scrapeJylland();

  let finalList = [];
  headlinesPol.then((pol) => {
    finalList = finalList.concat(pol);

    headlinesJP.then((jp) => {
      finalList = finalList.concat(jp);
      finalList = createHtmlList(finalList);
      res.render("app", { list: finalList });
    });
  });
});

app.listen(4000, () => {
  console.log("Now listening on port 4000...");
});

const k = 3;
const momentFormat = "DD-MMM-YY HH:mm";

function createHtmlList(data) {
  let listItems = "";
  for (el of data) {
    if (el.text !== "" && el.text !== null) {
      listItems = `${listItems}
      <a 
      class="list-group-item list-group-item-action" 
      data-toggle="popover"
      tabindex="0"
      data-content="<img src='${el.image}' width=200px/>"
      href=${el.link}
      >
      <img class="paper-logo img-thumbnail" src="assets/${el.paper}.png" />
      ${el.text} <em>(${el.date})</em><br/><small>${el.id}</small></a>`;
    }
  }

  return `${listItems}`;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

async function scrapePolitiken() {
  const pol = "https://politiken.dk";
  let listData = [];
  try {
    // Load the website & the data into Cheerio
    let url = await axios.get(pol);
    let $ = cheerio.load(url.data);

    // Loop through all headlines (<=k)
    $("h2.headline").each((i, elem) => {
      if (i <= k) {
        let articleLink = $(elem).find("a").attr("href");
        if (articleLink !== undefined) {
          let articleHeadline = $(elem).find("a").text();
          if (articleHeadline !== undefined) {
            articleHeadline = articleHeadline.trim();
          }
          let articleID = util.getIdFromUrl(articleLink, "pol");

          // Push part of the data into the listData array
          listData[i] = {
            text: articleHeadline,
            link: articleLink,
            image: "",
            id: articleID,
            date: "",
            paper: "Politiken",
          };
        }
      }
    });

    // Remove empty items from the array
    listData = listData.filter(function (el) {
      return el;
    });

    // Loop through each of the links in the listData array to get more data on each headline
    for (let i = 0; i <= k; i++) {
      if (listData[i] !== undefined) {
        let urlLink = listData[i].link;
        try {
          if (urlLink !== undefined) {
            url = await axios.get(urlLink);
            $ = cheerio.load(url.data);
            let articleDate = $(".article__stamps--articletop").find("span.article__timestamp").text();

            if (articleDate === "" || articleDate === null) {
              articleDate = $(".super-element__timestamp").text();
            }

            if (articleDate !== undefined && articleDate !== null) {
              articleDate = util.formatDate(articleDate.trim());
              articleDate = moment(articleDate).format(momentFormat);
            } else {
              articleDate = "ukendt";
            }
            let articleImage;
            articleImage =
              $("figure.media--landscape").find("img").attr("srcset") ||
              $("figure.media--portrait").find("img").attr("srcset") ||
              $("figure.media--landscape--wide").find("img").attr("srcset") ||
              $("body").find("div.vjs-poster").attr("style") ||
              $("body").find("img").attr("srcset") ||
              $("body").find("img").attr("src");

            articleImage =
              articleImage !== undefined && articleImage !== null
                ? util.getImgUrlFromString(articleImage.trim())
                : articleImage;

            listData[i].image = articleImage;
            listData[i].date = articleDate;
          } else {
            url = "not available";
          }
        } catch (err) {
          console.log("Error occured: " + err);
        }
      }
    }
  } catch (err) {
    console.log("An error occured:" + err);
  }
  return listData;
}

async function scrapeJylland() {
  const jp = "https://jyllands-posten.dk";
  let listData = [];
  try {
    // Load the website & the data into Cheerio
    let url = await axios.get(jp);
    let $ = cheerio.load(url.data);

    // Loop through all headlines (<=k)
    $("h2.artTitle").each((i, elem) => {
      if (i <= k) {
        let articleLink = $(elem).find("a").attr("href");

        if (articleLink !== undefined) {
          let articleHeadline = $(elem).find("a").text();

          if (articleHeadline !== undefined) {
            articleHeadline = articleHeadline.trim();
          } else {
            articleHeadline = "";
          }
          let articleID = util.getIdFromUrl(articleLink, "jp");
          if (articleID === undefined) {
            articleID = "";
          }

          // Push part of the data into the listData array
          listData[i] = {
            text: articleHeadline,
            link: articleLink,
            image: "",
            id: articleID,
            date: "",
            paper: "Jyllands-Posten",
          };
        }
      }
    });

    // Remove empty items from the array
    listData = listData.filter(function (el) {
      if (el !== null) {
        return el;
      }
    });
    // Loop through each of the links in the listData array to get more data on each headline
    for (let i = 0; i <= k; i++) {
      if (listData[i] !== undefined) {
        let urlLink = listData[i].link;
        try {
          if (urlLink !== undefined) {
            url = await axios.get(urlLink);

            $ = cheerio.load(url.data);
            console.log($.html());
            let articleDate = $("div.artView__top__info__data").children("time").html();

            // if (articleDate !== undefined && articleDate !== null) {
            //   articleDate = util.formatDate(articleDate.trim());
            //   articleDate = moment(articleDate).format(momentFormat);
            // } else {
            //   articleDate = "ukendt";
            // }
            let articleImage = "";
            // articleImage =
            //   $("figure.media--landscape").find("img").attr("srcset") ||
            //   $("figure.media--portrait").find("img").attr("srcset") ||
            //   $("figure.media--landscape--wide").find("img").attr("srcset") ||
            //   $("body").find("div.vjs-poster").attr("style") ||
            //   $("body").find("img").attr("srcset") ||
            //   $("body").find("img").attr("src");

            // articleImage =
            //   articleImage !== undefined && articleImage !== null
            //     ? util.getImgUrlFromString(articleImage.trim())
            //     : articleImage;

            listData[i].image = articleImage;
            listData[i].date = articleDate;
          } else {
            url = "not available";
          }
        } catch (err) {
          console.log("Error occured: " + err);
        }
      }
    }
  } catch (err) {
    console.log("An error occured:" + err);
  }
  return listData;
}

// Information
async function scrapeInfo() {
  const info = "https://www.information.dk";
  let listData = [];
  try {
    // Load the website & the data into Cheerio
    let url = await axios.get(info);
    let $ = cheerio.load(url.data);

    // Loop through all headlines (<=k)
    $("h3.node-title").each((i, elem) => {
      if (i <= k) {
        let articleLink = $(elem).find("a").attr("href");
        if (articleLink !== undefined) {
          let articleHeadline = $(elem).find("a").text();
          if (articleHeadline !== undefined) {
            articleHeadline = articleHeadline.trim();
          }
          let articleID = util.getIdFromUrl(articleLink, "info");

          // Push part of the data into the listData array
          listData[i] = {
            text: articleHeadline,
            link: articleLink,
            image: "",
            id: articleID,
            date: "",
            paper: "Information",
          };
        }
      }
    });

    // Remove empty items from the array
    listData = listData.filter(function (el) {
      return el;
    });

    // Loop through each of the links in the listData array to get more data on each headline
    for (let i = 0; i <= k; i++) {
      if (listData[i] !== undefined) {
        let urlLink = listData[i].link;
        try {
          if (urlLink !== undefined) {
            url = await axios.get(urlLink);
            $ = cheerio.load(url.data);
            // REPLACE
            let articleDate = $(".article__stamps--articletop").find("span.article__timestamp").text();

            if (articleDate === "" || articleDate === null) {
              // REPLACE
              articleDate = $(".super-element__timestamp").text();
              console.log(articleDate);
            }

            if (articleDate !== undefined && articleDate !== null) {
              articleDate = util.formatDate(articleDate.trim());
              articleDate = moment(articleDate).format(momentFormat);
            } else {
              articleDate = "ukendt";
            }
            let articleImage;

            // REPLACE
            articleImage =
              $("figure.media--landscape").find("img").attr("srcset") ||
              $("figure.media--portrait").find("img").attr("srcset") ||
              $("figure.media--landscape--wide").find("img").attr("srcset") ||
              $("body").find("div.vjs-poster").attr("style") ||
              $("body").find("img").attr("srcset") ||
              $("body").find("img").attr("src");

            articleImage =
              articleImage !== undefined && articleImage !== null
                ? util.getImgUrlFromString(articleImage.trim())
                : articleImage;

            listData[i].image = articleImage;
            listData[i].date = articleDate;
          } else {
            url = "not available";
          }
        } catch (err) {
          console.log("Error occured: " + err);
        }
      }
    }
  } catch (err) {
    console.log("An error occured:" + err);
  }
  return listData;
}

// Berlingske
async function scrapeBerl() {
  const berl = "https://www.berlingske.dk/";
  let listData = [];
  try {
    // Load the website & the data into Cheerio
    let url = await axios.get(info);
    let $ = cheerio.load(url.data);

    // Loop through all headlines (<=k)
    $("div.dre-item__text").each((i, elem) => {
      if (i <= k) {
        let articleLink = $(elem).find("a").attr("href");
        if (articleLink !== undefined) {
          let articleHeadline = $(elem).find("a").text();
          if (articleHeadline !== undefined) {
            articleHeadline = articleHeadline.trim();
          }
          let articleID = util.getIdFromUrl(articleLink, "berl");

          // Push part of the data into the listData array
          listData[i] = {
            text: articleHeadline,
            link: articleLink,
            image: "",
            id: articleID,
            date: "",
            paper: "Berlingske",
          };
        }
      }
    });

    // Remove empty items from the array
    listData = listData.filter(function (el) {
      return el;
    });

    // Loop through each of the links in the listData array to get more data on each headline
    for (let i = 0; i <= k; i++) {
      if (listData[i] !== undefined) {
        let urlLink = listData[i].link;
        try {
          if (urlLink !== undefined) {
            url = await axios.get(urlLink);
            $ = cheerio.load(url.data);
            // REPLACE
            let articleDate = $(".article__stamps--articletop").find("span.article__timestamp").text();

            if (articleDate === "" || articleDate === null) {
              // REPLACE
              articleDate = $(".super-element__timestamp").text();
              console.log(articleDate);
            }

            if (articleDate !== undefined && articleDate !== null) {
              articleDate = util.formatDate(articleDate.trim());
              articleDate = moment(articleDate).format(momentFormat);
            } else {
              articleDate = "ukendt";
            }
            let articleImage;

            // REPLACE
            articleImage =
              $("figure.media--landscape").find("img").attr("srcset") ||
              $("figure.media--portrait").find("img").attr("srcset") ||
              $("figure.media--landscape--wide").find("img").attr("srcset") ||
              $("body").find("div.vjs-poster").attr("style") ||
              $("body").find("img").attr("srcset") ||
              $("body").find("img").attr("src");

            articleImage =
              articleImage !== undefined && articleImage !== null
                ? util.getImgUrlFromString(articleImage.trim())
                : articleImage;

            listData[i].image = articleImage;
            listData[i].date = articleDate;
          } else {
            url = "not available";
          }
        } catch (err) {
          console.log("Error occured: " + err);
        }
      }
    }
  } catch (err) {
    console.log("An error occured:" + err);
  }
  return listData;
}

// // Loop through each of the links in the listData array to get more data on each headline
// for (let i = 0; i <= k; i++) {
//   if (listData[i] !== undefined) {
//     let urlLink = listData[i].link;
//     try {
//       if (urlLink !== undefined) {
//         url = await axios.get(urlLink);
//         $ = cheerio.load(url.data);
//         let articleDate = $(".article__stamps--articletop").find("span.article__timestamp").text();

//         if (articleDate === "" || articleDate === null) {
//           articleDate = $(".super-element__timestamp").text();
//           console.log(articleDate);
//         }

//         if (articleDate !== undefined && articleDate !== null) {
//           articleDate = util.formatDate(articleDate.trim());
//           articleDate = moment(articleDate).format(momentFormat);
//         } else {
//           articleDate = "ukendt";
//         }
//         let articleImage;
//         articleImage =
//           $("figure.media--landscape").find("img").attr("srcset") ||
//           $("figure.media--portrait").find("img").attr("srcset") ||
//           $("figure.media--landscape--wide").find("img").attr("srcset") ||
//           $("body").find("div.vjs-poster").attr("style") ||
//           $("body").find("img").attr("srcset") ||
//           $("body").find("img").attr("src");

//         articleImage =
//           articleImage !== undefined && articleImage !== null
//             ? util.getImgUrlFromString(articleImage.trim())
//             : articleImage;

//         listData[i].image = articleImage;
//         listData[i].date = articleDate;
//       } else {
//         url = "not available";
//       }
//     } catch (err) {
//       console.log("Error occured: " + err);
//     }
//   }
// }
