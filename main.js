const reel = document.getElementById('reel');
let loading = false;
let jokeCount = 0;

async function fetchJoke() {
    const jokeDiv = document.createElement('div');
    jokeDiv.className = 'joke loading';
    jokeDiv.textContent = 'Loading joke...';
    reel.appendChild(jokeDiv);
    try {
        if (!puter || !puter.ai) {
            throw new Error('Puter AI not available');
        }
        const resp = await puter.ai.chat('Tell me a new joke', {model: 'gpt-5-nano', stream: true });
        let joke = '';
        for await (const part of resp) {
            joke += part?.text || '';
            jokeDiv.innerHTML = joke.replaceAll('\n', '<br>');
        }
        jokeDiv.classList.remove('loading');
    } catch (e) {
        jokeDiv.textContent = 'Failed to load joke: ' + e.message;
        jokeDiv.classList.remove('loading');
    }
}

// Initial joke
fetchJoke();

reel.addEventListener('scroll', () => {
    if (loading) return;
    // Find which joke is currently in view
    const jokes = Array.from(document.getElementsByClassName('joke'));
    const scrollPos = reel.scrollTop;
    const viewportHeight = reel.clientHeight;
    // If user is near the bottom of the last joke, load a new one
    if (jokes.length > 0) {
        const lastJoke = jokes[jokes.length - 1];
        if (lastJoke.offsetTop - scrollPos < viewportHeight * 0.5) {
            loading = true;
            fetchJoke().then(() => loading = false);
        }
    }
});

// Optional: snap to joke on scroll end for smoother UX
let scrollTimeout;
reel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const jokes = Array.from(document.getElementsByClassName('joke'));
        const scrollPos = reel.scrollTop;
        let closest = jokes[0];
        let minDist = Math.abs(closest.offsetTop - scrollPos);
        for (const joke of jokes) {
            const dist = Math.abs(joke.offsetTop - scrollPos);
            if (dist < minDist) {
                minDist = dist;
                closest = joke;
            }
        }
        reel.scrollTo({ top: closest.offsetTop, behavior: 'smooth' });
    }, 150);
});
