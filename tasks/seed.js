const { movies, reviews, groups, pastSessions, users } = require("../data");

const connection = require("../config/mongoConnection.js");



const howlObj = {
  title: "Howl's Moving Castle",
  desc: "When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking castle.",
  img: "https://image.tmdb.org/t/p/w500/TkTPELv4kC3u1lkloush8skOjE.jpg",
  releaseYear: "2004-11-19",
  runtime: 119,
  mpaaRating: "PG",
  genre: ["Fantasy", "Animation", "Adventrue"],
  TMDbId: 4935,
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
  let howl, inception, sorry, fawkes, generic, reilly, booth, group1;
  //Reset database 
  const db = await connection();
  await db.dropDatabase();

  try {
    fawkes = await users.addUser("job@place.com", "john", "johnson", "notanassassin", "remember5november");
    generic = await users.addUser("generic@mail.com", "user", "name", "username", "password");
    reilly = await users.addUser("rtfitz99@gmail.com", "Reilly", "Fitzgerald", "ReillyFitz", "coffee");
    booth = await users.addUser("lincoln@theatre.gov", "John Wilkes", "Booth", "BoomHeadShot", "sicsempertyrannus");
    group1 = await groups.createGroup(reilly._id, "The Boyz")
    await groups.addGroupMember(group1._id.toString(), fawkes._id.toString());
    await groups.addGroupMember(group1._id.toString(), generic._id.toString());
    group1 = await groups.getGroupById(group1._id.toString())
    console.log(group1);
  } catch (e) {
    console.log(e);
  }

  try {
    howl = await movies.createMovie(...Object.values(howlObj));
    console.log(howl);
  } catch (e) {
    console.log(e);
  }

  try {
    inception = await movies.createMovie(...Object.values(inceptionObj));
    console.log(inception);
  } catch (e) {
    console.log(e);
  }

  try {
    sorry = await movies.createMovie(...Object.values(sorryObj));
    console.log(sorry);
  } catch (e) {
    console.log(e);
  }

  try {
    console.log(await movies.getMovieById(howl._id));
  } catch (e) {
    console.log(e);
  }

  try {
    console.log(await movies.getAllMovies());
  } catch (e) {
    console.log(e);
  }

  try {
    review1 = await reviews.createReview(
      "2021-05-03",
      "Amazingful",
      5,
      "username1",
      howl._id.toString()
    );

    review2 = await reviews.createReview(
      "2021-05-02",
      "Okayful",
      3,
      "username2",
      howl._id.toString()
    );

    review3 = await reviews.createReview(
      "2021-05-01",
      "Awful",
      1,
      "username3",
      howl._id.toString()
    );
  } catch (e) {
    console.log(e);
  }

  try {
    console.log(await reviews.getMovieReviews(howl._id));
  } catch (e) {
    console.log(e);
  }

    try {
      console.log(await movies.deleteMovie(howl._id));
    } catch (e) {
      console.log(e);
    }

    try {
      console.log(await movies.getAllMovies());
    } catch (e) {
      console.log(e);
    }

    //Test adding movies to users then creating a session
    try {
      await users.addToWatchList(fawkes._id.toString(), howl._id.toString());
      await users.addToWatchList(fawkes._id.toString(), inception._id.toString());
      await users.addToWatchList(reilly._id.toString(), sorry._id.toString());
      await groups.createSession(group1_id.toString(), 3, []);
    }catch (e) {
      console.log(e)
    }

  await db.serverConfig.close();

  console.log("Done!");
};

main();
