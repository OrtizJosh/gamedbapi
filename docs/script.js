// This will generate the dates needed to fit critera.
function appendZeroes(n) {
  if (n <= 9) {
    return '0' + n;
  }
  return n;
}

function generateDate() {
  let date = new Date();
  let present =
    date.getFullYear() +
    '-' +
    appendZeroes(date.getMonth() + 1) +
    '-' +
    appendZeroes(date.getDate());
  let postdate = new Date(new Date().setDate(date.getDate() + 1825));
  let future =
    postdate.getFullYear() +
    '-' +
    appendZeroes(postdate.getMonth() + 1) +
    '-' +
    appendZeroes(postdate.getDate());
  return `${present},${future}`;
}

console.log(generateDate());

// Parameters to filter results.
const params = {
  // Permanent Params
  // ordering: '-released',
  parent_platforms: '2,3,6,7',
  page_size: '10',
  // Adjustable Params
  dates: generateDate()
};

// Take params set from above and format them into workable URL to fetch data.
function formatParams(params) {
  const queryItems = Object.keys(params).map(key => `${key}=${params[key]}`);
  return queryItems.join('&');
}

// Per requirements of RAWG's API usage they want only a user-agent header.
const opts = {
  headers: {
    'User-Agent': '<ClassProject> / <VER 0.02> <Currently in Alpha testing>'
  }
};

// API will load page then based will continue to add a page as long as there is one to be generated.
let pageNum = 1;
// Halts multiple instances of infinite scroll to a controlled single page.
let loading = false;

// Using the page number and the formatted params generated above it will create a URL.
function generateURL(game) {
  const baseURL = 'https://api.rawg.io/api/games';
  if (game) {
    params.search = game;
  }
  const queryString = formatParams(params);
  const url = `${baseURL}?page=${pageNum}&${queryString}`;
  return url;
}

// With URL generated it will make a request based on the URL above and bring it into a workable JSON file.
function fetchGames(game) {
  fetch(generateURL(game), opts)
    .then(response => response.json())
    .then(responseJson => {
      mapResults(responseJson);
    })
    .catch(error => {
      alert(`Something went wrong: ${error.message}`);
    });
}

// The results from the fetch end up here to be mapped and changed in to a workable array list.
function mapResults(responseJson) {
  let gamedata;
  if (responseJson && responseJson.results) {
    gamedata = responseJson.results.map(game => ({
      // single item
      name: game.name,
      slug: game.slug,
      id: game.id,
      // multiple items
      platform: game.platforms,
      genre: game.genres,
      video: game.clip,
      date: game.released,
      detailsURL: `https://api.rawg.io/api/games/${game.id}`
    }));
    console.log(gamedata);
    inputData(gamedata);
  }
}

// Then that array list ends up here for client side visability.
function inputData(gamedata) {
  gamedata.forEach(input => {
    let formatDate = input.date;
    formatDate = formatDate.split('-').map(e => (e[0] == '0' ? e.slice(1) : e));
    formatDate = formatDate[1] + '/' + formatDate[2] + '/' + formatDate[0];
    let info = '';
    $('.web-list').append(`<li class = "game-card ${input.slug}-card"></li>`);
    info += '<div class= "game-border">';
    info += `<a href="#" class="url-name"><p class= "game-name" id="${input.id}" data-url="${input.detailsURL}">${input.name}</p></a>`;
    info += '<div class="game-space"></div>';
    if (input.video === null) {
      info += '<div class=no-clip>No clips here yet!</div>';
      info += '<div class="game-space"></div>';
      info += `<div class=released><span><b>Release Date</b>: ${formatDate}`;
      $(`#${input.slug}-card`).append(info);
      return undefined;
    }
    const result = Object.keys(input.video).map(key => [
      Number(key),
      input.video[key]
    ]);
    const videolink = result[1][1];
    info += ` <div class= "game-clip">
    <video width="220" height="124" controls>
      <source src=" ${videolink.full}" type="video/mp4">
    Your browser does not support the video tag.
    </video>
    </div>`;
    info += `<div class=released><span><b>Release Date</b>: ${formatDate}`;
    $(`.${input.slug}-card`).append(info);
  });
  loading = false;
  detailedModal();
  closeModal();
}

async function secondFetch(detailsURL) {
  let res;
  res = await fetch(detailsURL, opts)
    .then(detailedResponse => detailedResponse.json())
    .then(detailedResponseJson => {
      console.log(detailedResponseJson);
      return detailedResponseJson;
    })
    .catch(error => {
      alert(`Something went wrong: ${error.message}`);
    });
  return res;
}

function populateModal(data) {
  console.log(`${data.background_image}`);
  $('.modal-body').append(`Genres: `);
  let i;
  for (i = 0; i < data.genres.length; i++) {
    console.log(data.genres[i].name);
    $('.modal-body').append(`${data.genres[i].name} `);
  }
  $('.modal-body').append(`<br>Platforms: `);
  let ii;
  for (ii = 0; ii < data.platforms.length; ii++) {
    console.log(data.platforms[ii]);
    $('.modal-body').append(`${data.platforms[ii].platform.name} `);
  }
  let iii;
  for (iii = 0; iii < data.platforms.length; iii++) {
    console.log(data.platforms[iii]);
    $('.modal-body').append(`${data.platforms[iii].platform.name} `);
  }
  $('.detailed-modal').css(
    `background-image`,
    ` linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("${data.background_image}")`
  );
  $('.modal-title').append(`${data.name}`);
  $('.modal-body').append(`<br/><br/>${data.description}<br>`);
  $('.modal-footer').append(`
    `);
}

function detailedModal() {
  $('.game-name').click(async function() {
    const data = await secondFetch($(this).attr('data-url'));
    populateModal(data);
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
  });
}

function closeModal() {
  $('.close').click(() => {
    $('.modal-title').empty();
    $('.modal-body').empty();
    $('.modal-footer').empty();
    $('.modal').fadeOut();
    $('body').css(`overflow`, `auto`);
  });
}

function openNav() {
  $('.fa-bars').click(() => {
    $('.navList').width(`250px`);
    $('body').css(`overflow`, `hidden`);
  });
}

function closeNav() {
  $('.closebtn').click(() => {
    console.log('YAY IT WORKS');
    $('.modal-title').empty();
    $('.modal-body').empty();
    $('.modal-footer').empty();
    $('.navList').width(`0px`);
    $('body').css(`overflow`, `auto`);
  });
}

function aboutNav() {
  $('.aboutModal').click(() => {
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    $('.modal-title').append(`<h1>About The Next Game</h1>`);
    $('.modal-body').append(`
      <span>Welcome to my API based webpage! This website is to see upcoming game previews.
      <br>
      Q: How do I use this website?
      <br>
      A: Please see my Help page for additional information.
      <br>
      <br>
      Q: Who is the host of this database?
      <br>
      A: RAWG which can be <a href="https://api.rawg.io/docs/">located here.</a>
      <br>
      <br>
      Q: What language is this written in?
      <br>
      A: HTML5, CSS3, JavaScript using jQuery library.
      <br>
      <br>
      Q: Why is there no full video clips embeded?
      <br>
      A: This is actually a security measure placed by YouTube which only allows links to be used for the full video. Links can be found
      in the modal.
      <br>
      <br>
      Q: What inspired you to do this webpage?
      <br>
      A: Self-interest and futher my growth and knowledge of coding!
      <br>
      <br>
      API Legal Notice
      <br>
We do not claim ownership of any of the images or data provided by the API. 
We remove infringing content when properly notified. 
Any data and/or images one might upload to RAWG is expressly granted a license to use. 
You are prohibited from using the images and/or data in connection with libelous, defamatory, 
obscene, pornographic, abusive or otherwise offensive content.
      </span>`);
  });
}

function helpNav() {
  $('.helpModal').click(() => {
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    $('.modal-title').append(`<h1></h1>`);
    $('.modal-body').append();
  });
}

function contactNav() {
  $('.contactModal').click(() => {
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    $('.modal-body').append(`
    Feel free to click any of the icons seen here to reach out to me!
      <ul class='contactcontainer'>
        <li class='hoverover'>
          <a href='mailto:joshwortiz@gmail.com' target='_top'>
            <img src='images/email.png' class='contactinfo' alt='Email Icon' />
          E-Mail
            </a>
        </li>
        <li class='hoverover'>
          <a href='#' target='_blank'>
            <img
              src='images/webpage.png'
              class='contactinfo'
              alt='Website Icon'
            />
            Portfolio
          </a>
        </li>
        <li class='hoverover'>
          <a href='https://github.com/OrtizJosh' target='_blank'>
            <img
              src='images/github.png'
              class='contactinfo'
              alt='GitHub Icon'
            />
            Github
          </a>
        </li>
        <li class='hoverover'>
          <a
            href='https://www.linkedin.com/in/joshua-ortiz-188745184/'
            target='_blank'
          >
            <img
              src='images/linkedin.png'
              class='contactinfo'
              alt='LinkedIn Icon'
            />
            Linkedin
          </a>
        </li>
      </ul>
    `);
  });
}

// Check to ensure where the user is on the page. If they have reached  a point it will fetch more data from the next page.
function infiniteScroll() {
  $(window).scroll(function() {
    if ($(document).height() - $(this).height() - 600 < $(this).scrollTop()) {
      if (!loading) {
        pageNum++;
        loading = true;
        fetchGames();
      }
    }
  });
}

// On inital load of the document initalize the data fetch.
function pageLoad() {
  $(document).ready(() => {
    fetchGames();
  });
}

// The search tool will clear current data reset the page to 1 then fetch the data.
function pageLoadClick() {
  $('.search-games').submit(e => {
    e.preventDefault();
    if (params.search) {
      delete params.search;
    }
    const searchParam = $('.search-param').val();
    $('.web-list').empty();
    pageNum = 1;
    fetchGames(searchParam);
  });
}

// A function to tell the browser what to initalize.
function initializeListeners() {
  pageLoad();
  infiniteScroll();
  pageLoadClick();
  openNav();
  closeNav();
  aboutNav();
  helpNav();
  contactNav();
}

// Initalize the initalizer.
initializeListeners();
