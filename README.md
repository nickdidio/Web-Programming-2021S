# Web-Programming-2021S

Deciding on a movie for movie night is hard. With so many options from over 100 years of cinema, everyone agreeing on one movie can be quite difficult. Our web application seeks to ease the experience of picking a movie, leaving more time for buying snacks. The way we aim to make movie selection easy by removing the largest obstacles to searching: large selection, unhelpful discussion, and the search for a “better” option.
The way we remove these obstacles is by focusing the list of movies groups pick from. Each group will grow a watchlist based on the watchlists of individual users. Once the group watchlist is made the users can tighten by genre or watchtime. We also help the users choose by simplifying the question users ask themselves when seeing a movie, instead of asking the room “Does everyone want to watch this?” to an easier “Do I want to watch this?” which individuals can decide for themselves independently and quickly. Also, by taking the first movie agreed upon by the group, we remove possible indecision from between two or more choices everyone would watch.

# How To Run

In order to seed the database run "npm run seed", this will populate the databases with users,
groups, reviews, and movies

# IMPORTANT: (1) To test simultaneous functionality you will need to run each user in their own browser. Different tabs in the same browser will cause conflicts (multiple users in multiple browser sessions)

# (2) This application works best with only ONE user (Group Leader) and no one else.

Home Page: Main page where users can create decision groups, join decision groups, leave decision groups, edit their profile, edit their want to watch list, and edit their have watched list.

User Profile: Each user will have a username, password, display name, a list of movies they would like to watch, a list of movies they have watched before, and a list of decision groups they have joined before.

Run "npm start" in command line to set up the server, the home page will be available at "http://localhost:3000/"
