import test from 'node:test';import assert from 'node:assert/strict';import {calculate,quizStep,isOwner,trustedUrl,extractResponse,fineCheck,disciplineMenu,disciplineRules} from '../src/core.js';
const eos=(b,reason)=>calculate({kind:'end_service',a:6000,b,reason});
test('ordinary EOS',()=>assert.match(eos(6,'ordinary'),/21,000.00/));
test('resignation boundary',()=>{assert.match(eos(5,'resignation'),/5,000.00/);assert.match(eos(6,'resignation'),/14,000.00/);assert.match(eos(1,'resignation'),/0.00/);assert.match(eos(10,'resignation'),/45,000.00/)});
test('no assumed reason',()=>assert.match(eos(6,undefined),/ناقصة/));
test('overnight',()=>assert.match(calculate({kind:'shift',start:'19:41',end:'06:58'}),/11 ساعة و17/));
test('leave days',()=>assert.match(calculate({kind:'leave_days',start:'2026-11-29',end:'2026-12-10'}),/11 يوم/));
test('salary',()=>assert.match(calculate({kind:'partial_salary',a:2000,b:16}),/1,066.67/));
test('overtime',()=>assert.match(calculate({kind:'overtime',a:25,b:15,c:3}),/97.50/));
test('quiz',()=>{let s=quizStep(null,'start').state;for(let i of [1,1,0,1,1])s=quizStep(s,i).state;let r=quizStep(s,0);assert.equal(r.score,6);assert.equal(r.state,null)});
test('owner only',()=>{let u={message:{from:{id:12},chat:{id:12,type:'private'},text:'x'}};assert.equal(isOwner(u,'12'),true);assert.equal(isOwner(u,'13'),false);assert.equal(isOwner(u,''),false);u.message.chat.type='group';assert.equal(isOwner(u,'12'),false)});
test('official citation domains',()=>{assert.equal(trustedUrl('https://www.hrsd.gov.sa/x'),true);assert.equal(trustedUrl('https://hrsd.gov.sa.example.com/x'),false);assert.equal(extractResponse({output:[{content:[{type:'output_text',text:'a',annotations:[{type:'url_citation',url:'https://www.qiwa.sa/'},{type:'url_citation',url:'https://evil.com/'}]}]}]}).urls.length,1)});

test('fine limits',()=>{assert.match(fineCheck(200,900,150),/يتجاوز السقف الشهري/);assert.match(fineCheck(200,0,1001),/تتجاوز سقف المخالفة/);assert.match(fineCheck(200,900,100),/لا يتجاوز السقفين/);assert.match(fineCheck(-1,0,0),/ناقصة/)});
test('discipline quiz',()=>{let s=quizStep(null,'discipline').state;for(let i of [1,0,0,1])s=quizStep(s,i).state;let r=quizStep(s,1);assert.equal(r.score,5);assert.equal(r.total,5);assert.equal(r.topic,'discipline')});
test('discipline menu and rules',()=>{assert.match(disciplineMenu,/\/fine/);assert.match(disciplineRules,/180/);assert.match(disciplineRules,/المادة 72/)});
