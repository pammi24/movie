
const APIURL = "https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2014-09-15&primary_release_date.lte=2014-10-22&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const search_res = document.getElementById("search_res");
const total_records = document.getElementById("total_records");
const watchlistBtn = document.getElementById("watchlist");

// Initially get movies
getMovies(APIURL);

async function getMovies(url) {
    try {
        const resp = await fetch(url);
        const respData = await resp.json();

        if (respData.results.length === 0) {
            search_res.innerHTML = "No Results Found";
            total_records.innerHTML = '';
        } else {
            total_records.innerHTML = "Total Records: " + respData.total_results;
        }

        showMovies(respData.results);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

function showMovies(movies) {
    main.innerHTML = "";
    movies.forEach((movie) => {
        const { title, vote_average, poster_path, id } = movie;
        
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        let poster_path_url = poster_path ? IMGPATH + poster_path : 'https://www.peakndt.com/wp-content/uploads/2017/02/No_picture_available.png';

        movieEl.innerHTML = `
            <img src="${poster_path_url}" alt="${title}" />
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average}</span>
            </div>
            <div class="movie-details">
                <button class="add-watchlist" data-id="${id}">Add to Watchlist</button>
            </div>
        `;

        const watchlistButton = movieEl.querySelector('.add-watchlist');
        watchlistButton.addEventListener('click', () => {
            const isAdded = checkIfInWatchlist(id);
            if (isAdded) {
                removeFromWatchlist(movie);
            } else {
                addToWatchlist(movie);
            }
        });

        main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return "green";
    } else if (vote >= 5) {
        return "orange";
    } else {
        return "red";
    }
}

function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.some(watchedMovie => watchedMovie.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${movie.title} added to Watchlist!`);
        updateWatchlistButton(movie.id, true);
    } else {
        alert(`${movie.title} is already in your Watchlist.`);
    }
}

function removeFromWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(watchedMovie => watchedMovie.id !== movie.id);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert(`${movie.title} removed from Watchlist!`);
    updateWatchlistButton(movie.id, false);
}

function checkIfInWatchlist(id) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    return watchlist.some(movie => movie.id === id);
}

function updateWatchlistButton(id, isAdded) {
    const button = document.querySelector(`.add-watchlist[data-id="${id}"]`);
    if (button) {
        button.textContent = isAdded ? 'Remove from Watchlist' : 'Add to Watchlist';
        button.removeEventListener('click', isAdded ? () => removeFromWatchlist({ id }) : () => addToWatchlist({ id }));
        button.addEventListener('click', isAdded ? () => removeFromWatchlist({ id }) : () => addToWatchlist({ id }));
    }
}

function showWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    main.innerHTML = '';
    if (watchlist.length > 0) {
        watchlist.forEach((movie) => {
            const { title, vote_average, poster_path, release_date } = movie;

            const movieEl = document.createElement("div");
            movieEl.classList.add("movie");

            let poster_path_url = poster_path ? IMGPATH + poster_path : 'https://www.peakndt.com/wp-content/uploads/2017/02/No_picture_available.png';

            movieEl.innerHTML = `
                <img src="${poster_path_url}" alt="${title}" />
                <div class="movie-info">
                    <h3>${title}</h3>
                    <span class="${getClassByRate(vote_average)}">${vote_average}</span>
                </div>
                <div class="movie-details">
                    <p>Release Date: ${release_date}</p>
                </div>
            `;

            // movieEl.innerHTML = `
    // <img src="${poster_path_url}" alt="${title}" />
    // <div class="movie-info">
        // <h3>${title}</h3>
        // <span class="${getClassByRate(vote_average)}">${vote_average}</span>
    // </div>
    // <div class="movie-details">
        // <p>Release Date: ${release_date}</p>
        // <p>Star Cast: ${star_cast}</p>
        // <p>Description: ${description}</p>
    // </div>
// `;
            main.appendChild(movieEl);
        });
    } else {
        main.innerHTML = "<p>No movies in your watchlist</p>";
    }
}

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHAPI + searchTerm);
        search_res.innerHTML = "Search Results for " + searchTerm;
    } else {
        getMovies(APIURL);
    }
});

watchlistBtn.addEventListener("click", showWatchlist);
