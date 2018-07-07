$(document).ready(function() {

  var $grid = $('#main-section').masonry({

    itemSelector: '.paper'
  });

  var appendDocument = function() {
    for (var i=0; i<1; i++) {
       var $paper = $('<div><div class="paper-holder"><a><img width=100%  src="login.jpg" /></a></div><p class="paper-description">Lorem ipsum dolor sit amet</p><div class="paper-content"><a class="paper-link" href="#"><img src="http://placehold.it/30x30" /></a><p class="paper-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem mi, egestas a facilisis eget, egestas ut magna.</p></div></div>').addClass('paper');
     $grid.append($paper).masonry('appended', $paper);
    }
  };
  appendDocument();
  $(window).scroll(function() {
    var scrollHeight = $(window).scrollTop() + $(window).height();
    var documentHeight = $(document).height();
    console.log($(window).scrollTop(), $(window).height(), documentHeight);
    if (parseInt(scrollHeight) >= documentHeight-1) {
    appendDocument();
    }
  });
});
