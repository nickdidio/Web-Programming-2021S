const { movies, reviews, groups, pastSessions, users } = require("../data");

const connection = require("../config/mongoConnection.js");



const howlObj = {
  title: "Howl's Moving Castle",
  desc: "When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking castle.",
  img: "https://image.tmdb.org/t/p/w500/TkTPELv4kC3u1lkloush8skOjE.jpg",
  releaseYear: "2004-11-19",
  runtime: 119,
  mpaaRating: "PG",
  genre: ["Fantasy", "Animation", "Adventure"],
  TMDbId: 4935,
};

const windObj = {
  title: "The Wind Rises",
  desc: "A lifelong love of flight inspires Japanese aviation engineer Jiro Horikoshi, whose storied career includes the creation of the A-6M World War II fighter plane.",
  img: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/jcjNEfMVwBrqDpj0hys1XmTwfpM.jpg",
  releaseYear: "2014-02-21",
  runtime: 126,
  mpaaRating: "PG-13",
  genre: ["War", "Animation", "History", "Drama", "Romance"],
  TMDbId: 149870,
};

const MKObj = {
  title: "Mortal Kombat",
  desc: "Washed-up MMA fighter Cole Young, unaware of his heritage, and hunted by Emperor Shang Tsung's best warrior, Sub-Zero, seeks out and trains with Earth's greatest champions as he prepares to stand against the enemies of Outworld in a high stakes battle for the universe.",
  img: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/xGuOF1T3WmPsAcQEQJfnG7Ud9f8.jpg",
  releaseYear: "2021-04-23",
  runtime: 110,
  mpaaRating: "R",
  genre: ["Action", "Fantasy", "Adventure"],
  TMDbId: 460465,
};

const soulObj = {
  title: "Soul",
  desc: "Joe Gardner is a middle school teacher with a love for jazz music. After a successful gig at the Half Note Club, he suddenly gets into an accident that separates his soul from his body and is transported to the You Seminar, a center in which souls develop and gain passions before being transported to a newborn child. Joe must enlist help from the other souls-in-training, like 22, a soul who has spent eons in the You Seminar, in order to get back to Earth.",
  img: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/xGuOF1T3WmPsAcQEQJfnG7Ud9f8.jpg",
  releaseYear: "2020-12-25",
  runtime: 101,
  mpaaRating: "PG",
  genre: ["Family", "Fantasy", "Animation", "Comedy", "Drama"],
  TMDbId: 508442,
};


const inceptionObj = {
  title: "Inception",
  desc: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
  img: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  releaseYear: "2010-07-15",
  runtime: 148,
  mpaaRating: "R",
  genre: ["Action", "Science", "Adventure"],
  TMDbId: 27205,
};

const sorryObj = {
  title: "Sorry to Bother You",
  desc: "In an alternate present-day version of Oakland, black telemarketer Cassius Green discovers a magical key to professional success – which propels him into a macabre universe.",
  img: "https://image.tmdb.org/t/p/w500/peTl1V04E9ppvhgvNmSX0r2ALqO.jpg",
  releaseYear: "2010-07-15",
  runtime: 112,
  mpaaRating: "R",
  genre: ["Fantasy", "Science-Fiction", "Comedy"],
  TMDbId: 424781,
};

const main = async () => {
  let howl, inception, sorry, fawkes, generic, reilly, booth, group1, nickerdoodles, d, group2, wind, mk, soul;
  //Reset database 
  const db = await connection();
  await db.dropDatabase();

  try {
    fawkes = await users.addUser("job@place.com", "john", "johnson", "notanassassin", "remember5november");
    generic = await users.addUser("generic@mail.com", "user", "name", "username", "password");
    reilly = await users.addUser("rtfitz99@gmail.com", "Reilly", "Fitzgerald", "ReillyFitz", "coffee");
    d = await users.addUser("idontknowdsemail@gmail.com", "D", "Newsome", "DNews", "coffee");
    nickerdoodles = await users.addUser("nickerdoodles@rocketmail.com", "Nick", "The Brick", "NickTheBrick", "password")
    booth = await users.addUser("lincoln@theatre.gov", "John Wilkes", "Booth", "BoomHeadShot", "sicsempertyrannus");
    group1 = await groups.createGroup(reilly._id.toString(), "Best Buds")
    group2 = await groups.createGroup(booth._id.toString(), "The Assassins")
    await groups.addGroupMember(group2._id.toString(), fawkes._id.toString());
    await groups.addGroupMember(group1._id.toString(), generic._id.toString());
    await groups.addGroupMember(group2._id.toString(), generic._id.toString());
    group1 = await groups.getGroupById(group1._id.toString())
    console.log(group1)
  } catch (e) {
    console.log(e);
  }

  try {
    howl = await movies.createMovie(...Object.values(howlObj));
    wind = await movies.createMovie(...Object.values(windObj));
    mk = await movies.createMovie(...Object.values(MKObj));
    soul = await movies.createMovie(...Object.values(soulObj));
    //console.log(howl);
  } catch (e) {
    console.log(e);
  }

  try {
    inception = await movies.createMovie(...Object.values(inceptionObj));
    console.log(inception);
  } catch (e) {
    //console.log(e);
  }

  try {
    sorry = await movies.createMovie(...Object.values(sorryObj));
    //console.log(sorry);
  } catch (e) {
    console.log(e);
  }

  try {
    //console.log(await movies.getMovieById(howl._id));
  } catch (e) {
    console.log(e);
  }

  try {
    //console.log(await movies.getAllMovies());
  } catch (e) {
    console.log(e);
  }

  try {
    let review1 = await reviews.createReview(
      "2021-05-03",
      "Amazingful",
      5,
      "ReillyFitz",
      howl._id.toString()
    );

    let review2 = await reviews.createReview(
      "2021-05-02",
      "Okayful",
      3,
      "notanassasin",
      howl._id.toString()
    );

    let review3 = await reviews.createReview(
      "2021-05-01",
      "Awful",
      1,
      "NickTheBrick",
      howl._id.toString()
    );
    let review4 = await reviews.createReview("2021-05-04", "Literally my favorite movie please watch this", 5, "ReillyFitz", wind._id.toString())
    let review5 = await reviews.createReview("2021-05-04", "meh", 4, "NickTheBrick", wind._id.toString())
    let review6 = await reviews.createReview("2020-05-04", "Literal Garbage", 2, "notanassassin", mk._id.toString())

  } catch (e) {
    console.log(e);
  }

  try {
    //console.log(await reviews.getMovieReviews(howl._id));
  } catch (e) {
    console.log(e);
  }

    try {
      //console.log(await movies.getAllMovies());
    } catch (e) {
      console.log(e);
    }
    try {
      //await users.addToWatchList(fawkes._id.toString(), howl._id);
      //await users.addToWatchList(fawkes._id.toString(), inception._id);
      await users.addToWatchList(fawkes._id.toString(), sorry._id);
      await users.addToWatchList(d._id.toString(), sorry._id);
      await users.addToWatchList(nickerdoodles._id.toString(), sorry._id);
      await users.addToWatchList(nickerdoodles._id.toString(), howl._id);
      await users.addToWatchList(reilly._id.toString(), sorry._id);
      await groups.setMovieToWatched([reilly._id], wind._id)
      await groups.setMovieToWatched([reilly._id], sorry._id)
    }catch (e) {
      console.log(e)
    }

  await db.serverConfig.close();

  console.log("Done!");
};

main();
