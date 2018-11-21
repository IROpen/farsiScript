FSI = {
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
    evlMotamamList : function(tr){
        if (tr.subtrees.length == 1){
            let ts = tr.subtrees[0];
            return [ { harfeEzafe : ts.subtrees[0].root[0] , value : FSI.evl(ts.subtrees[1])  } ];
        }
    },
    runFunc : function(func,param,motamam){
        if (func == undefined) return undefined;
        if (motamam == undefined) motamam = [];
        for (let i = func.length - 1;i>=0;i--){
            //console.log(func[i]);
            let jav = func[i](param,motamam);
            if (jav != undefined ) return jav;
        }
        return undefined;
    },
    evl : function f(tr){
        if (tr.root == 'I') return tr.I;
        if (tr.subtrees[0].root == 'parantez_baz'){
            return f(tr.subtrees[1]);
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
                return FSI.varlist.get(ts.subtrees[0].root[0]);
            }
        }
        if (tr.subtrees.length == 2){
            let ts = tr.subtrees[0];
            if (ts.root == 'esm'){
                let param = f(tr.subtrees[1]);
                let func = ts.subtrees[0].root[0];
                if (!FSI.funclist.has(func)) return undefined;
                //console.log(func);
                //console.log(FSI.funclist.get(func));
                return FSI.runFunc(FSI.funclist.get(func),param);
            }
        }
        if (tr.subtrees.length == 3){
            let ts = tr.subtrees[0];
            if (ts.root == 'esm'){
                let param = f(tr.subtrees[1]);
                let motamam = FSI.evlMotamamList(tr.subtrees[2]);
                let func = ts.subtrees[0].root[0];
                if (!FSI.funclist.has(func)) return undefined;
                //console.log(func);
                //console.log(FSI.funclist.get(func));
                return FSI.runFunc(FSI.funclist.get(func),param,motamam);
            }
        }
    },
    evl_with_dic : function (tr,dic){
        let backup = [];
        dic.forEach((x,y)=>{ if (FSI.varlist.has(y)) backup.push([y,FSI.varlist.get(y)]); });
        dic.forEach((x,y)=>FSI.varlist.set(y,x));
        let retval = FSI.evl(tr);
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
    run : function (tr){
        let ts = tr.subtrees[0];
        if (ts.root == 'ask'){
            let val = FSI.evl(ts.subtrees[0]);
            return FSI.treeToText(ts.subtrees[0])+" ، "+val+" است .";
        }
        if (ts.root == 'assign'){
            let vn = ts.subtrees.find(x=>(x.root == "esm")).subtrees[0].root[0];
            let val = FSI.evl(ts.subtrees.find(x=>(x.root == "eval_task")));
            FSI.varlist.set(vn,val);
            return "فهمیدم .";
        }
        if (ts.root == 'func_assign'){
            let funcname = ts.subtrees[0].subtrees[0].root[0];
            if (!FSI.funclist.has(funcname)) FSI.funclist.set(funcname,[]);
            let trp = ts.subtrees[1].subtrees[0];
            let mymotamam = [];
            let rulf = ts.subtrees[ts.subtrees.length - 2];
            console.log(rulf);
            if (rulf.subtrees[0].root == 'noyi') rulf = {root:"I",I:FSI.evl(rulf)};
            console.log(rulf);
            if (ts.subtrees[2].root != 'virgool'){
                mymotamam = FSI.evlMotamamList(ts.subtrees[2]);
            }
            if (trp.root == 'eval_task'){
                let myparam = FSI.evl(trp);
                FSI.funclist.get(funcname).push( function (param,motamam){
                    if (param == myparam && FSI.matchMotamam(motamam,mymotamam)){
                        return FSI.evl(rulf);
                    }    
                    return undefined;
                }
                );
                return "فهمیدم .";
            } 
            if (trp.root == 'har'){
                FSI.funclist.get(funcname).push( function (param,motamam){
                    if (FSI.matchMotamam(motamam,mymotamam)){
                        return FSI.evl_with_dic(rulf,new Map([["او",param]]));
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
