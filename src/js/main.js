(function($){
  $(function() {
    $('.hamburger').on('click', function() {
      $(this).closest('.hamburger').toggleClass('menu_state_open');
    });
  });
})(jQuery);