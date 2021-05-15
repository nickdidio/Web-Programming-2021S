(function ($) {
  const reviewText = $("#reviewTextArea");
  const postReviewBttn = $("#postNewReviewButton");
  const reviewAlert = $("#reviewTextAlert");

  reviewText.change(() => {
    if ($.trim(reviewText.val()).length > 0) {
      reviewAlert.attr("hidden", true);
      postReviewBttn.prop("disabled", false);
    } else {
      reviewText.val(reviewText.val().trim());
      reviewAlert.attr("hidden", false);
      postReviewBttn.prop("disabled", true);
    }
  });
})(jQuery);
