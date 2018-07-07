$(document).ready(function(){
  //폴다운 메뉴
  $('.outer-menu').hover(function(){
    $(this).find('.inner-menu').css('display', 'block');
  },function(){
    $(this).find('.inner-menu').css('display', 'none');
  });
});
