FSI = {
    defs:{
	funcf:(fname,param,motamam)=>{
	    if (param == undefined){
		return fname;
	    }
	    return (fname+' '+param);
	}
    },
    varlist : new Map([]),
    funclist : new Map([
    ['منفی' , 
    [ function(param,motamam){ return - param ; } ] ],
    ['جمع' , 
    [ function(param,motamam){ return param+motamam[0].value ; } ] ],
    ['ضرب' , 
    [ function(param,motamam){ return param*motamam[0].value ; } ] ],    
    ]),
    
    typelist : new Map([
    ['چیز' , 
    {par:'چیز' , members:[] } ],
    ['میوه' , 
    {par:'چیز' , members:[] } ],
    ['انسان' , 
    {par:'چیز' , members:[] } ],
    ]),

    tasklist : new Map([
	['صبر' , 
	 async function(param,motamam){
	     const delay = function (ms){
		 return new Promise(resolve=>{
		     setTimeout(resolve,ms)
		 });
	     }
	     await delay(param);
	 } ],
	
    ]),
    
    
    ClassicType : function(id,tpn){
        this.id = id;
        this.type = tpn;
        this.toString = () => (this.type+'('+this.id+')');
    },

    UnitNum : class {
	constructor(val,unit){
	    this.value = val;
	    this.unit = unit;
	}
	toString(){
	    return this.value+' '+this.unit;
	}
    },
    
    matchMotamam : function(moa,mob){
        if (moa.length != mob.length) return false;
        for (let i = moa.length - 1 ; i>=0 ; i--){
            if ('value' in moa[i] && 'value' in mob[i] && mob[i].value != moa[i].value){
                return false;
            }
        }
        return true;
    },
    evlMotamamList : async function f(tr){
        if (tr.subtrees.length == 1){
            let ts = tr.subtrees[0];
            return [ { harfeEzafe : ts.subtrees[0].subtrees[0].root[0] , value : await FSI.evl(ts.subtrees[1])  } ];
        }
	if (tr.subtrees.length == 2){
	    let res = await f(tr.subtrees[0]);
	    let ts = tr.subtrees[1];
	    res.push({ harfeEzafe : ts.subtrees[0].subtrees[0].root[0] , value : await FSI.evl(ts.subtrees[1])  });
	    return res;
	}
    },
    runFunc : async function(fname,param,motamam){
	if (motamam == undefined) motamam = [];
	const func = FSI.funclist.get(fname);
        if (func == undefined) return await FSI.defs.funcf(fname,param,motamam);
        for (let i = func.length - 1;i>=0;i--){
            let jav = await func[i](param,motamam);
	    //console.log(jav);
	    if (jav != undefined ) return jav;
        }
        return await FSI.defs.funcf(fname,param,motamam);
    },
    evl : async function f(tr){
        if (tr.root == 'I') return tr.I;
        if (tr.subtrees[0].root == 'parantez_baz'){
            return await f(tr.subtrees[1]);
        }
        if (tr.subtrees[0].root == 'noyi'){
            const tpn = tr.subtrees[1].subtrees[0].root[0];
            if (!FSI.typelist.has(tpn)){
                return undefined;
            }
            const tp = FSI.typelist.get(tpn);
            const tyo = new FSI.ClassicType(tp.members.length,tpn);
            tp.members.push(tyo);
            return tyo;
        }        
        if (tr.subtrees.length == 1){
            let ts = tr.subtrees[0];
            if (ts.root == 'obj'){
                return JSON.parse(ts.subtrees[0].root[0]);
            }
            if (ts.root == 'num'){
                return Number(ts.subtrees[0].root);
            }
            if (ts.root == 'esm'){
		let func = ts.subtrees[0].root[0];
		return FSI.runFunc(func);
	    }
        }
        if (tr.subtrees.length == 2){
	    if (tr.subtrees[0].root == 'num'){
		return new FSI.UnitNum(Number(tr.subtrees[0].subtrees[0].root[0]),tr.subtrees[1].subtrees[0].root[0]);
	    }
            let ts = tr.subtrees[0];
            if (ts.root == 'esm'){
                let param = await f(tr.subtrees[1]);
                let func = ts.subtrees[0].root[0];
                //console.log(func);
                //console.log(FSI.funclist.get(func));
                return FSI.runFunc(func,param);
            }
        }
        if (tr.subtrees.length == 3){
            let ts = tr.subtrees[0];
            if (ts.root == 'esm'){
                let param = await f(tr.subtrees[1]);
                let motamam = await FSI.evlMotamamList(tr.subtrees[2]);
                let func = ts.subtrees[0].root[0];
                //console.log(func);
                //console.log(FSI.funclist.get(func));
                return FSI.runFunc(func,param,motamam);
            }
        }
    },
    evl_with_dic : async function (tr,dic){
        dic.forEach((val,funcname)=>{
	    //console.log(funcname,val);
	    if (!FSI.funclist.has(funcname)) FSI.funclist.set(funcname,[]);
	    FSI.funclist.get(funcname).push((param,motamam)=>{ if (param==undefined) return val; });
	});
        let retval = await FSI.evl(tr);
        dic.forEach((x,y)=>FSI.funclist.get(y).pop());
        return retval;
    },
    treeToText : function f(tr){
        if (!tr.subtrees || tr.subtrees.length == 0){
            return tr.root;
        }
        return tr.subtrees.map(f).join(' ');
    },
    evlCmdTak : async function (tr){
	if (tr.subtrees.length == 2){
	    //const param = await FSI.evl(tr.subtrees[0]);
	    const nam = tr.subtrees[0].subtrees[0].root[0];
	    const task = FSI.tasklist.get(nam);
	    await task(undefined,[]);
	    return;
	}
	if (tr.subtrees.length == 3){
	    const motam = await FSI.evlMotamamList(tr.subtrees[0]);
	    const nam = tr.subtrees[1].subtrees[0].root[0];
	    const task = FSI.tasklist.get(nam);
	    await task(undefined,motam);
	    return;
	}
	if (tr.subtrees.length == 4){
	    const param = await FSI.evl(tr.subtrees[0]);
	    const nam = tr.subtrees[2].subtrees[0].root[0];
	    const task = FSI.tasklist.get(nam);
	    //console.log(nam,task,FSI.tasklist);
	    await task(param,[]);
	    return;
	}
	if (tr.subtrees.length == 5){
	    const param = await FSI.evl(tr.subtrees[0]);
	    const motam = await FSI.evlMotamamList(tr.subtrees[2]);
	    const nam = tr.subtrees[3].subtrees[0].root[0];
	    const task = FSI.tasklist.get(nam);
	    //console.log(param,motam);
	    await task(param,motam);
	    return;
	}
    },
    evlCmd : async function(tr){
	if (tr.subtrees.length == 1){
	    return await FSI.evlCmdTak(tr.subtrees[0]);
	}
	if (tr.subtrees.length == 3){
	    await FSI.evlCmdTak(tr.subtrees[0]);
	    return await FSI.evlCmd(tr.subtrees[2]);
	}
    },
    run : async function (tr){
        let ts = tr.subtrees[0];
	if (ts.root == 'cmd'){
	    FSI.evlCmd(ts);
	    return "در حال انجام است .";
	}
	if (ts.root == 'ask'){
            let val = await FSI.evl(ts.subtrees[0]);
            return FSI.treeToText(ts.subtrees[0])+" ، "+val+" است .";
        }
        if (ts.root == 'assign'){
            let funcname = ts.subtrees.find(x=>(x.root == "esm")).subtrees[0].root[0];
            let val = await FSI.evl(ts.subtrees.find(x=>(x.root == "eval_task")));
            if (!FSI.funclist.has(funcname)) FSI.funclist.set(funcname,[]);
	    FSI.funclist.get(funcname).push((param,motamam)=>{ if (param==undefined) return val; });
	    return "فهمیدم .";
        }
	if (ts.root == 'cmd_assign'){
	    if (ts.subtrees.length == 4){
		let esm = ts.subtrees[0].subtrees[0].root[0];
		FSI.tasklist.set(esm,async () => (await FSI.evlCmd(ts.subtrees[3])));
	    }
	    return 'فهمیدم .';
	}
        if (ts.root == 'func_assign'){
            let funcname = ts.subtrees[0].subtrees[0].root[0];
            if (!FSI.funclist.has(funcname)) FSI.funclist.set(funcname,[]);
            let trp = ts.subtrees[1].subtrees[0];
            let mymotamam = [];
            let rulf = ts.subtrees[ts.subtrees.length - 2];
            //console.log(rulf);
            if (rulf.subtrees[0].root == 'noyi') rulf = {root:"I",I:FSI.evl(rulf)};
            //console.log(rulf);
            if (ts.subtrees[2].root != 'virgool'){
                mymotamam = FSI.evlMotamamList(ts.subtrees[2]);
            }
            if (trp.root == 'eval_task'){
                let myparam = await FSI.evl(trp);
                FSI.funclist.get(funcname).push( async function (param,motamam){
                    if (param == myparam && FSI.matchMotamam(motamam,mymotamam)){
                        return await FSI.evl(rulf);
                    }    
                    return undefined;
                }
                );
                return "فهمیدم .";
            } 
            if (trp.root == 'har'){
                FSI.funclist.get(funcname).push( async function (param,motamam){
                    if (FSI.matchMotamam(motamam,mymotamam)){
                        return await FSI.evl_with_dic(rulf,new Map([["او",param]]));
                    }    
                    return undefined;
                }
                );
                return "فهمیدم .";
            }
        }
    }, 
};

module.exports = FSI;
