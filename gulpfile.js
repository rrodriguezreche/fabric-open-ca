const gulp = require('gulp');
const watch = require('gulp-watch');
const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment');
require('ansicolor').nice;
const log = require('ololog').configure({
  separator: ' | ',
  indent: { level: 1 },
  time: {
    yes: true,
    print: x => moment(x).format('YYYY/MM/DD HH:mm:ss').darkGray
  },
  locate: false
});

const ERROR = '[ERRO]'.red;
const WARNING = '[WARN]'.yellow;
const INFO = '[INFO]'.cyan;

const filesToWatch = [
  path.resolve(`${process.cwd()}/ca/*`),
  path.resolve(`${process.cwd()}/docker-compose.yaml`)
];

let nextJsProcess = undefined;

gulp.task('watch', async cb => {
  reset() // Reset autogenerated artifacts
    .then(build) // Build docker images
    .then(start) // Run docker images
    .catch(error => log(ERROR, error))
    .finally(() => {
      // Run nextJS frontend and watch for changes to repeat the process
      // runNextJs();
      watch(filesToWatch, cb => {
        reset()
          .then(build)
          .then(start)
          // .then(() => {
          //   if (nextJsProcess) {
          //     // if the fabric-ca-server has been reset and rebuilt,
          //     // we need to generate next's admin cryptostore again
          //     nextJsProcess.stdin.write('rs\n');
          //   }
          // })
          .catch(error => log(ERROR, error));
      });
    });
});

const build = cb => {
  log(INFO, 'Building images');

  return new Promise((resolve, reject) => {
    const cmd = spawn('npm', ['run', 'docker-build']).on('error', error => {
      log(ERROR, error);
      resolve();
    });
    cmd.stdout.on(
      'data',
      data => log(INFO, `${data}`) /*process.stdout.write(`${data}`)*/
    );
    cmd.stderr.on('data', data => log(`${data}`));
    cmd.on('close', resolve);
  });
};

const reset = cb => {
  log(INFO, 'Reset state');

  return new Promise((resolve, reject) => {
    const cmd = spawn('npm', ['run', 'reset']).on('error', error => {
      log(ERROR, error);
      resolve();
    });
    cmd.stdout.on(
      'data',
      data => log(INFO, `${data}`) /*process.stdout.write(`${data}`)*/
    );
    cmd.stderr.on('data', data => log(`${data}`));
    cmd.on('close', resolve);
  });
};

const start = cb => {
  log(INFO, 'Building images');

  return new Promise((resolve, reject) => {
    const cmd = spawn('npm', ['run', 'start']).on('error', error => {
      log(ERROR, error);
      resolve();
    });
    cmd.stdout.on(
      'data',
      data => log(INFO, `${data}`) /*process.stdout.write(`${data}`)*/
    );
    cmd.stderr.on('data', data => log(`${data}`));
    cmd.on('close', resolve);
  });
};

const runNextJs = () => {
  log(INFO, 'Starting NextJS');

  nextJsProcess = spawn('npm', ['run', 'dev'], {
    cwd: `${path.resolve(process.cwd())}/app`
  }).on('error', error => {
    log(ERROR, error);
  });
  nextJsProcess.stdout.on(
    'data',
    data => log(INFO, `${data}`) /*process.stdout.write(`${data}`)*/
  );
  nextJsProcess.stderr.on('data', data => log(ERROR, `${data}`));
  nextJsProcess.on('close', () => {
    log(WARNING, 'NextJs closed');
  });
};
