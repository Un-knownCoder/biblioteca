
// 4 interfacce
//   - input per ISBN
//   - visualizzazione post input ISBN
//   - visualizzazione libro nella lista
//   - visualizzazione lettura in corso


// importo la libreria principale di jQuery
const $ = require("jquery");
const gui = require('nw.gui');

// imposta la dimensione fissa della finestra
let win = gui.Window.get();
win.setMaximumSize(1280, 720);
win.setMinimumSize(1280, 720);


// element serve per scrivere meno codice poi (chiama querySelector)
const element = (q) => document.querySelector(q);
const elements = (q) => document.querySelectorAll(q);

// Il libro che viene trovato tramite la funzione fetchBook()
let fetchedBook = {}

// apro una delle interfacce a scelta facendo apparire #bg
function openInterface(type) {
  let interfaces = ['#input', '#lettura', '#libro'];
  let interface = element(interfaces[type]);
  let bg = element('#bg');

  if (type == 1 && !amIReading()) {
    return;
  }
  
  bg.style.opacity = '1';
  bg.style.visibility = 'visible';
  interface.style.transform = 'translateX(0vw)';
}

// chiudo ogni interfaccia e faccio sparire il #bg
function closeInterfaces() {
  let bg = element('#bg');
  let isbn = element('#input');   // 1
  let lett = element('#lettura'); // 2
  let lib = element('#libro');    // 3
  let inputs = elements('input');

  bg.style.opacity = '0';
  bg.style.visibility = 'hidden';
  isbn.style.transform = 'translateX(-25vw)';
  lett.style.transform = 'translateX(-25vw)';
  lib.style.transform = 'translateX(-25vw)';

  for (let i of inputs) i.value = "";
}

// faccio apparire una scritta di errore appena sotto l'input dell'ISBN
function setError(string) {
  element("#input").classList.add("error");
  element(".hint").innerText = string;
}

// faccio scomparire la scritta di errore
function removeError() {
  element("#input").classList.remove("error");
  element(".hint").innerText = "Inserisci il codice ISBN del libro";
}

// funzione principale per la ricerca dei libri
function fetchBook() {
  let raw = element("#ISBN").value.toString();
  let converted = raw.replace(/-/g, '').replace(/ /g, '');

  if (raw === '') {
    setError("400: Non hai inserito nulla");
    return;
  }

  if (converted.length !== 10 && converted.length !== 13) {
    setError("401: Lunghezza codice non valida");
    return;
  }

  $.ajax({
    url: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + converted,
    dataType: "json",
    success: (list) => {
      if (list.totalItems == 0) {
        setError("404: Codice non trovato");
        return;
      }
      console.log(list.items[0].volumeInfo);
      
      let { title, subtitle, authors, pageCount, description, categories, industryIdentifiers, imageLinks } = list.items[0].volumeInfo;
      fetchedBook = {
        title: title,
        subtitle: !!subtitle ? subtitle : "...",
        author: !!authors ? authors[0] : '...',
        pages: !!pageCount ? pageCount : "?",
        desc: !!description ? description : "assente",
        cat: !!categories ? categories[0] : "...",
        isbn: industryIdentifiers[0].identifier,
        img: !!imageLinks ? imageLinks.thumbnail : ""
      }
      displayFetchedBook();
    },
    error: (e) => { setError("404: Libro non trovato") }
  });
}

function displayFetchedBook() {
  let book = fetchedBook;
  element('#titLib').innerText = book.title;
  element('#stLib').innerText = book.subtitle;
  element('#autLib').innerText = book.author;
  element('#pagLib').innerText = book.pages;
  element('#dsLib').innerText = book.desc;
  element('#imgLib').src = book.img

  let actions = element('.alib');
  let button = element('#btnLib');

  actions.style.opacity = '1';
  actions.style.visibility = 'visible';
  button.innerText = "Aggiungi";
  button.onclick = () => {aggiungiLibroCloud(book);};
  openInterface(2)
}


// funzione per eseguilre l'accesso alla piattaforma
function tryLogin() {
  let user = element('#user-name').value.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
  let pass = element('#user-pass').value;
  if (!user || !pass) {
    removeLogError();
    setLogError(!user, !pass);
  } else {
    login(user, pass);
  }

}