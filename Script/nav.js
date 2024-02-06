document.addEventListener("DOMContentLoaded", () => {
    // Simulate an API request or any async operation
    setTimeout(() => {
        hideLoader();
        showContent();
    }, 400);

    function hideLoader() {

    }

    function showContent() {
        const content = document.getElementById("content");
        content.style.display = "block";
    }
});


const zamk = document.querySelector("main");

zamk.addEventListener("click", function () {
    if (test == 1) {
        console.log("test");
        closeNav();
        test = 0;
    }
});
let test = 0;


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("html").style.overflowY = "hidden";
    document.body.style.transition = "0.5s";
    document.body.style.backgroundColor = "#1e1d1d";

    document.getElementById("html").scrollTop = 0;
    document.documentElement.scrollTop = 0;


    const brightness = document.querySelector(".container");
    brightness.classList.add('brigh');

    const brightness2 = document.querySelector(".header");
    brightness2.classList.add('brigh');

    const font = document.querySelector(".pogoda_dzis");
    font.classList.add('act');

    test = 1;
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("html").style.overflowY = "scroll";
    document.body.style.transition = "0.5s";
    document.body.style.backgroundColor = "#33363b";

    document.getElementById("html").scrollTop = 0;
    document.documentElement.scrollTop = 0;


    document.getElementById("main").style.marginLeft = "0";


    const brightness = document.querySelector(".container");
    brightness.classList.remove('brigh');

    const brightness2 = document.querySelector("header");
    brightness2.classList.remove('brigh');

    const font = document.querySelector(".pogoda_dzis");
    font.classList.remove('act');

}
