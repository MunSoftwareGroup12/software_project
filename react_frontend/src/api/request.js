export async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network error');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Request failed: ' + error.message);
    }
}