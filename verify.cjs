const assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const elements=new Map(), events={}, timers=new Map(), audio=[];let timerId=0;
function el(key){const classes=new Set();return {dataset:{key},value:'0.5',events:{},classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},toggle(c,on){on?classes.add(c):classes.delete(c)},contains(c){return classes.has(c)}},addEventListener(k,fn){this.events[k]=fn},setAttribute(){},removeAttribute(){},replaceChildren(){},appendChild(){},closest(){return null}}}
const keys=[...'awsedftgyhujkolp;'].map(el);
for(const id of ['volume','volumeValue','soundButton','tutorialButton','tutorialNotes','audioStatus','showKeys','practiceButton','practiceLane','practiceStatus','tutorialLane'])elements.set(id,el());
class Audio{constructor(src){this.src=src;this.count=0;audio.push(this)}play(){this.count++;return Promise.resolve()}pause(){}}
const document={createElement:()=>el(),hidden:false,querySelectorAll:()=>keys,querySelector:()=>el(),getElementById:id=>elements.get(id),addEventListener:(k,fn)=>events[k]=fn};
const ctx=vm.createContext({document,window:{addEventListener:(k,fn)=>events[k]=fn},Audio,setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId},clearTimeout:id=>timers.delete(id)});
vm.runInContext(fs.readFileSync('src/scripts/engine.js','utf8'),ctx);const ev=s=>vm.runInContext(s,ctx),click=id=>elements.get(id).events.click();
assert.equal(audio.length,17);assert.ok(audio.every(a=>a.volume===0.5));
elements.get('volume').value='0.23';elements.get('volume').events.input();assert.ok(audio.every(a=>a.volume===0.23));click('soundButton');assert.ok(audio.every(a=>a.muted));click('soundButton');assert.ok(audio.every(a=>!a.muted));
click('tutorialButton');assert.equal(ev('tutorialRunning'),true);assert.equal([...timers.values()].filter(t=>t.ms===750).length,1);click('tutorialButton');assert.equal(timers.size,0);
click('tutorialButton');keys[0].events.click();assert.equal(ev('tutorialRunning'),true);assert.equal(audio[0].count,1);
const ke={key:'A',target:el(),preventDefault(){}};events.keydown(ke);assert.equal(audio[0].count,2);events.keydown({...ke,repeat:true});events.keydown({...ke,target:{closest:()=>true}});assert.equal(audio[0].count,2);
events.keydown({key:'Escape'});assert.equal(timers.size,0);click('tutorialButton');document.hidden=true;events.visibilitychange();assert.equal(timers.size,0);document.hidden=false;
click('tutorialButton');let steps=0;while(ev('tutorialStage')==='listen'){const e=[...timers].find(([,t])=>t.ms===750);assert.ok(e);timers.delete(e[0]);e[1].fn();assert.ok(++steps<30)}assert.equal(steps,24);assert.equal(ev('tutorialStage'),'play');for(const key of ev('[...sequence]'))events.keydown({key,target:el(),preventDefault(){}});assert.equal(ev('tutorialRunning'),false);events.keydown({key:'Escape'});assert.equal(timers.size,0);for(const a of audio)assert.ok(fs.existsSync(a.src));
console.log('PASS: 17 notas, volume, silêncio, tutorial único/parada/reinício/conclusão, teclado, repetição, campos, Esc e página oculta. DOM e áudio simulados.');

click('practiceButton');assert.equal(ev('practiceRunning'),true);assert.equal(ev('practiceIndex'),0);
keys[1].events.click();assert.equal(ev('practiceIndex'),0);assert.ok(keys[1].classList.contains('wrong'));assert.ok(elements.get('practiceStatus').classList.contains('error'));assert.match(elements.get('practiceStatus').textContent,/Você tocou W/);
keys[0].events.click();assert.equal(ev('practiceIndex'),1);assert.ok(!keys[1].classList.contains('wrong'));assert.ok(!elements.get('practiceStatus').classList.contains('error'));
click('practiceButton');assert.equal(ev('practiceRunning'),false);
click('practiceButton');assert.equal(ev('practiceIndex'),0);
for(const key of ['a','s','d','t','t','d','s','a']){events.keydown({key,target:el(),preventDefault(){}})}
assert.equal(ev('practiceRunning'),false);assert.equal(ev('practiceIndex'),8);assert.match(elements.get('practiceStatus').textContent,/concluído/);
click('practiceButton');click('tutorialButton');assert.equal(ev('practiceRunning'),false);assert.equal(ev('tutorialRunning'),true);
click('practiceButton');assert.equal(ev('tutorialRunning'),false);events.keydown({key:'Escape'});assert.equal(ev('practiceRunning'),false);
click('practiceButton');document.hidden=true;events.visibilitychange();assert.equal(ev('practiceRunning'),false);
console.log('PASS: treino aguarda acerto, erro não avança, reinício, notas repetidas, conclusão e exclusão entre modos; Esc e saída interrompem.');

document.hidden=false;click('practiceButton');keys[1].events.click();const errorTimeout=[...timers].find(([,t])=>t.ms===800);assert.ok(errorTimeout);timers.delete(errorTimeout[0]);errorTimeout[1].fn();assert.ok(!keys[1].classList.contains('wrong'));assert.ok(elements.get('practiceStatus').classList.contains('error'));click('practiceButton');assert.ok(!elements.get('practiceStatus').classList.contains('error'));
console.log('PASS: erro visual, mensagem, limpeza ao acertar/parar e temporizador de destaque; tutorial com escuta e prática guiada.');
