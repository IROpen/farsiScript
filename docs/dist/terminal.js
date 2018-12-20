class Terminal{
    constructor(id,options){
	options = options || {};
	options.fontsize = options.fontsize || '14px';
	this.onCmd = options.onCmd;
	this.cn = document.getElementById(id);
	this.cn.style.wordWrap = 'break-word';
	this.cn.style.fontsize = options.fontsize;
	this.cn.tabIndex = '0';
	this.cn.style.backgroundColor = 'black';
	this.cn.style.color = 'white';
	this.spn = document.createElement('span');
	this.spn.style.color='cyan';
	this.spn.innerHTML = '>>> ';
	this.cn.appendChild(this.spn);
	this.cq = document.createElement('input');
	this.cq.style.font = 'inherit';
	this.cq.style.color = 'white';
	this.cq.style.background = 'transparent';
	this.cq.style.outline = 'none';
	this.cq.style.border = 'none';
	this.cq.style.width = 'calc(100% - '+(5+this.spn.getBoundingClientRect().width)+'px)'
	this.cn.appendChild(this.cq);
	this.cn.onkeydown = (ke) => {
	    if (ke.key == 'Enter'){
		this.process(this.cq.value);
		this.cq.value = '';
		return;
	    }
	};
    }
    process(cmd){
	let spn = document.createElement('span');
	spn.style.color='cyan';
	spn.innerHTML = '>>> ';
	this.cn.insertBefore(spn,this.spn);
	let txt = document.createElement('span');
	txt.style.color = 'white';
	txt.textContent = cmd;
	this.cn.insertBefore(txt,this.spn);
	this.cn.insertBefore(document.createElement('br'),this.spn);
	if (this.onCmd){
	    this.onCmd(cmd);
	}
    }
    print(text){
	let txt = document.createElement('span');
	txt.style.color = 'white';
	txt.textContent = text;
	this.cn.insertBefore(txt,this.spn);
	this.cn.insertBefore(document.createElement('br'),this.spn);
    }
};
