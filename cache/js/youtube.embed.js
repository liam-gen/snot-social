function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      let data = new URL(url);
      if(data.hostname == "www.youtube.com"){
        return '<iframe frameborder=0 width="100%" height="315" style="border-radius: 8px;vertical-align: middle;" allowfullscreen src="https://www.youtube-nocookie.com/embed/' + data.searchParams.get("v") + '"></iframe>';
      }
    })
  }
  
let url = new URL(location.href);

if(url.pathname == "/fr/home/spost/"){
    let element = document.querySelector("#spostContent_sUCB1 .content");
        element.querySelectorAll("a").forEach((e) => {
        console.log(e.href)
        e.innerHTML = urlify(e.href)
    })
}
  