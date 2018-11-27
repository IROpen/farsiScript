const FSI = require('./fsinterpreter');
const fparse = require('./fsgrammar');

module.exports = {
    eval : async x => {
	try{
	    const tr = fparse(x)[0];
	    return await FSI.run();
	}catch(e){
	    return "متوجه نشدم .";
	}
    },
    FSI : FSI,
    fparse : fparse,
};
