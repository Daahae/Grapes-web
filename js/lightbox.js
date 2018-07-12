$(document).ready(function() {
      function showLightBox() {
        $('#darken-background').show();
        $('#darken-background').css('top', $(window).scrollTop());

        $('body').css('overflow', 'hidden');
      }

      function hideLightBox() {
        $('#darken-background').hide();

        $('body').css('overflow', '');
      }

      $('#darken-background').click(function() {
        hideLightBox();
      });

      $('#lightbox').click(function(event) {
        event.stopPropagation()
      });
    });
