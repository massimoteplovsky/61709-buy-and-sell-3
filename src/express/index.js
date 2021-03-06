'use strict';

const path = require(`path`);
const express = require(`express`);
const chalk = require(`chalk`);
const {createAPI} = require(`./axios-api`);
const ApiService = require(`./api-sevice/service`);

const {
  getOffersRouter,
  getMyRouter,
  getMainRouter
} = require(`./routes`);

const {
  HttpCode,
  DefaultPort,
  ExitCode,
  PUBLIC_DIR
} = require(`../constants`);

const service = new ApiService(createAPI());
const app = express();

app.use(express.static(path.resolve(__dirname, PUBLIC_DIR)));
app.use(express.urlencoded({extended: false}));

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.use(`/`, getMainRouter(service));
app.use(`/my`, getMyRouter(service));
app.use(`/offers`, getOffersRouter(service));

app.use((req, res) => res.status(HttpCode.NOT_FOUND).render(`errors/404`));
app.use((err, req, res, next) => {

  if (err) {
    console.error(chalk.red(err));

    if (err.response && err.response.status === HttpCode.NOT_FOUND) {
      res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    } else {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
    }
  }

  return next();
});

app.listen(DefaultPort.FRONT_SERVER, (err) => {

  if (err) {
    console.error(chalk.red(`Ошибка при создании сервера`, err));
    process.exit(ExitCode.ERROR);
  }

  console.log(`Server is running on port: ${DefaultPort.FRONT_SERVER}`);
});
