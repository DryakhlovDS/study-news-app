function customHttp() {
  return {
    get(url, callback) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            callback(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          callback(null, response);
        });

        xhr.addEventListener('error', () => {
          callback(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        callback(error);
      }
    },
    post(url, body, headers, callback) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            callback(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          callback(null, response);
        });

        xhr.addEventListener('error', () => {
          callback(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        callback(error);
      }
    },
  };
}

function loadNews(country, category, query) {
  showLoader();

  if (!query) {
    searchNews(country, category);
    return;
  } else {
    searchQueryNews(query);
  }

}

function searchNews(country, category) {
  newsService.topHeadlines(country, category, onGetResponse);
}

function searchQueryNews(query) {
  newsService.everything(query, onGetResponse);
}

function onGetResponse(err, res) {
  const loader = document.querySelector('#loader');
  deleteElement(loader);

  if (err) {
    console.log(err);
    showAlert(err);
    //show message
    return;
  }

  if (!res.articles.length) {
    //show mess
    showAlert(`По Вашему запросу нет статей!`);
    return;
  }

  renderNews(res);

}

const http = customHttp();
const news = document.querySelector('.news__inner');
const btnSearch = document.querySelector('.btn-search');
const formSearch = document.forms.search;
const selectCountry = formSearch.elements['country'];
const selectCategory = formSearch.elements['category'];
const inputQuery = formSearch.elements['query'];

let country = selectCountry.value;
let category = selectCategory.value;
let query = inputQuery.value;

const newsService = (function () {
  const apiKey = 'f5ab96fb96034287a0e7cada92b67e1d';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ru', category = 'technology', callb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, callb);
    },
    everything(q, callb) {
      http.get(`${apiUrl}/everything?q=${q}&language=ru&apiKey=${apiKey}`, callb);
    }
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  loadNews();
});

btnSearch.addEventListener('click', (e) => {
  e.preventDefault();

  country = selectCountry.value;
  category = selectCategory.value;
  query = inputQuery.value;

  loadNews(country, category, query);
  inputQuery.value = '';
})

//UI functions
function renderNews({
  articles
}) {
  let fragment = '';

  articles.forEach(article => {
    const card = creatCard(article);
    fragment += card;
  });

  clearContainer(news);
  news.insertAdjacentHTML('afterbegin', fragment);
  //load stop indication

}

function creatCard(object) {
  return `
  <div class="card col-5 mb-5 shadow-sm">
    <div class="card-img-top position-relative">
      <img src="${object.urlToImage || 'https://bentizol.ru/assets/file-storage/images/blog-1_0.jpg'}" class="card-img-top" alt="image">
      <div class="card-img-overlay text-light bg-dark">
        <h5 class="card-title">${object.title || ''}</h5>
      </div>
    </div>
    <div class="card-body">
      <p class="card-text">${object.description || ''}</p>
      <a href="${object.url}" class="card-link" target="_blank">Read more</a>
    </div>
  </div>
  `
}

function clearContainer(element) {
  element.innerHTML = '';
}

function showAlert(err) {
  const main = document.querySelector('main');
  const alert = creatModuleAlert(err);

  main.insertAdjacentHTML('afterbegin', alert);
  const myModal = document.getElementById('staticBackdrop');
  const newModal = new bootstrap.Modal(myModal);

  myModal.addEventListener('hidden.bs.modal', function (event) {
    deleteElement(myModal);
  })

  newModal.show();

}

function creatModuleAlert(text) {
  return `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" tabindex="-1"
      aria-labelledby="staticBackdrop" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Error!</h5>
          </div>
          <div class="modal-body">
            ${text}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
`
}

function showLoader() {
  const loader = creatLoader();
  const sectionSearch = document.querySelector('.search');
  sectionSearch.insertAdjacentHTML('afterend', loader);
}

function creatLoader() {
  return `
    <div class="position-absolute bg-dark" id="loader">
      <div class="spinner-border  text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `
}

function deleteElement(el) {
  el.remove();
}