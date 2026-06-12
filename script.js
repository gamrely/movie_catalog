const API_KEY = "3e1a4b89";

let searchCache = {};
let cacheKeys = [];
const CACHE_LIMIT = 5;

function getCurrentTime() {
    return new Date().toLocaleString();
}

function log(level, message, data = "") {
    let time = getCurrentTime();

    if (level === "ERROR") {
        console.error(`[${level}] ${time} ${message}`, data);
    } else {
        console.log(`[${level}] ${time} ${message}`, data);
    }
}

function logFunction(level, functionName, func) {
    return async function(...args) {
    log(level, "Виклик функції: " + functionName, args);

     try {
      let result = await func(...args);

        log(level, "Результат функції: " + functionName, result);

        return result;
      } catch (error) {
        log("ERROR", "Помилка у функції: " + functionName, error.message);
        throw error;
        }
    };
}

function getCurrentTime() {
    return new Date().toLocaleString();
}

function logInfo(message) {
    console.log("[INFO]", getCurrentTime(), message);
}

function logError(message) {
    console.error("[ERROR]", getCurrentTime(), message);
}

async function searchMovies() {
    let query = document.getElementById("searchInput").value;
    let results = document.getElementById("results");

    if (query === "") {
        alert("Введіть назву фільму для пошуку!");
        return;

    }

    logInfo("Почато пошук фільму: " + query);

    results.innerHTML = "<p class='loading'>Завантаження...</p>";


try {
    let movies = await getMoviesWithCache(query);

    if (movies.length === 0) {
        results.innerHTML = "<p class='empty'>Фільми не знайдено</p>";
        return;
    }

    showResults(movies);
} catch (error) {
    results.innerHTML = "<p class='empty'>Помилка завантаження даних</p>";
    logError("Помилка під час пошуку фільму");
}
}

async function getMoviesWithCache(query) {
    let key = query.toLowerCase().trim();

    if (searchCache[key]) {
        logInfo("Дані отримані з кешу: " + key);
        return searchCache[key];
    }

    logInfo("Завантаження даних з API: " + key);

    let url = "https://www.omdbapi.com/?apikey=" + API_KEY + "&s=" + encodeURIComponent(query);
    let response = await fetch(url);

    if (!response.ok) {
        logError("Помилка API. Код відповіді: " + response.status);
        throw new Error("API error");
    }

    let data = await response.json();

    if (data.Response === "False") {
        return [];
    }

    let movies = data.Search.slice(0, 6);

    if (cacheKeys.length >= CACHE_LIMIT) {
        let oldKey = cacheKeys.shift();
        delete searchCache[oldKey];
        logInfo("Видалено старий елемент кешу: " + oldKey);
    }

    searchCache[key] = movies;
    cacheKeys.push(key);

    return movies;
}



function showResults(movies) {
    let results = document.getElementById("results");
    results.innerHTML = "";

        for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];

        let title = movie.Title || "Невідома назва";
        let year = movie.Year || "Невідомо";
        let type = movie.Type || "Невідомо";
        let poster = movie.Poster !== "N/A" 
        ? movie.Poster
        : "https://via.placeholder.com/85x125?text=No+Poster";

        results.innerHTML += `
          <div class="movie">
          <img src="${poster}" alt="Постер фільму">
          <div class="movie-info">
           <h3>${title}</h3>
           <p><b>Рік:</b> ${year}</p>
           <p><b>Тип:</b> ${type}</p>
           <button class="save-btn" onclick="addToCatalog('${escapeText(title)}', '${year}', '${type}', '${poster}')">
           Додати в каталог
           </button>
           </div>
           </div>
        `;

    }
    

}

let savedMovies = [];

window.onload = function() {
    let data = localStorage.getItem("myMovieCatalog");

    if (data) {
        savedMovies = JSON.parse(data);
    }

    showMyCatalog();
};

function addToCatalog(title, year, type, poster) {
    let movie = {
        title: title,
        year: year,
        type: type,
        poster: poster
    };

    savedMovies.push(movie);
    logInfo("Фільм додано в каталог: " + title);
    saveCatalog();
    showMyCatalog();
    
}

function showMyCatalog() {
    let myCatalog = document.getElementById("myCatalog");
    myCatalog.innerHTML = "";

    if (savedMovies.length === 0) {
        myCatalog.innerHTML = "<p class='empty'>У каталозі поки що немає фільмів</p>";
        return;
    }
    for (let i = 0; i < savedMovies.length; i++)    {
        let movie = savedMovies[i];

        myCatalog.innerHTML += `
         <div class="movie">
          <img src="${movie.poster}" alt="Постер фільму">
          <div class="movie-info">
           <h3>${movie.title}</h3>
           <p><b>Рік:</b> ${movie.year}</p>
           <p><b>Тип:</b> ${movie.type}</p>
           <button class="remove-btn" onclick="deleteFromCatalog(${i})">Видалити</button>
           </div>
        </div>
    `;
    }


}

function deleteFromCatalog(index) {
    let movieTitle = savedMovies[index].title;
    savedMovies.splice(index, 1);
    logInfo("Фільм видалено з каталогу: " + movieTitle);
    saveCatalog();
    showMyCatalog();
}

function saveCatalog() {
    localStorage.setItem("myMovieCatalog", JSON.stringify(savedMovies));
    logInfo("Каталог збережено в localStorage");
}

function escapeText(text) {
    return String(text).replace(/'/g, "\\'");
}

searchMovies = logFunction("INFO", "searchMovies", searchMovies);
getMoviesWithCache = logFunction("DEBUG", "getMoviesWithCache", getMoviesWithCache);