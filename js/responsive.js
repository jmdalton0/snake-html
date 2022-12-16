window.addEventListener('resize', () => {
    if (screen.width <= 768) {
        console.log('here');
        let main = document.querySelector('main');
        main.style.height = main.offsetWidth.toString() + 'px';

        document.querySelectorAll('.control').forEach((element, ind) => {
            element.style.display = 'none';
            if (ind == 2) {
                element.style.display = 'inline-block';
                element.innerHTML = 'SWIPE';
            }
        });
    } else {
        document.querySelectorAll('.control').forEach((element, ind) => {
            element.style.display = 'inline-block';
            if (ind == 2) {
                element.innerHTML = '5';
            }
        });
    }
});

window.dispatchEvent(new Event('resize'));

