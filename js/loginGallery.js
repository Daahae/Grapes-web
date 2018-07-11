$(document).ready(function () {
  var width = $('[data-role="slider"]').attr('data-width');
  var height = $('[data-role = "slider"]').attr('data-height');
  var count = $('[data-role = "slider"] div.item').length;

  $('[data-role = "slider"]').css({
    position:'relative',
    overflow: 'hidden',
    width: width,
    height: height
  }).find('.container').css({
    position: 'absolute',
    padding: 0,
    width: count * width,
    overflow: 'hidden'
  }).find('.item').css({
    width: width,
    height: height,
    float: 'left'
  });

  var currentPage = 0;
  var changePage = function () {
    $('[data-role="slider"] > .container').animate({
      left: -currentPage * width
    }, 500);
  };

  $('#left-button').click(function () {
    if( currentPage > 0){
      currentPage = currentPage -1;
      changePage();
    }
  });
  $('#right-button').click(function () {
    if(currentPage < count - 1) {
      currentPage = currentPage + 1;
      changePage();
    }
  });
});
