const FSI = require('./fsinterpreter');
const fparse = require('./fsgrammar');

FSI.tasklist.set('اجرا',async function(param,motamam){
    try{
	const tr = fparse(param,'cmd_root')[0].subtrees[0];
	if (motamam.length == 0){
	    return await FSI.evlCmd(tr);
	}
	if (motamam[0].harfeEzafe == 'با'){
	    var i = motamam[0].value;
	    while(i--){
		await FSI.evlCmd(tr);
		//console.log("runed ",param);
	    }
	}
    }catch(e){
	return;
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
