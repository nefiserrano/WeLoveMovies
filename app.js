const API_KEY = 'OMDB_API_KEY_PLACEHOLDER';

let myMoviesDataset = [];

function renderMovies() {
    const toWatchContainer = document.getElementById('to-watch-container');
    const watchedContainer = document.getElementById('watched-container');

    toWatchContainer.innerHTML = '';
    watchedContainer.innerHTML = '';

    myMoviesDataset.forEach(movie => {
        const movieCardHTML = `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${movie.poster}" alt="${movie.title} Poster">
                <div>
                    <h3>${movie.title} (${movie.year})</h3>
                    <span>${movie.genre}</span>
                    ${movie.status === 'Watched' ? `<div>My Rating: ⭐ ${movie.rating}/10</div>` : `<p>${movie.plot}</p>`}
                    <div>
                        <button onclick="toggleStatus('${movie.id}')">
                            ${movie.status === 'To Watch' ? 'Mark as Watched' : 'Watch Again'}
                        </button>
                        <button onclick="deleteMovie('${movie.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;

        if (movie.status === "To Watch") {
            toWatchContainer.insertAdjacentHTML('beforeend', movieCardHTML);
        } else if (movie.status === "Watched") {
            watchedContainer.insertAdjacentHTML('beforeend', movieCardHTML);
        }
    });
}

async function fetchMovieFromOMDb() {
    const titleInput = document.getElementById('movie-title').value.trim();
    
    if (!titleInput) {
        alert("Please enter a movie title first!");
        return;
    }

    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(titleInput)}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "False") {
            alert(`Movie not found: ${data.Error}`);
            return;
        }

        document.getElementById('movie-year').value = data.Year || '';
        document.getElementById('movie-notes').value = data.Plot || '';
        
        const primaryGenre = data.Genre ? data.Genre.split(',')[0].trim() : '';
        const genreDropdown = document.getElementById('movie-genre');
        if ([...genreDropdown.options].some(opt => opt.value === primaryGenre)) {
            genreDropdown.value = primaryGenre;
        }

        document.getElementById('omdb-fetch-btn').dataset.apiPoster = data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/150x220?text=No+Poster';
        document.getElementById('omdb-fetch-btn').dataset.apiPlot = data.Plot || 'No plot description available.';

        alert(`Found "${data.Title}"! Form pre-filled.`);

    } catch (error) {
        console.error("Error fetching data from OMDb:", error);
        alert("Failed to connect to the movie database. Please check your internet connection.");
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    const fetchBtn = document.getElementById('omdb-fetch-btn');

    const newMovie = {
        id: 'movie-' + Date.now(),
        title: document.getElementById('movie-title').value,
        year: document.getElementById('movie-year').value,
        genre: document.getElementById('movie-genre').value,
        status: document.getElementById('movie-status').value,
        rating: document.getElementById('movie-rating').value || null,
        plot: fetchBtn.dataset.apiPlot || document.getElementById('movie-notes').value,
        poster: fetchBtn.dataset.apiPoster || 'https://via.placeholder.com/150x220?text=Custom+Movie'
    };

    myMoviesDataset.push(newMovie);
    renderMovies();
    
    event.target.reset();
    delete fetchBtn.dataset.apiPlot;
    delete fetchBtn.dataset.apiPoster;
}

function deleteMovie(id) {
    myMoviesDataset = myMoviesDataset.filter(movie => movie.id !== id);
    renderMovies();
}

function toggleStatus(id) {
    myMoviesDataset = myMoviesDataset.map(movie => {
        if (movie.id === id) {
            movie.status = movie.status === 'To Watch' ? 'Watched' : 'To Watch';
        }
        return movie;
    });
    renderMovies();
}

document.getElementById('omdb-fetch-btn').addEventListener('click', fetchMovieFromOMDb);
document.getElementById('movie-form').addEventListener('submit', handleFormSubmit);