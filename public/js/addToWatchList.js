(function ($) {
  // get HTML elements needed to provid functionalities
  const searchForm = $("#searchForm");
  const searchInput = $("#search_term");
  const moviesList = $("#movieList");
  const movieDiv = $(".movie");
  //const moviesList = $(".watchListResult");
  const errorMsg = $(".error");
  const errorMsgContainer = $("#searchMoviesErrorContainer");
  // const errorMsg = $("#searchMoviesError");
  const randButton = $("#randomButton");
  const addButton = $("#addMovieButton");
  const date = new Date();

  /*
    Usage: Shows the movie details in html for a movie whose id you input
    */
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
    // Show Movie Details After Search/Random
    movieDiv.append(
      `<div class="row">
          <div class="col-md-4">
            <div class="profile-img">
              <img src="${img}" alt="${
        img.includes("../public") ? 'Poster Unvailable for' : 'Poster for'
      } ${movie.title}" width="270" height="200">
            </div>
          </div>
          <div class="col-md-6">
            <div class="profile-head">
              <h1>${title ? title : "N/A"}</h1>
              <h2>${
                !mpaaRating || mpaaRating === "NR" ? "Not Rated" : mpaaRating
              }</h2>
              <p class="proile-rating">If this movie looks interesting, <span>add it to your watch list!</span></p>
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li class="nav-item">
                     <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Details</a>
                  </li>
               </ul>
            </div>
          </div>
        </div>`,
      `<div class="row">
      <div class="col-md-4">
      <div class="profile-actions">
         <p>FIND A MOVIE</p>
         <a href="/movieSelection">Movie Selection</a><br/>
         <p>WANT TO WATCH LIST</p>
         <a href="/wantToWatchList/">My List</a>
         <br>
         <a href="/wantToWatchList/add">Add Movies</a><br/>
         <p>DECISION GROUPS</p>
         <a href="/groups">Find a Group</a><br/>
      </div>
   </div>
          <div class="col-md-8">
          <div class="tab-content profile-tab" id="myTabContent">
          <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
          <div class="row">
                <div class="col-md-6">
                   <label>Summary</label>
                </div>
                <div class="col-md-6">
                ${desc ? desc : "N/A"}
                </div>
             </div>   
          <div class="row">
                <div class="col-md-6">
                   <label>Genres:</label>
                </div>
                <div class="col-md-6">
                  <ul>                
                    ${genresList}
                  </ul>
                </div>
             </div>
             <div class="row">
                <div class="col-md-6">
                   <label>Runtime</label>
                </div>
                <div class="col-md-6">
                ${runtime ? runtime : "N/A"} minutes
                </div>
             </div>
             <div class="row">
                <div class="col-md-6">
                   <label>Release Date</label>
                </div>
                <div class="col-md-6">
                ${releaseYear ? releaseYear : "N/A"}
                </div>
             </div>
             <div class="row">
                <div class="col-md-6">
                  <label>Average User Rating</label>
                </div>
                <div class="col-md-6">
                  ${
                    userAvgRating
                      ? userAvgRating.toFixed(1)
                      : "No ratings added yet"
                  }
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label>Reviews</label>
                </div>
                <div class="col-md-6">
                  <ul>                
                    ${reviewsList}
                  </ul>
                </div>
              </div>
          </div>
       </div>
          </div>
      </div>`
    );
    movieDiv.attr("hidden", false);
    moviesList.attr("hidden", true);
  };

  const showMovieDetails = (movieId) => {
    //Get the general info of the movie
    $.ajax({
      method: "GET",
      url: `/wantToWatchList/movies/TMDbId/${movieId}`,
      contentType: "application/json",
    }).then((movie) => {
      // Make a list of the movie genres
      showMovieDetailsHelper(movie);
    });
    // Set the movieDiv Id to the movieId
    movieDiv.attr("id", movieId);
  };

  // Bind the "add this movie" links to the movie
  const bindEventsToMovieItem = (movieItem) => {
    // Add movie link
    movieItem.on("click", ".movieLink", (event) => {
      event.preventDefault();
      moviesList.attr("hidden", true);
      errorMsgContainer.attr("hidden", true);
      movieDiv.empty();
      const movieId = movieItem.find(".movieLink").attr("id");
      showMovieDetails(movieId);
      addButton.children().html("Add this movie to my list");
      addButton.attr("hidden", false);
      movieDiv.attr("hidden", false);
    });

    // On click, send to route to add a movie to the database
    movieItem.on("click", ".addLink", (event) => {
      event.preventDefault();
      var requestConfig = {
        method: "POST",
        url: "/wantToWatchList/add",
        contentType: "application/json",
        data: JSON.stringify({
          movieId: movieItem.find(".addLink").attr("id").slice(7),
        }),
      };
      $.ajax(requestConfig).then((response) => {
        if (response && typeof response === "boolean") {
          movieItem.find(".addLink").html("This movie has been added");
        } else {
          errorMsg.empty();
          errorMsg.append(`Error: This movie is already on your list.`);
          errorMsgContainer.attr("hidden", false);
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
      errorMsgContainer.attr("hidden", false);
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
        errorMsgContainer.attr("hidden", false);
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
                const seeDetailsButton = `<button type="button" class="movieLink btn btn-link" id="${movieData.id}">Show more details</button>`;

                const addMovieButton = `<button type="button" class="addLink btn btn-success" id="addLink${movieData.id}">Add this movie to my list</button>`;

                moviesList.append(
                  `<li class="movie-li">${
                    movieData.title ? movieData.title : "N/A"
                  }
                        
                        <br>
                        ${addMovieButton}
                        <br>                     
                        <br>
                        ${img}
                        <br>
                        <p>${
                          movieData.overview ? movieData.overview : "N/A"
                        }</p>
                        ${seeDetailsButton}
                        </li>
                        <br>`
                );
              });
              moviesList
                .children()
                .each((index, element) => bindEventsToMovieItem($(element)));
              errorMsgContainer.attr("hidden", true);
              movieDiv.attr("hidden", true);
              addButton.attr("hidden", true);
              moviesList.attr("hidden", false);

              // more error handling
            } else {
              errorMsg.empty();
              errorMsg.append(
                `Error: No movies were found that matched the given search term, "${userInput}".`
              );
              errorMsgContainer.attr("hidden", false);
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
          errorMsgContainer.attr("hidden", false);
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
        moviesList.attr("hidden", true);
        movieDiv.attr("hidden", false);
        errorMsgContainer.attr("hidden", true);
      } else {
        errorMsg.empty();
        errorMsg.append(`Error: No movies were found for some reason.`);
        errorMsgContainer.attr("hidden", false);
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
        movieId: movieDiv.attr("id"),
      }),
    };

    // Update the button with new text "This movie has been added"
    $.ajax(requestConfig).then((response) => {
      if (response && typeof response === "boolean") {
        addButton.children().html("This movie has been added");
      } else {
        errorMsg.empty();
        errorMsg.append(`Error: This movie is already on your list.`);
        errorMsgContainer.attr("hidden", false);
      }
    });
  });
})(jQuery);
