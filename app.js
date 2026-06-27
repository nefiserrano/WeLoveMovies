// SECURE KEY SETUP: Checks your browser's localStorage first. If it's not there, it safely falls back to your teammate's GitHub placeholder.
const API_KEY = localStorage.getItem('omdb_api_key') || 'OMDB_API_KEY_PLACEHOLDER';

let myMoviesDataset = [];

function renderMovies() {
    const toWatchContainer = document.getElementById('to-watch-container');
    const watchedContainer = document.getElementById('watched-container');

    toWatchContainer.innerHTML = '';
    watchedContainer.innerHTML = '';

    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedGenre = document.getElementById('filter-genre').value;
    const sortBy = document.getElementById('sort-by').value;

    let filteredMovies = myMoviesDataset.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery);
        const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    filteredMovies.sort((a, b) => {
        if (sortBy === 'year') {
            return parseInt(b.year) - parseInt(a.year);
        } else if (sortBy === 'rating') {
            return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        } else {
            return a.title.localeCompare(b.title);
        }
    });

    filteredMovies.forEach(movie => {
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
    
    localStorage.setItem('myMoviesDataset', JSON.stringify(myMoviesDataset));
    
    renderMovies();
    
    event.target.reset();
    delete fetchBtn.dataset.apiPlot;
    delete fetchBtn.dataset.apiPoster;
}

function deleteMovie(id) {
    myMoviesDataset = myMoviesDataset.filter(movie => movie.id !== id);
    
    localStorage.setItem('myMoviesDataset', JSON.stringify(myMoviesDataset));
    
    renderMovies();
}

function toggleStatus(id) {
    myMoviesDataset = myMoviesDataset.map(movie => {
        if (movie.id === id) {
            movie.status = movie.status === 'To Watch' ? 'Watched' : 'To Watch';
        }
        return movie;
    });

    localStorage.setItem('myMoviesDataset', JSON.stringify(myMoviesDataset));
    
    renderMovies();
}

function updateURLParameters() {
    const search = document.getElementById('search-input').value.trim();
    const genre = document.getElementById('filter-genre').value;
    const sort = document.getElementById('sort-by').value;

    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (genre !== 'all') params.set('genre', genre);
    if (sort !== 'title') params.set('sort', sort);

    const newQueryString = params.toString() ? '?' + params.toString() : window.location.pathname;
    
    window.history.replaceState({}, '', newQueryString);
}

function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('search')) {
        document.getElementById('search-input').value = params.get('search');
    }
    if (params.has('genre')) {
        document.getElementById('filter-genre').value = params.get('genre');
    }
    if (params.has('sort')) {
        document.getElementById('sort-by').value = params.get('sort');
    }
}

document.getElementById('search-input').addEventListener('input', () => { updateURLParameters(); renderMovies(); });
document.getElementById('filter-genre').addEventListener('change', () => { updateURLParameters(); renderMovies(); });
document.getElementById('sort-by').addEventListener('change', () => { updateURLParameters(); renderMovies(); });

document.getElementById('omdb-fetch-btn').addEventListener('click', fetchMovieFromOMDb);
document.getElementById('movie-form').addEventListener('submit', handleFormSubmit);

window.addEventListener('DOMContentLoaded', () => {
    const savedMovies = localStorage.getItem('myMoviesDataset');
    if (savedMovies) {
        myMoviesDataset = JSON.parse(savedMovies);
    }

    loadFiltersFromURL();
    
    renderMovies();
});
