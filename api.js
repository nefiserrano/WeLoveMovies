const API_KEY = '51403b9a';

/**
 * Fetches movie details from OMDb API based on the title.
 * @param {string} title 
 * @returns {Promise<Object|null>}
 */
export async function fetchMovieFromOMDb(title) {
    if (!title) {
        alert("Please enter a movie title first!");
        return null;
    }

    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "False") {
            alert(`Movie not found: ${data.Error}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error fetching data from OMDb:", error);
        alert("Failed to connect to the movie database. Please check your internet connection.");
        return null;
    }
}
