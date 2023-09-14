window.legacyAlert = window.alert;

window.alert = function(msg) {
    swal.fire({
            title: "SNOT",
            text: msg,
    });
};

window.appAlert = function(settings, callback=function(){}) {
    swal.fire(settings).then(callback);
};
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
  }

var tags = document.querySelectorAll('*');
tags.forEach(function(el) {
    if (window.getComputedStyle) {
        if(document.defaultView.getComputedStyle(el, null).getPropertyValue('background-color') == hexToRgb(document.defaultView.getComputedStyle(document.documentElement).getPropertyValue('--main-bgc-color-dark'))){
            el.className += ' snot-app-bg';
        }

        /*let dark_colors = ["rgb(36, 36, 41)", "rgb(38, 38, 44)"]
        if(dark_colors.includes(document.defaultView.getComputedStyle(el, null).getPropertyValue('background-color'))){
            console.log(el.className)
            el.className += ' snot-app-div';
        }*/
    }
})