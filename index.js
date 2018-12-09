const FSI = require('./fsinterpreter');
const fparse = require('./fsgrammar');

FSI.tasklist.set('اجرا',async function(param,motamam){
    if (motamam.length==0){
	try{
	    const tr = fparse(param)[0];
	    return await FSI.run(tr);
	}finally{
	    //console.log(e);
	    return undefined;
	}
    }
    if (motamam[0].harfeEzafe == 'با'){
	var i = motamam[0].value;
	const tr = fparse(param)[0];
	while(i--){
	    await FSI.run(tr);
	    //console.log("runed ",param);
	}
    }
});

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
