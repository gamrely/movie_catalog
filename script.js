const API_KEY = "3e1a4b89";

async function searchMovies() {
    let query = document.getElementById("searchInput").value;
    let results = document.getElementById("results");

    if (query === "") {
        alert("Введіть назву фільму для пошуку!");
        return;
    }

    results.innerHTML = "<p class='loading'>Завантаження...</p>";

    try {
       let url = "https://www.omdbapi.com/?apikey=" + API_KEY + "&s=" + encodeURIComponent(query);
       let response = await fetch(url);
       let data = await response.json();

       if (data.Response === "False") {
        results.innerHTML = "<p class='empty'>Фільми не знайдено</p>";
        return;
         }

         showResults(data.Search.slice(0, 6));
    } catch (error) {
        results.innerHTML = "<p class='empty'>Помилка завантаження даних</p>";
    }
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
           <button class="save-btn" onclick="addToCatalog()('${escapetext(title)}', '${year}', '${type}', '${poster}')">
           Додати в каталог
           </button>
           </div>
           </div>
        `;

    }
    

}

