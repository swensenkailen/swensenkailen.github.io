function updateFontSize() {
  var headings = document.getElementsByClassName("resizable-heading");

  var xl = document.getElementsByClassName("extra-large-heading");
  var large = document.getElementsByClassName("large-heading");
  var medium = document.getElementsByClassName("medium-heading");
  var small = document.getElementsByClassName("small-heading");
  var xs = document.getElementsByClassName("extra-small-heading");


  var windowWidth = window.innerWidth;

  // Auto resizing for xtra small -> xtra large fonts
  for (var i = 0; i < xl.length; i++) {
    var heading = xl[i];
    var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
    var newFontSize = windowWidth * 0.040;
    heading.style.fontSize = newFontSize + "px";
  }

  for (var i = 0; i < large.length; i++) {
    var heading = large[i];
    var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
    var newFontSize = windowWidth * 0.030;
    heading.style.fontSize = newFontSize + "px";
  }

  for (var i = 0; i < medium.length; i++) {
    var heading = medium[i];
    var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
    var newFontSize = windowWidth * 0.021;
    heading.style.fontSize = newFontSize + "px";
  }

  for (var i = 0; i < small.length; i++) {
    var heading = small[i];
    var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
    var newFontSize = windowWidth * 0.014;
    heading.style.fontSize = newFontSize + "px";
  }

  for (var i = 0; i < small.length; i++) {
    var heading = xs[i];
    var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
    var newFontSize = windowWidth * 0.007;
    heading.style.fontSize = newFontSize + "px";
  }
}

// Call the updateFontSize function when the window is resized
window.addEventListener("resize", updateFontSize);

// Call the updateFontSize function on page load
window.addEventListener("load", updateFontSize);