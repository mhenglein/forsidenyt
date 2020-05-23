module.exports.getIdFromUrl = (inputURL, paper) => {
  let rex;
  // JP == 8
  // POL = 7
  switch (paper) {
    case "info":
      return "";
    case "berl":
      return "";
    default:
      rex = /\d{7,8}/;
  }

  if (inputURL !== undefined) {
    let articleID = rex.exec(inputURL);

    if (articleID !== null && articleID !== undefined) {
      return articleID[0];
    } else {
      console.log("ArticleID returned null");
      return "";
    }
  }
};

module.exports.formatDate = (inputDate) => {
  if (inputDate !== undefined) {
    //inputDate: 11. MAJ 2020 KL. 20.19 (POL)
    //inputDate: 15.05.2020 kl. 18:50 (JP)

    console.log(inputDate);

    let rexTest, year, month, day, time;

    // Year == 4 digits
    year = /\b[0-9]{4}\b/.exec(inputDate)[0];

    // Month
    rexTest = /\b[A-Za-z]{3}\b/.test(inputDate);
    if (rexTest) {
      month = /\b[A-Za-z]{3}\b/.exec(inputDate)[0];
      month = getMonthNo(month);
    } else {
      month = /\.[0-9]{2}\./.exec(inputDate)[0];
      month = month.replace(/\./g, "");
    }

    // Day
    day = /^[0-9]{2}/.exec(inputDate)[0];

    // Time
    time = /([0-9]{2}(\.|\:)[0-9]{2})$\b/.exec(inputDate)[0];
    time = time.replace(".", ":");

    let dateString = String(year + "-" + month + "-" + day + "-" + time);

    return new Date(dateString);
  } else {
    return "ukendt dato";
  }
};

function getMonthNo(inputMonth) {
  switch (inputMonth.toLowerCase()) {
    case "jan":
      return 1;

    case "feb":
      return 2;

    case "mar":
      return 3;

    case "apr":
      return 4;

    case "maj":
      return 5;

    case "jun":
      return 6;

    case "jul":
      return 7;

    case "aug":
      return 8;

    case "sep":
      return 9;

    case "okt":
      return 10;

    case "nov":
      return 11;

    case "dec":
      return 12;
    default:
      console.log("Month name not captured in getMonthNo function");
  }
}

module.exports.getImgUrlFromString = (inputString) => {
  let searchString = /background-image/;
  let rexTest = searchString.test(inputString);

  if (rexTest) {
    let returnString = inputString.replace("background-image: url(", "").replace(");)", "");
    return returnString;
  } else {
    let snippets = inputString.split(" ");
    return snippets[0];
  }
};

module.exports.shuffleArray = (array) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};
