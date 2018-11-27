const FSI = require('./fsinterpreter');
const fparse = require('./fsgrammar');

module.exports = {
    eval : async x => {
	try{
	    const tr = fparse(x)[0];
	    return await FSI.run(tr);
	}catch(e){
	    //console.log(e);
	    return "متوجه نشدم .";
	}
    },
    FSI : FSI,
    fparse : fparse,
};
