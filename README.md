TutorMatch
==========

A web app for matching tutors with students who wish to be tutored

## Usage

There are a few different ways to run the server

### Docker container

To build and start the app in a Docker container listening on port 8080, run
```sh
make start-docker
```
This will `npm install` any dependencies (if `node_modules` is missing), compile all necessary files, build the container, and start it. This includes a MariaDB server, and it will set the `DATABASE_URL` environment variable automatically.

To start the app in development mode, run
```sh
make start-docker-dev
```
This does the same as `start-docker`, but it will watch Typescript files for changes, compile them and restart the server. It also makes `node` listen on port 9229 for debuggers (`--inspect`).

For more tasks, see `Makefile`

### Local

The app can alse be ran outside of Docker. To build and run the app, run
```sh
make build
node .
```
There are certain environment variables that must be set for this to work

### Environment

Environment variables will be loaded from a [`.env`](https://github.com/motdotla/dotenv#usage) file in the root of the project. These will be overriden by process environment variables.

 - `PORT` *(default: 8080)* 
The port that the application will listen at
 - `PUBLIC_URI` *(default: `'http://localhost:$PORT'`)* 
The root URI that the application is serving from. This is used for generating URIs for links and redirects
 - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` **(required)** 
The client settings required to access [Google OAuth2 APIs](https://developers.google.com/identity/protocols/OAuth2)
 - `SESSION_SECRET` **(required)** 
The  [secret for `express-session`](https://github.com/expressjs/session#secret). Should be [randomly generated](https://randomkeygen.com/#ft_knox_pw).
 - `DATABASE_URL` **(required)** 
 A url specifying how to connect to the MySQL database. In the format `mysql://{user}:{pass}@{host}[:{port}]/{database}`
 If running in Docker, this will be set by the container.
