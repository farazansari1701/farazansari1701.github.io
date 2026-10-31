'use strict';
const fs=require('node:fs');
for(const file of process.argv.slice(2)) {
  try {
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    const categories=Object.fromEntries(Object.entries(data.categories||{}).map(([key,v])=>[key,v.score==null?null:Math.round(v.score*100)]));
    const metrics={};
    for(const key of ['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','interaction-to-next-paint']){
      const audit=data.audits?.[key];
      if(audit)metrics[key]={display:audit.displayValue||'',numeric:audit.numericValue??null};
    }
    const opportunities=Object.values(data.audits||{}).filter(a=>a.details?.type==='opportunity' && a.numericValue>0).sort((a,b)=>b.numericValue-a.numericValue).slice(0,8).map(a=>({id:a.id,title:a.title,savingsMs:Math.round(a.numericValue)}));
    console.log('LIGHTHOUSE_RESULT '+JSON.stringify({file,categories,metrics,opportunities}));
  }catch(err){console.error('LIGHTHOUSE_REPORT_ERROR '+file+' '+err.message);process.exitCode=1;}
}
