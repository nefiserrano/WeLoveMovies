import { fetchMovieFromOMDb } from './api.js';
import { getSavedMovies, saveMovies } from './storage.js';
import { updateURLParameters, loadFiltersFromURL } from './urlParams.js';
const API_KEY = '51403b9a';

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
                        <button class="toggle-btn" data-id="${movie.id}">
                            ${movie.status === 'To Watch' ? 'Mark as Watched' : 'Watch Again'}
                        </button>
                        <button class="delete-btn" data-id="${movie.id}">Delete</button>
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

async function handleOMDbFetch() {
    const titleInput = document.getElementById('movie-title').value.trim();
    const data = await fetchMovieFromOMDb(titleInput);

    if (data) {
        document.getElementById('movie-year').value = data.Year || '';
        document.getElementById('movie-notes').value = data.Plot || '';
        
        const primaryGenre = data.Genre ? data.Genre.split(',')[0].trim() : '';
        const genreDropdown = document.getElementById('movie-genre');
        if ([...genreDropdown.options].some(opt => opt.value === primaryGenre)) {
            genreDropdown.value = primaryGenre;
        }

        const fetchBtn = document.getElementById('omdb-fetch-btn');
        fetchBtn.dataset.apiPoster = data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/150x220?text=No+Poster';
        fetchBtn.dataset.apiPlot = data.Plot || 'No plot description available.';

        alert(`Found "${data.Title}"! Form pre-filled.`);
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
    saveMovies(myMoviesDataset);
    renderMovies();
    
    event.target.reset();
    delete fetchBtn.dataset.apiPlot;
    delete fetchBtn.dataset.apiPoster;
}

function deleteMovie(id) {
    myMoviesDataset = myMoviesDataset.filter(movie => movie.id !== id);
    saveMovies(myMoviesDataset);
    renderMovies();
}

function toggleStatus(id) {
    myMoviesDataset = myMoviesDataset.map(movie => {
        if (movie.id === id) {
            movie.status = movie.status === 'To Watch' ? 'Watched' : 'To Watch';
        }
        return movie;
    });
    saveMovies(myMoviesDataset);
    renderMovies();
}

// Event Delegation setup for managing dynamic list buttons cleanly
document.addEventListener('click', (event) => {
    const target = event.target;
    const movieId = target.dataset.id;

    if (target.classList.contains('toggle-btn')) {
        toggleStatus(movieId);
    } else if (target.classList.contains('delete-btn')) {
        deleteMovie(movieId);
    }
});

document.getElementById('search-input').addEventListener('input', () => { updateURLParameters(); renderMovies(); });
document.getElementById('filter-genre').addEventListener('change', () => { updateURLParameters(); renderMovies(); });
document.getElementById('sort-by').addEventListener('change', () => { updateURLParameters(); renderMovies(); });

document.getElementById('omdb-fetch-btn').addEventListener('click', handleOMDbFetch);
document.getElementById('movie-form').addEventListener('submit', handleFormSubmit);

window.addEventListener('DOMContentLoaded', () => {
    myMoviesDataset = getSavedMovies();
    loadFiltersFromURL();
    renderMovies();
});
