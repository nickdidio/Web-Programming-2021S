(function ($) {
    const moviesList = $("#movieList");
    const errorMsg = $(".error");

    const bindEventsToMovieItem = (movieItem) => {
        movieItem.on("click",'.removeLink', (event) => {
            event.preventDefault();
            var requestConfig = {
            method: 'POST',
            url: '/wantToWatchList/remove',
            contentType: 'application/json',
            data: JSON.stringify({
                movie: movieItem
            })
            };
            $.ajax(requestConfig).then((response) => {
            if(response){
                movieItem.find(".removeLink").html("This movie has been removed");
            }else{
                errorMsg.empty();
                errorMsg.append(`Error: This movie has already been removed.`);
                errorMsg.attr("hidden", false);
            }
            });
        });
    }

    $(document).ready(function (){
        moviesList
        .children()
        .each((index, element) => bindEventsToMovieItem($(element)));
    });
});