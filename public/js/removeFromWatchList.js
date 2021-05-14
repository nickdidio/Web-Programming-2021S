(function ($) {
  const moviesList = $("#movieList");
  const errorMsg = $(".error");

  // bind a button to remove movies from the Watch List
  const bindEventsToMovieItem = (movieItem) => {
    movieItem.on("click", ".removeLink", (event) => {
      event.preventDefault();
      var requestConfig = {
        method: "POST",
        url: "/wantToWatchList/remove",
        contentType: "application/json",
        data: JSON.stringify({
          movieId: movieItem.find(".removeLink").attr("id"),
        }),
      };
      $.ajax(requestConfig).then((response) => {
        if (response) {
          movieItem.find(".removeLink").html("This movie has been removed");
        } else {
          errorMsg.empty();
          errorMsg.append(`Error: This movie has already been removed.`);
          errorMsg.attr("hidden", false);
        }
      });
    });

    movieItem.on("click", ".moreDetails", (event) => {
      event.preventDefault();
      var requestConfig = {
        method: "GET",
        url: `/wantToWatchList/movieDetails/${movieItem}`,
        contentType: "application/json",
      };
      $.ajax(requestConfig).then((res) => {
        console.log(res);
      });
    });
  };

  // Bind all movies on event startup
  $(document).ready(function () {
    moviesList
      .children()
      .each((index, element) => bindEventsToMovieItem($(element)));
  });
})(jQuery);
