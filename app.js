const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

function convertDirectorTable(obj) {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
}

function convertMovieTable(obj) {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
}
function convertMovieName(obj) {
  return {
    movieName: obj.movie_name,
  };
}

//listofmovies
app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie;`;
  const moviesList = await db.all(moviesQuery);
  response.send(moviesList.map((each) => convertMovieName(each)));
});

//addingMovie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addingMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  await db.run(addingMovieQuery);
  response.send("Movie Successfully Added");
});

//GetMovie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movieObj = await db.get(getMovieQuery);
  console.log(movieObj);
  response.send(convertMovieTable(movieObj));
});

//UpdateMOvie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     WHERE movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DeleteMovie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `Delete FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//getDirectors
app.get("/directors/", async (request, response) => {
  const getDirQuery = `SELECT * FROM director;`;
  const dirObj = await db.all(getDirQuery);
  response.send(dirObj.map((each) => convertDirectorTable(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirMovieQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const responseObj = await db.all(getDirMovieQuery);
  response.send(responseObj.map((each) => convertMovieName(each)));
});

module.exports = app;
