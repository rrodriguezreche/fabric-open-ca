const gulp = require('gulp');
const watch = require('gulp-watch');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
require('ansicolor').nice;
const log = require('ololog').configure({
  separator: ' | ',
  indent: { level: 1 },
  time: {
    yes: true,
    print: x => x.toUTCString().darkGray
  },
  locate: false
});

const ERROR = '[ERROR]'.red;
const WARNING = '[WARNING]'.orange;
const INFO = '[INFO]'.cyan;

gulp.task('default', async () => {
  console.log('Options: ', 'test');
});

gulp.task('watch', async cb => {
  await reset();
  await build();
  start();
  runNextJs();

  watch([path.resolve(`${process.cwd()}/ca/*`)], cb => {
    reset()
      .then(build)
      .then(start);
  });

  //   watch([`./contracts/**/${contractToTest}.sol`], cb => {
  //     compileContractsAndRunTest(cb);
  //   });

  //   watch([`./test/**/*.js`], cb => {
  //     test(cb);
  //   });
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

  return new Promise((resolve, reject) => {
    const cmd = spawn('npm', ['run', 'next']).on('error', error => {
      log(ERROR, error);
      resolve();
    });
    cmd.stdout.on(
      'data',
      data => log(INFO, `${data}`) /*process.stdout.write(`${data}`)*/
    );
    cmd.stderr.on('data', data => log(ERROR, `${data}`));
    cmd.on('close', resolve);
  });
};

// const compileContractsAndRunTest = cb => {
//   console.log('\n===============\nCompiling\n===============\n');

//   exec(`truffle compile`, function(err, stdout, stderr) {
//     console.log(stdout);

//     if (err) {
//       console.log('Error running UNIX commands');
//       console.error(err);
//     }

//     if (stderr) {
//       console.error(stderr);
//     }

//     if (!err & !stderr) {
//       test(cb);
//     }
//   });
// };

// const test = cb => {
//   console.log('\n===============\nTesting\n===============\n');

//   if (contractToTest !== '*') {
//     runOneTest(`${contractToTest}`);
//   } else if (cb && cb.history && cb.history[0]) {
//     const contracts = fs.readdirSync('./contracts');

//     for (let i = 0; i < contracts.length; i++) {
//       contracts[i] = contracts[i].replace('.sol', '');
//     }

//     let fileName = path
//       .basename(cb.history[0])
//       .replace('.sol', '')
//       .replace('.js', '');

//     if (contracts.includes(fileName)) {
//       runOneTest(`${fileName}`);
//     } else {
//       runAllTests();
//     }
//   } else {
//     runAllTests();
//   }
// };

// const runAllTests = () => {
//   const cmd = spawn('truffle', ['test']).on('error', error => {
//     console.log('Error running UNIX command');
//     console.error(error);
//   });

//   cmd.stdout.on('data', data => process.stdout.write(`${data}`));

//   cmd.stderr.on('data', data => console.error(`${data}`));

//   cmd.on('close', () =>
//     console.log('\n===============\nFinished\n===============\n')
//   );
// };

// const runOneTest = test => {
//   const cmd = spawn('truffle', ['test', `./test/${test}.js`]).on(
//     'error',
//     error => {
//       console.log('Error running UNIX command');
//       console.error(error);
//     }
//   );

//   cmd.stdout.on('data', data => process.stdout.write(`${data}`));

//   cmd.stderr.on('data', data => console.error(`${data}`));

//   cmd.on('close', () =>
//     console.log('\n===============\nFinished\n===============\n')
//   );
// };
