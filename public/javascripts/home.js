const profileLink = document.getElementById('profileLink');
const isLoggedIn = profileLink.dataset.loggedin;

profileLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (isLoggedIn) {
        window.location.href = '/profile';
    } else {
        window.location.href = '/login';
    }
});