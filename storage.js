const STORAGE_KEY = 'myMoviesDataset';

export function getSavedMovies() {
    const savedMovies = localStorage.getItem(STORAGE_KEY);
    return savedMovies ? JSON.parse(savedMovies) : [];
}

export function saveMovies(moviesDataset) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moviesDataset));
}
