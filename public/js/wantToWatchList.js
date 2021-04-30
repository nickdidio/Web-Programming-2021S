(function ($) {
    const searchForm = $("#searchForm");
    const searchInput = $("#search_term");
    const showsList = $("#showList");
    const showDiv = $("#show");
    const errorMsg = $("#error");
    const randButton = $("#randomButton");
    //const showButton = $("#showLink");


    const bindEventsToShowItem = (showItem) => {
        console.log("bound items");
        const showAnchor = showItem.find(".showLink");
        console.log(showAnchor);
        showAnchor.on("click",'.showLink', (event) => {
          event.preventDefault();
          showsList.attr("hidden", true);
          errorMsg.attr("hidden", true);
          showDiv.empty();
          const showLink = showAnchor.attr("id");
          console.log(showLink);
    
          $.ajax({
            url: showLink,
          }).then((show) => {
            let genres;
            if (show.genres && show.genres.length > 0) {
              show.genres.forEach(
                (g) => (genres += `<li class="genre-li">${g.name}</li>`)
              );
            } else {
              genres = "N/A";
            }
            /*
            `<img src=${
                show.image && show.image.medium
                  ? show.image.medium
                  : "./public/images/no_image.jpeg"
              }></img>`, 
            */

              /*
              <dt>Average Rating</dt>
                  <dd>${
                    show.rating && show.rating.average ? show.rating.average : "N/A"
                  }</dd>
              */

            //TODO: Add avg review rating and reviews
            showDiv.append(
              `<h1>${show.title ? show.title : "N/A"}</h1>`,
              
              `<dl>
                  <dt>Language</dt>
                  <dd>${show.overview ? show.overview : "N/A"}</dd>
            
                  <dt>Genres</dt>
                  <dd>
                    <ul>                
                      ${genres}
                    </ul>
                  </dd>
                  <dt>Summary</dt>
                  <dd>
                    ${show.summary ? show.summary : "N/A"}
                  </dd>
                  <dt>Release Date</dt>
                  <dd>
                    ${show.release_date ? show.release_date : "N/A"}
                  </dd>
                  <dt>Runtime</dt>
                  <dd>
                    ${show.runtime ? show.runtime : "N/A"}
                  </dd>
                </dl>`
            );
            showDiv.attr("hidden", false);
          });
        });
      };

    searchForm.submit((event) => {
        event.preventDefault();
        const userInput = searchInput.val().trim();
    
        if (userInput) {
          $.ajax({
            url: `https://api.themoviedb.org/3/search/movie?api_key=3de1a3948342d6378babe09378ea4434&query=${userInput}`,
          }).then((data) => {
            if (data.total_results > 0) {
              showsList.empty();
              let shows = data.results;
              shows.forEach((showData) => {
                
                const newButton= `<button type="button" class="showLink" id="https://api.themoviedb.org/3/movie/${showData.id}?api_key=3de1a3948342d6378babe09378ea4434">Show more details</button>`
                showsList.append(
                    `<li class="shows-li"><a class="showTitle">${showData.title}</a></li>`, 
                    newButton
                );
                bindEventsToShowItem($(newButton));
              });
              errorMsg.attr("hidden", true);
              showDiv.attr("hidden", true);
              showsList.attr("hidden", false);
            } else {
              errorMsg.empty();
              errorMsg.append(
                `Error: No shows were found that matched the given search term, "${userInput}".`
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
})(jQuery);