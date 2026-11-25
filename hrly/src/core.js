import {normalize,reply} from './legacy.js';
export const CONTRACT='https://www.hrsd.gov.sa/علاقات-العمل';
export const WORK='https://www.hrsd.gov.sa/شروط-العمل-وظروفه';
export const OFFICIAL=['hrsd.gov.sa','qiwa.sa','mudad.com.sa','gosi.gov.sa','boe.gov.sa','uqn.gov.sa','hrdf.org.sa','muqeem.sa','gov.sa'];
export const money=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' ريال';
const num=(n,min=0,max=1e9)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const invalid='المدخلات ناقصة أو غير صحيحة. تحقق من القيم.';
export function calculate({kind,a,b,c,reason,start,end}={}){
 switch(kind){
 case 'end_service': {
 if(!num(a,0.01)||!num(b,0,80)||!['ordinary','resignation','probation','article80','exception'].includes(reason))return invalid+' مطلوب الأجر الأخير ومدة الخدمة بالسنوات وسبب الإنهاء.';
 let full=a*(Math.min(b,5)/2+Math.max(b-5,0)), f=1;
 if(reason==='probation'||reason==='article80') f=0;
 if(reason==='resignation') f=b<2?0:b<=5?1/3:b<10?2/3:1;
 return `المكافأة التقديرية: ${money(full*f)}\nالمكافأة قبل أثر السبب: ${money(full)}\nالمادة 84، ونسب الاستقالة 85، مع مراعاة الاستثناءات بالمادة 87 وغيرها. تصنيف المادة 80 أو التجربة يجب التحقق من انطباقه نظاميًا. الأجر الأخير المستحق هو أساس الحساب؛ المدة المدخلة بالسنوات الكسرية. لا تشمل تصفية الراتب والإجازات.\n${CONTRACT}`; }
 case 'leave_balance': if(!num(a,0,365)||!num(b,0,366)||!num(c,0,1e4))return invalid;return `الرصيد التقديري للفترة: ${(a*b/365-c).toFixed(2)} يوم\nاستحقاق سنوي × أيام الفترة ÷ 365 − المستخدم. افتراض سنة 365 يومًا ولا يشمل الرصيد المرحّل أو فترات غير مستحقة؛ راجع سياسة الاستحقاق والعقد.`;
 case 'leave_days': return reply(`إجازة ${start??''} ${end??''}`);
 case 'shift': return reply(`دوام ${start??''} ${end??''}`);
 case 'partial_salary': if(!num(a,0.01)||!num(b,0,30))return invalid;return `الراتب الجزئي: ${money(a*b/30)}\nعلى أساس 30 يومًا، قبل الاستقطاعات.`;
 case 'overtime': if(!num(a,0.01)||!num(b,0,a)||!num(c,0,744))return invalid;return `الإضافي التقديري: ${money((a+b/2)*c)}\nأجر الساعة الفعلي + نصف أجر الساعة الأساسي، مضروبًا في الساعات. المادة 107.\n${WORK}`;
 case 'unused_leave': if(!num(a,0.01)||!num(b,0,1e4))return invalid;return `بدل الإجازة التقديري: ${money(a*b/30)}\nالأجر الشهري ÷ 30 × الأيام المستحقة غير المستخدمة. تحقق من الأجر المعتمد.`;
 case 'fine_check': return fineCheck(a,b,c);
 case 'insurance': if(!num(a,0.01)||!num(b,0,100))return invalid;return `الاشتراك حسب النسبة المدخلة: ${money(a*b/100)}\nلم تحدد الحاسبة النسبة النظامية؛ تختلف حسب الفئة والنظام ووقت الخضوع.\nhttps://www.gosi.gov.sa`;
 default:return invalid;
 }
}
export const DISCIPLINE='https://www.hrsd.gov.sa/knowledge-centre/articles/64405';
export const EMPLOYER_VIOLATIONS='https://www.hrsd.gov.sa/knowledge-centre/decisions-and-regulations/regulation-and-procedures/violations';
export const disciplineMenu=`المخالفات والجزاءات ⚖️
• التأخير والغياب والانصراف المبكر والزي الرسمي والتحضير والإهمال: صف الحالة دون بيانات شخصية؛ مع AI أراجع النظام واللائحة التي تذكرها.
• /discipline_rules — ضوابط المواد 66–73.
• /fine 200 150 50 — أجر اليوم، الغرامات المقتطعة هذا الشهر، الغرامة المقترحة بالريال؛ فحص سقف المادة 70 فقط.
• /discipline_notice — نموذج طلب إفادة.
• /discipline_quiz — اختبار جزاءات.
• /employer_violations — مخالفات المنشأة الحكومية (مختلفة عن جزاءات العامل).
لا تُفرض غرامة أو عقوبة دون مراجعة اللائحة المعتمدة والتحقيق والصلاحيات.`;
export const disciplineRules=`مراجعة قواعد التأديب (66–73):
66–67: أنواع الجزاءات المحددة نظامًا، وعدم فرض جزاء خارج النظام أو لائحة تنظيم العمل.
68: لا تشديد للتكرار بعد انقضاء 180 يومًا من إبلاغ الجزاء السابق.
69: راجع مهلة 30 يومًا من كشف المخالفة للاتهام، ومهلة 30 يومًا من انتهاء التحقيق وثبوتها لتوقيع الجزاء.
70: جزاء واحد للمخالفة؛ الغرامة الواحدة والاستقطاع الشهري للغرامات لا يتجاوز كل منهما أجر 5 أيام، والإيقاف بلا أجر لا يتجاوز 5 أيام شهريًا.
71–73: إبلاغ مكتوب، سماع الدفاع وتوثيق التحقيق، إبلاغ القرار وحق التظلم، وسجل الغرامات. التظلم لدى المنشأة خلال 30 يومًا باستثناء العطل الرسمية، ثم تراجع مدد البت والاعتراض القضائي بحسب المادة 72.
راجع النص الرسمي قبل اتخاذ قرار: ${CONTRACT}`;
export const disciplineNotice=`الموضوع: طلب إفادة بشأن مخالفة إدارية
الأخ/ [الاسم] المحترم
السلام عليكم ورحمة الله وبركاته،
نأمل تزويد إدارة الموارد البشرية بإفادتكم بشأن [وصف الواقعة] بتاريخ [التاريخ]، وإرفاق ما يدعم الإفادة إن وجد، لاستكمال مراجعة الواقعة قبل اتخاذ أي إجراء.
شاكرين تعاونكم.
إدارة الموارد البشرية`;
export function fineCheck(a,b,c){if(!num(a,0.01)||!num(b)||!num(c))return invalid;let limit=a*5,remaining=Math.max(0,limit-b);return `سقف الغرامة للمخالفة الواحدة: ${money(limit)}
المتبقي ضمن سقف استقطاع الغرامات للشهر: ${money(remaining)}
${c>limit?'الغرامة المقترحة تتجاوز سقف المخالفة الواحدة.':c>remaining?'استقطاع المقترح كاملًا الآن يتجاوز السقف الشهري.':'المقترح لا يتجاوز السقفين حسابيًا.'}
هذا فحص حسابي فقط، وليس إقرارًا بمشروعية الجزاء أو إذنًا بالخصم. المادة 70. ${CONTRACT}`;}
export const disciplineQuiz=[
 ['هل يجوز تشديد الجزاء بعد انقضاء 180 يومًا من إبلاغ الجزاء السابق؟',['نعم','لا','دائمًا حسب المشرف'],1,'المادة 68 تمنع التشديد في هذه الحالة.'],
 ['كم جزاء تأديبيًا يجوز توقيعه عن المخالفة الواحدة؟',['واحد','اثنان','ثلاثة'],0,'المادة 70.'],
 ['ما سقف استقطاع الغرامات من الأجر في الشهر الواحد؟',['أجر 5 أيام','أجر 10 أيام','نصف الراتب'],0,'المادة 70. هذا حد وليس ترخيصًا تلقائيًا بالغرامة.'],
 ['قبل توقيع الجزاء، ماذا تفعل؟',['تخصم مباشرة','تبلغ العامل وتسمع دفاعه وتوثق التحقيق','تكتفي بإخبار المشرف'],1,'المادة 71، مع مراعاة أحكام المخالفات البسيطة.'],
 ['ما مرجع تحديد الجزاء لمخالفة الزي؟',['أي مبلغ يختاره المشرف','لائحة تنظيم العمل المعتمدة والنظام','جدول عقوبات المنشآت دائمًا'],1,'المادة 67، وجداول عقوبات المنشآت ليست جزاءات العامل.']
];
export const quiz=[
 ['إذا كانت بداية الإجازة 29 نوفمبر وأول يوم مباشرة 10 ديسمبر، فكم يومًا تقويميًا؟',['10','11','12'],1,'يوم المباشرة لا يدخل في الإجازة.'],
 ['ما الحد الأدنى للإجازة السنوية قبل إكمال خمس سنوات متصلة؟',['14 يومًا','21 يومًا','30 يومًا'],1,'المادة 109. '+WORK],
 ['ما أساس مكافأة نهاية الخدمة الكاملة للسنوات الخمس الأولى؟',['نصف أجر شهر لكل سنة','أجر شهر لكل سنة','أجر أسبوع لكل سنة'],0,'المادة 84. '+CONTRACT],
 ['أي منصة تُستخدم لتوثيق عقود العمل؟',['مدد','قوى','مقيم'],1,'https://www.qiwa.sa'],
 ['موظف دخل 20:00 وخرج 06:00 صباحًا، دون استراحات. كم المدة؟',['8 ساعات','10 ساعات','12 ساعة'],1,'4 ساعات قبل منتصف الليل و6 بعدها.'],
 ['في الإجازة المرضية المثبتة، ما أجر أول 30 يومًا من السنة المرضية؟',['كامل','75%','بلا أجر'],0,'المادة 117. '+WORK]
];
export function quizStep(state,input){let s=state??{i:0,score:0};if(input==='start'||input==='discipline'){let topic=input==='discipline'?'discipline':'general';let bank=topic==='discipline'?disciplineQuiz:quiz;return {state:{i:0,score:0,topic},text:question(0,bank)};}let bank=s.topic==='discipline'?disciplineQuiz:quiz;if(!Number.isInteger(input)||input<0||input>2||s.i>=bank.length)return null;let q=bank[s.i],ok=input===q[2],score=s.score+Number(ok),i=s.i+1;return {state:i===bank.length?null:{i,score,topic:s.topic??'general'},score:i===bank.length?score:null,total:bank.length,topic:s.topic??'general',text:`${ok?'✅ صحيح':'❌ الإجابة الصحيحة: '+q[1][q[2]]}\n${q[3]}\n\n${i===bank.length?`النتيجة: ${score}/${bank.length}`:question(i,bank)}`};}
function question(i,bank){return `السؤال ${i+1}/${bank.length}\n${bank[i][0]}\n${bank[i][1].map((x,j)=>`${j+1}. ${x}`).join('\n')}\nأرسل رقم الإجابة (1–3)، أو /cancel.`;}
export function isOwner(update,id){let m=update?.message;return !!id&&m?.chat?.type==='private'&&String(m.from?.id)===String(id)&&String(m.chat?.id)===String(id)&&typeof m.text==='string';}
export function trustedUrl(s){try{let u=new URL(s);return u.protocol==='https:'&&OFFICIAL.some(d=>u.hostname===d||u.hostname.endsWith('.'+d));}catch{return false;}}
export function extractResponse(data){let text=[],urls=new Set();for(let o of data.output??[])for(let c of o.content??[]){if(c.type==='output_text'){text.push(c.text);for(let a of c.annotations??[])if(a.type==='url_citation'&&trustedUrl(a.url))urls.add(a.url);}}return {text:text.join('\n'),urls:[...urls]};}
export {normalize,reply};
