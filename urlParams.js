export function updateURLParameters() {
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

export function loadFiltersFromURL() {
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
