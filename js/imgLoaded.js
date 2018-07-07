$(document).ready(function(){
  $('#main-section').imagesLoaded(function(){
    $('#main-section').masonry({
        itemSelector: '.paper',
        columnWidth: 230,
        isAnimated: true
    });
  });
});
