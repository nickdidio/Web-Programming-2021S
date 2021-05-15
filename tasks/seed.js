const { movies, reviews, groups, pastSessions, users } = require("../data");

const connection = require("../config/mongoConnection.js");



const howlObj = {
  title: "Howl's Moving Castle",
  desc: "When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking castle.",
  img: "https://image.tmdb.org/t/p/w500/TkTPELv4kC3u1lkloush8skOjE.jpg",
  releaseYear: "2004-11-19",
  runtime: 119,
  mpaaRating: "NR",
  genre: ["Fantasy", "Animation", "Adventure"],
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
    //console.log(group1);
  } catch (e) {
    console.log(e);
  }

  try {
    howl = await movies.createMovie(...Object.values(howlObj));
    //console.log(howl);
  } catch (e) {
    console.log(e);
  }

  try {
    inception = await movies.createMovie(...Object.values(inceptionObj));
    //console.log(inception);
  } catch (e) {
    console.log(e);
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
      console.log(await movies.getAllMovies());
    } catch (e) {
      console.log(e);
    }

    //Test adding movies to users then creating a session
    let sessionDate = group1.currentSession.sessionDate;
    let sessionMembers = group1.currentSession.sessionMembers;
    let voteCountNeeded = 2;
    let howlId = howl._id
    let sorryId = sorry._id
    let inceptionId = inception._id
    let movieList = [{movie: howlId, votes: 0}, {movie: sorryId, votes: 0}, {movie: inceptionId, votes:0}];
    let filter = group1.currentSession.filters
    let chosen = group1.currentSession.chosen
    let active = false
    let updatedSession = {sessionDate, sessionMembers, voteCountNeeded, movieList, filter, chosen, active}
    console.log("Hey listen!")
    console.log(group1)
    try {
      await users.addToWatchList(fawkes._id.toString(), howl._id.toString());
      await users.addToWatchList(fawkes._id.toString(), inception._id.toString());
      await users.addToWatchList(fawkes._id.toString(), sorry._id.toString());
      await users.addToWatchList(reilly._id.toString(), sorry._id.toString());
      // let list2 = await groups.updateWatchList(group1._id.toString(), [], reilly._id.toString())
      // let list1 = await groups.updateWatchList(group1._id.toString(), list2, fawkes._id.toString())
      // console.log(list2)
      // await groups.createSession(group1._id.toString(), 3, []);
      // let group1new = await groups.updateSession(group1._id.toString(), updatedSession)
      // let vote1 = await groups.addVote(group1._id.toString(), howl._id)
      // let vote2 = await groups.addVote(group1._id.toString(), inception._id)
      // let vote3 = await groups.addVote(group1._id.toString(), howl._id)
      // console.log(vote1)
      // console.log(vote2);
      // console.log(vote3)
      // console.log(group1new)
      let filteredList = await groups.applyFilters({genres: [], runtime: 0, mpaa: 'PG'}, howl._id)
      console.log(filteredList);
    }catch (e) {
      console.log(e)
    }

  await db.serverConfig.close();

  console.log("Done!");
};

main();
