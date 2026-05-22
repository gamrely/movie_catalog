const API_KEY = "http://www.omdbapi.com/?i=tt3896198&apikey=3e1a4b89";

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