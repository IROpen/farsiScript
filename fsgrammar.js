const tinynlp = require('./earley-parser.js');

wordlist = new Map([
    ['است','ast'],
    ['.','noghte'],
    ['?','alamat_soal'],
    ['(','parantez_baz'],
    [')','parantez_baste'],
    ['،','virgool'],
    ['؟','alamat_soal'],
    ['چیست','chist'],
    ['نوعی','noyi'],
    ['در','harfe_ezafe'],
    ['با','harfe_ezafe'],
    ['از','harfe_ezafe'],
    ['تا','harfe_ezafe'],
    ['به','harfe_ezafe'],
    ['برای','harfe_ezafe'],
    ['هر','har'],
    ['کن','kon'],
    ['را','ra'],
    ['سپس','sepas'],
    ['یعنی','yani'],
]);


fsg = new tinynlp.Grammar([
    'root -> assign noghte | func_assign noghte | ask alamat_soal | cmd noghte | cmd_assign noghte',
    'cmd_root -> cmd',
    'cmd -> cmd_tak | cmd_tak sepas cmd',
    'cmd_tak -> eval_task ra esm kon | eval_task ra eval_motam_list esm kon | eval_motam_list esm kon | esm kon',
    'assign -> esm eval_task ast | esm virgool eval_task ast' ,
    'func_assign -> esm input virgool eval_task ast | esm input eval_motam_list virgool eval_task ast',
    'input -> eval_task | har esm' ,
    'eval_task -> noyi esm | parantez_baz eval_task parantez_baste | num esm | num | esm | obj | esm eval_task | esm eval_task eval_motam_list' ,
    'eval_motam_list -> eval_motam_list eval_motamam | eval_motamam',
    'eval_motamam -> harfe_ezafe eval_task',
    'ask -> eval_task chist' ,
    'cmd_assign -> esm kon yani cmd',
]);
fsg.terminalSymbols = function(token){
    if (wordlist.has(token)){
        let op = wordlist.get(token);
        if (typeof op == 'string')
            return [op];
        else
            return op;
    }
    if( token.match(/^\d+$/) ) return ['num'];
    if (token[0] == '"' || token[0] == '{' || token[0] == '[') return ['obj'];
    return ['esm'];
}

function parseArabic(str) {
    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
        return d.charCodeAt(0) - 1632; // Convert Arabic numbers
    }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
        return d.charCodeAt(0) - 1776; // Convert Persian numbers
    });
}

function tokenize(text){
    var qd=0,bd=0;
    text = text.replace(x=>(x=='\n'?' ':x)).split('');
    for(let i=0;i<text.length;i++){
	let c = text[i];
	if (c=='"') qd^=1;
	if (c=='{' || c=='[') bd++;
	if (c=='}' || c==']') bd--;
	if (c==' ' && bd==0 && qd==0) text[i]='\n';
    }
    return text.join('').split('\n').filter(Boolean);
}

function fparse(text,rootRule = 'root'){
    text=tokenize(parseArabic(text));
    //console.log(text);
    let chart = tinynlp.parse(text, fsg, rootRule);
    let trees = chart.getFinishedRoot(rootRule).traverse();                
    return trees;
}

module.exports = fparse;

