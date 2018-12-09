FSI = {
    defs:{
	varf:x=>x,
	funcf:(fname,param,motamam)=>(fname+' '+param),
    },
    varlist : new Map([]),
    funclist : new Map([
    ['منها-منها' , 
    [ function(param,motamam){ return param - 1 ; } ] ],
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
        
    matchMotamam : function(moa,mob){
        if (moa.length != mob.length) return false;
        for (let i = moa.length - 1 ; i>=0 ; i--){
            if ('value' in moa[i] && 'value' in mob[i] && mob[i].value != moa[i].value){
                return false;
            } 
        }
        return true;
    },
    evlMotamamList : async function(tr){
        if (tr.subtrees.length == 1){
            let ts = tr.subtrees[0];
            return [ { harfeEzafe : ts.subtrees[0].subtrees[0].root[0] , value : await FSI.evl(ts.subtrees[1])  } ];
        }
    },
    runFunc : async function(fname,param,motamam){
	if (motamam == undefined) motamam = [];
	const func = FSI.funclist.get(fname);
        if (func == undefined) return await FSI.defs.funcf(fname,param,motamam);
        for (let i = func.length - 1;i>=0;i--){
            //console.log(func[i]);
            let jav = await func[i](param,motamam);
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
            if (ts.root == 'str'){
                return ts.subtrees[0].root[0].slice(1, -1);
            }
            if (ts.root == 'num'){
                return Number(ts.subtrees[0].root);
            }
            if (ts.root == 'esm'){
		if (FSI.varlist.has(ts.subtrees[0].root[0])){
                    return FSI.varlist.get(ts.subtrees[0].root[0]);
		}
		else{
		    return FSI.defs.varf(ts.subtrees[0].root[0]);
		}
	    }
        }
        if (tr.subtrees.length == 2){
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
        let backup = [];
        dic.forEach((x,y)=>{ if (FSI.varlist.has(y)) backup.push([y,FSI.varlist.get(y)]); });
        dic.forEach((x,y)=>FSI.varlist.set(y,x));
        let retval = await FSI.evl(tr);
        dic.forEach((x,y)=>FSI.varlist.delete(y));
        backup.forEach(x=>FSI.varlist.set(x[0],x[1]));
        return retval;
    },
    treeToText : function f(tr){
        if (!tr.subtrees || tr.subtrees.length == 0){
            return tr.root;
        }
        return tr.subtrees.map(f).join(' ');
    },
    evlCmdTak : async function (tr){
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
            let vn = ts.subtrees.find(x=>(x.root == "esm")).subtrees[0].root[0];
            let val = await FSI.evl(ts.subtrees.find(x=>(x.root == "eval_task")));
            FSI.varlist.set(vn,val);
            return "فهمیدم .";
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
