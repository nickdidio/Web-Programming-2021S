(function ($) {
    const searchForm = $("#searchForm");
    const searchInput = $("#search_term");
    const moviesList = $("#movieList");
    const movieDiv = $("#movie");
    const errorMsg = $("#error");
    const randButton = $("#randomButton");
    const addRandButton = $("#addRandMovieButton");
    const apiKey = '3de1a3948342d6378babe09378ea4434';

  
  /*
  Usage: Shows the movie details in html for a movie whose id you input
  */
  const showMovieDetails = (movieId) => {
    $.ajax({
      url: `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=release_dates`,
    }).then((movie) => {
      let genres = '';
      if (movie.genres && movie.genres.length > 0) {
        for(let i = 0;i<movie.genres.length;i++){
          genres += `<li class="genre-li">${movie.genres[i].name}</li>`
        };
      } else {
        genres = "N/A";
      }
      let MPAARating = "Not Rated";
      for(let i = 0; i < movie.release_dates.results.length; i++){
        console.log(movie.release_dates.results[i].iso_3166_1);
        if(movie.release_dates.results[i].iso_3166_1 == "US"){
          //if the rating exists and is not NR
          if(movie.release_dates.results[i].release_dates[0].certification && movie.release_dates.results[i].release_dates[0].certification != "NR"){
            MPAARating = movie.release_dates.results[i].release_dates[0].certification;  
          }
          break;
        }
      }

      movieDiv.empty();
      console.log();
      movieDiv.append(
        `<h1>${movie.title ? movie.title : "N/A"}</h1>`,
        `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" width="270" height="400"> `,
        `<dl>
            <dt>Summary</dt>
            <dd>${movie.overview ? movie.overview : "N/A"}</dd>
            <dt>MPAA Rating</dt>
            <dd>${MPAARating}</dd>
            <dt>Genres</dt>
            <dd>
              <ul>                
                ${genres}
              </ul>
            </dd>
            <dt>Runtime</dt>
            <dd>
              ${movie.runtime ? movie.runtime : "N/A"} minutes
            </dd>
            <dt>Release Date</dt>
            <dd>
              ${movie.release_date ? movie.release_date : "N/A"}
            </dd>
          </dl>`
      );
      movieDiv.attr("hidden", false);
    });
  }


    const bindEventsToMovieItem = (movieItem) => {
        console.log("bound items");
        //console.log(movieItem);
        const movieAnchor = movieItem.find(".movieLink");
        console.log(movieAnchor);
        movieItem.on("click",'.movieLink', (event) => {
          event.preventDefault();
          console.log("SUCCESS");
          moviesList.attr("hidden", true);
          errorMsg.attr("hidden", true);
          movieDiv.empty();
          const movieLink = movieAnchor.attr("id");
          //console.log(movieLink);
    
          $.ajax({
            url: movieLink,
          }).then((movie) => {
            //TODO: Add avg review rating and reviews
            console.log("SUCCESS");
            movieDiv.append(
              `<h1>${movie.title ? movie.title : "N/A"}</h1>`,
              
              `<dl>
                  <dt>Summary</dt>
                  <dd>${movie.overview ? movie.overview : "N/A"}</dd>
                  <dt>Release Date</dt>
                  <dd>
                    ${movie.release_date ? movie.release_date : "N/A"}
                  </dd>
                  <dt>Runtime</dt>
                  <dd>
                    ${movie.runtime ? movie.runtime : "N/A"}
                  </dd>
                </dl>`
            );
            movieDiv.attr("hidden", false);
          });
        });
      };

    searchForm.submit((event) => {
        event.preventDefault();
        const userInput = searchInput.val().trim();
    
        if (userInput) {
          $.ajax({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${userInput}`,
          }).then((data) => {
            if (data.total_results > 0) {
              moviesList.empty();
              let movies = data.results;
              movies.forEach((movieData) => {
                
                const newButton= `<button type="button" class="movieLink" id="https://api.themoviedb.org/3/movie/${movieData.id}?api_key=3de1a3948342d6378babe09378ea4434">movie more details</button>`
                moviesList.append(
                    `<li class="movie-li">${movieData.title}</li>`, 
                    newButton
                );
                //bindEventsTomovieItem($(newButton));
              });
              moviesList
              .children()//.filter(".movieLink")
              .each((index, element) => bindEventsToMovieItem($(element)));
              errorMsg.attr("hidden", true);
              movieDiv.attr("hidden", true);
              addRandButton.attr("hidden", true);
              moviesList.attr("hidden", false);
            } else {
              errorMsg.empty();
              errorMsg.append(
                `Error: No movies were found that matched the given search term, "${userInput}".`
              );
              errorMsg.attr("hidden", false);
            }
          });
        } else {
          errorMsg.empty();
          errorMsg.append(
            `Error: You must input something into the search bar. "${userInput}".`
          );
          errorMsg.attr("hidden", false);
        }
    });

    randButton.submit((event) => {
      event.preventDefault();
      const randPage = Math.floor((Math.random() * 500) + 1);
      const randMovie = Math.floor((Math.random() * 20));
      
      //call to get the random movie page
      $.ajax({
        url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randPage}`,
      }).then((pageData) => {
        
        if (pageData.total_results > 0) {
          const movieId = pageData.results[randMovie].id;
          
          //show the movie in html
          
          showMovieDetails(movieId);
          addRandButton.children().html("Add this movie to my list");
          addRandButton.attr("hidden", false);
        }else{
          errorMsg.empty();
          errorMsg.append(
            `Error: No movies were found for some reason.`
          );
          errorMsg.attr("hidden", false);
        }
      });
    });

    addRandButton.submit((event) => {
      event.preventDefault();
      addRandButton.children().html("This movie has been added");
      //TODO: Add to mongoDB user wantToWatchList database
    });
})(jQuery);