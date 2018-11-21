const FSI = require('./fsinterpreter');
const fparse = require('./fsgrammar');

module.exports = {
    eval : async x => await FSI.run(fparse(x)[0]),
    FSI : FSI,
    fparse : fparse,
};
