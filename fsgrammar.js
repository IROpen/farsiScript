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
    ['هر','har'],
    ['کن','kon'],
    ['را','ra'],
]);


fsg = new tinynlp.Grammar([
    'root -> assign noghte | func_assign noghte | ask alamat_soal | cmd noghte',
    'cmd -> eval_task ra esm kon | eval_task ra eval_motam_list esm kon',
    'assign -> esm eval_task ast | esm virgool eval_task ast' ,
    'func_assign -> esm input virgool eval_task ast | esm input eval_motam_list virgool eval_task ast',
    'input -> eval_task | har esm' ,
    'eval_task -> noyi esm | parantez_baz eval_task parantez_baste | num | esm | str | esm eval_task | esm eval_task eval_motam_list' ,
    'eval_motam_list -> eval_motam_list eval_motamam | eval_motamam',
    'eval_motamam -> harfe_ezafe eval_task',
    'ask -> eval_task chist' ,
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
    if (token[0] == '"') return ['str'];
    return ['esm'];
}

function parseArabic(str) {
    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
        return d.charCodeAt(0) - 1632; // Convert Arabic numbers
    }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
        return d.charCodeAt(0) - 1776; // Convert Persian numbers
    });
}

function fparse(text){
    text=parseArabic(text);
    let rootRule = 'root';
    let chart = tinynlp.parse(text.match(/[^ ^"]+|"[^"]*"/g), fsg, rootRule);
    let trees = chart.getFinishedRoot(rootRule).traverse();                
    return trees;
}

module.exports = fparse;

