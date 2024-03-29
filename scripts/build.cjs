// import { join } from "path";
// import fs from 'fs-extra'
const path = require('path')
const fs = require('fs-extra')
// build src dir into dist using swc
const addRootPath = (_path = '') => {
  if (_path === '' && !_path) throw 'no path specified on `addRootPath`';
  return path.join(__dirname, '..', _path);
}
const logError = (condition = false, message = '') => {
  if(condition) {
     console.error(message + '\n');
     process.exit(1)
  }
}
;(async () => {
  const isWatch = process.argv[2] === '--watch';
  const swcMainFilePath = addRootPath('node_modules/@swc/cli/bin/swc.js');
  const swcOpts = `src -d dist ${isWatch ? '-w' : ''} --copy-files -C module.type=es6`.split(' ');
  fs.removeSync(addRootPath('./dist'));
  logError(
     !fs.existsSync(addRootPath('src')),
     'No `src` folder exist at root level'
  )
  logError(
     !fs.existsSync(swcMainFilePath),
     'local SWC package not found. please install SWC and run script again. \nnpm i -D @swc/cli @swc/core'
  )
  swcOpts.forEach((opt) => {
    process.argv.push(opt)
  });
  require('../node_modules/@swc/cli/bin/swc.js');
})()