(function ($) {
  // get HTML elements needed to provid functionalities
  const searchForm = $("#searchForm");
  const searchInput = $("#search_term");
  const moviesList = $("#movieList");
  const movieDiv = $("#movie");
  const errorMsg = $(".error");
  const randButton = $("#randomButton");
  const addButton = $("#addMovieButton");
  const date = new Date();

  /*
    Usage: Shows the movie details in html for a movie whose id you input
    */
  //TODO: Add avg review rating and reviews
  // ASk about what the formatting of the html should be

  const showMovieDetailsHelper = (movie) => {
    const {
      title,
      desc,
      img,
      releaseYear,
      runtime,
      mpaaRating,
      genre,
      userAvgRating,
      reviews,
    } = movie;

    let genresList = "N/A";
    if (genre && genre.length > 0) {
      genresList = genre.map((g) => `<li class="genre-li">${g}</li>`).join("");
    }

    let reviewsList = "No reviews have been made for this movie yet";

    if (reviews && reviews.length > 0) {
      reviewsList = reviews
        .map(
          (r) =>
            `<li class="review-li">${r.username}<br>${r.reviewText}<br>${r.rating}<br>${r.reviewDate}</li>`
        )
        .join("");
    }

    movieDiv.empty();
    movieDiv.append(
      `<h1>${title ? title : "N/A"}</h1>`,
      `<br><img src="${img}" alt="${
        img.includes("../public") ? "Poster Unvailable for" : "Poster for"
      } ${movie.title}" width="270" height="400">`,
      `<dl>
        <dt>Summary</dt>
        <dd>${desc ? desc : "N/A"}</dd>
        <dt>MPAA Rating</dt>
        <dd>${
          !mpaaRating || mpaaRating === "NR" ? "Not Rated" : mpaaRating
        }</dd>
        <dt>Genres</dt>
        <dd>
          <ul>                
            ${genresList}
          </ul>
        </dd>
        <dt>Runtime</dt>
        <dd>
          ${runtime ? runtime : "N/A"} minutes
        </dd>
        <dt>Release Date</dt>
        <dd>
          ${releaseYear ? releaseYear : "N/A"}
        </dd>
        <dt> Average User Rating </dt>
        <dd>
          ${userAvgRating ? userAvgRating : "No ratings added yet"}
        </dd>
        <dt>Reviews</dt>
          <dd>
            <ul>                
              ${reviewsList}
            </ul>
          </dd>
      </dl>`
    );
    movieDiv.attr("hidden", false);
    moviesList.attr("hidden", true);
  };

  const showMovieDetails = (movieId) => {
    //Get the general info of the movie
    $.ajax({
      method: "GET",
      url: `/movies/TMDbId/${movieId}`,
      contentType: "application/json",
    }).then((movie) => {
      // Make a list of the movie genres
      showMovieDetailsHelper(movie);
    });
  };

  // Bind the "add this movie" links to the movie
  const bindEventsToMovieItem = (movieItem) => {
    // Add movie link
    movieItem.on("click", ".movieLink", (event) => {
      event.preventDefault();
      moviesList.attr("hidden", true);
      errorMsg.attr("hidden", true);
      movieDiv.empty();
      const movieId = movieItem.find(".movieLink").attr("id");
      showMovieDetails(movieId);
      addButton.children().html("Add this movie to my list");
      addButton.attr("hidden", false);
    });

    movieItem.on("click", ".addLink", (event) => {
      event.preventDefault();
      var requestConfig = {
        method: "POST",
        url: "/wantToWatchList/add",
        contentType: "application/json",
        data: JSON.stringify({
          movie: movieItem,
          allDetails: false,
        }),
      };
      $.ajax(requestConfig).then((response) => {
        if (response) {
          movieItem.find(".addLink").html("This movie has been added");
        } else {
          errorMsg.empty();
          errorMsg.append(`Error: This movie is already on your list.`);
          errorMsg.attr("hidden", false);
        }
      });
    });
  };

  // When the user searches for a movie
  searchForm.submit((event) => {
    event.preventDefault();

    // Basic error handling
    const unrefinedInput = searchInput.val();
    if (typeof unrefinedInput !== "string") {
      errorMsg.empty();
      errorMsg.append(`Error: Input must be a string.`);
      errorMsg.attr("hidden", false);
      movieDiv.attr("hidden", true);
      addButton.attr("hidden", true);
      moviesList.attr("hidden", true);
    } else {
      const userInput = unrefinedInput.trim();
      if (userInput.length > 200) {
        errorMsg.empty();
        errorMsg.append(
          `Error: Input is too long, input cannot be greater than 200 characters.`
        );
        errorMsg.attr("hidden", false);
        movieDiv.attr("hidden", true);
        addButton.attr("hidden", true);
        moviesList.attr("hidden", true);
      } else {
        if (userInput) {
          $.ajax({
            method: "GET",
            url: `/wantToWatchList/userQuery/${userInput}`,
            contentType: "application/json",
          }).then((data) => {
            if (data.total_results > 0) {
              // Show each movie
              moviesList.empty();
              let movies = data.results;
              let img = "";
              movies.forEach((movieData) => {
                if (movieData.poster_path) {
                  img = `<img src="https://image.tmdb.org/t/p/w500/${movieData.poster_path}" alt="${movieData.title}" width="108" height="160"> `;
                } else {
                  img = `<img src="../public/images/no_image.jpeg" alt="No Image" width="108" height="160">`;
                }
                const seeDetailsButton = `<button type="button" class="movieLink" id="${movieData.id}">Show more details</button>`;

                const addMovieButton = `<button type="button" class="addLink" id="addLink${movieData.id}">Add this movie to my list</button>`;

                moviesList.append(
                  `<li class="movie-li">${
                    movieData.title ? movieData.title : "N/A"
                  }
                        <br>
                        ${seeDetailsButton}
                        <br>
                        ${addMovieButton}
                        <br>                     
                        <br>
                        ${img}
                        <br>
                        <p>${
                          movieData.overview ? movieData.overview : "N/A"
                        }</p>
                        </li>
                        <br>`
                );
              });
              moviesList
                .children()
                .each((index, element) => bindEventsToMovieItem($(element)));
              errorMsg.attr("hidden", true);
              movieDiv.attr("hidden", true);
              addButton.attr("hidden", true);
              moviesList.attr("hidden", false);

              // more error handling
            } else {
              errorMsg.empty();
              errorMsg.append(
                `Error: No movies were found that matched the given search term, "${userInput}".`
              );
              errorMsg.attr("hidden", false);
              movieDiv.attr("hidden", true);
              addButton.attr("hidden", true);
              moviesList.attr("hidden", true);
            }
          });

          // Even more error handling
        } else {
          errorMsg.empty();
          errorMsg.append(
            `Error: You must input something into the search bar. "${userInput}".`
          );
          errorMsg.attr("hidden", false);
        }
      }
    }
  });

  // If the random movie button is clicked
  randButton.submit((event) => {
    event.preventDefault();

    // Choose a random page and random movie on that page
    const randPage = Math.floor(Math.random() * 500 + 1);
    const randMovie = Math.floor(Math.random() * 20);

    //call to get the random movie page
    $.ajax({
      method: "GET",
      url: `/wantToWatchList/random/${randPage}`,
      contentType: "application/json",
    }).then((pageData) => {
      if (pageData.total_results > 0) {
        const movieId = pageData.results[randMovie].id;

        //show the movie in html

        showMovieDetails(movieId);
        addButton.children().html("Add this movie to my list");
        addButton.attr("hidden", false);
      } else {
        errorMsg.empty();
        errorMsg.append(`Error: No movies were found for some reason.`);
        errorMsg.attr("hidden", false);
      }
    });
  });

  //If a user wants to add a movie to their Want to Watch List
  addButton.submit((event) => {
    event.preventDefault();

    // Send to routes
    var requestConfig = {
      method: "POST",
      url: "/wantToWatchList/add",
      contentType: "application/json",
      data: JSON.stringify({
        movie: movieDiv,
        allDetails: true,
      }),
    };

    // Update the button with new text "This movie has been added"
    $.ajax(requestConfig).then((response) => {
      if (typeof response === "boolean") {
        if (response) {
          addButton.children().html("This movie has been added");
        } else {
          errorMsg.empty();
          errorMsg.append(`Error: This movie is already on your list.`);
          errorMsg.attr("hidden", false);
        }
      }
    });
  });
})(jQuery);
