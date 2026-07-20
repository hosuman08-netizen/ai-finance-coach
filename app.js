(function(){
  var K='afc_v2';
  function load(){
    try{
      var raw=JSON.parse(localStorage.getItem(K)||'null');
      if(raw&&raw.entries) return raw;
      // migrate v1
      var old=JSON.parse(localStorage.getItem('afc_v1')||'{"days":[],"goal":50000}');
      var entries=[];
      (old.days||[]).forEach(function(v,i){
        entries.push({d:'mig'+i,v:+v||0});
      });
      return {entries:entries,goal:old.goal||50000};
    }catch(e){return{entries:[],goal:50000};}
  }
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  function dayKey(off){
    var d=new Date(); d.setDate(d.getDate()+(off||0));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  var s=load(); var root=document.getElementById('app');
  function vals(){return s.entries.map(function(e){return +e.v||0;});}
  function avg(){var v=vals(); if(!v.length)return 0;return Math.round(v.reduce(function(a,b){return a+b;},0)/v.length);}
  function maxDay(){var v=vals(); if(!v.length)return 0;return Math.max.apply(null,v);}
  function weekBars(){
    var out=[];
    for(var i=6;i>=0;i--){
      var k=dayKey(-i);
      var hit=s.entries.filter(function(e){return e.d===k;})[0];
      out.push({k:k.slice(5),v:hit?(+hit.v||0):0});
    }
    return out;
  }
  function underGoalRate(){
    var g=s.goal||50000; var n=0,m=0;
    s.entries.forEach(function(e){m++; if((+e.v||0)<=g)n++;});
    return m?Math.round(n/m*100):0;
  }
  function weekSum(){
    var keys={}; for(var i=0;i<7;i++) keys[dayKey(-i)]=1;
    return s.entries.reduce(function(a,e){return a+(keys[e.d]?(+e.v||0):0);},0);
  }
  // 5H: 7d spark bars (local, finance transparent)
  function weekSpark(){
    var map={};
    s.entries.forEach(function(e){map[e.d]=+e.v||0;});
    var days=[], max=1;
    for(var i=6;i>=0;i--){
      var k=dayKey(-i); var v=map[k]||0;
      days.push({k:k.slice(5),v:v}); if(v>max) max=v;
    }
    return days.map(function(d){
      var h=Math.max(4, Math.round((d.v/max)*36));
      var col=d.v?(d.v>(s.goal||50000)?'#f87171':'#67e8f9'):'#2a2438';
      return '<div title="'+d.k+': '+d.v.toLocaleString()+'" style="flex:1;height:40px;display:flex;align-items:flex-end">'
        +'<div style="width:100%;height:'+h+'px;background:'+col+';border-radius:3px 3px 0 0"></div></div>';
    }).join('');
  }
  function tip(a){
    if(a===0)return '오늘 지출을 한 줄만 적어보세요. 기록이 습관의 시작.';
    if(a>100000)return '일평균이 높아요. 고정비/변동비 분리부터.';
    if(a>50000)return '카페·배달 3건만 줄여도 주 변화가 큽니다.';
    if(s.entries.length>=3){
      var v=vals(); var prev=v[v.length-2]||0; var last=v[v.length-1]||0;
      if(last<prev*0.85)return '평균이 내려가는 중 · 정진 중.';
      if(last<=(s.goal||50000))return '오늘 목표 이내 · 유지 루프 ON.';
    }
    return '페이스 괜찮아요. 주 1회 리뷰 알림만 지키세요.';
  }
  function bumpStreak(){
    try{
      var st=JSON.parse(localStorage.getItem('coach_streak')||'{}');
      var t0=dayKey(0);
      if(st.last===t0) return st;
      st.count=(st.last===dayKey(-1))?(st.count||0)+1:1;
      st.last=t0;
      localStorage.setItem('coach_streak',JSON.stringify(st));
      return st;
    }catch(e){return {count:0};}
  }
  function render(){
    var st=JSON.parse(localStorage.getItem('coach_streak')||'{}');
    var cst=st.count||0;
    var a=avg();
    var g=s.goal||50000;
    var gPct=g?Math.min(100,Math.round(a/g*100)):0;
    var ws=weekSum(); var ug=underGoalRate(); var bars=weekBars(); var maxB=Math.max.apply(null,bars.map(function(b){return b.v;}).concat([1]));
    var recent=s.entries.slice(-5).map(function(e){return (e.d||'').slice(5)+':'+e.v;}).join(' · ')||'-';
    var todayLogged=s.entries.some(function(e){return e.d===dayKey(0);});
    root.innerHTML='<div class="card field1Finance" style="font-size:11px;color:#67e8f9">투명 금융 · 투자권유 아님 · 로컬만</div>'
      +'<div class="card"><span class="chip">일평균 <b>'+a.toLocaleString()+'</b></span> <span class="chip">기록일 <b>'+s.entries.length+'</b></span> <span class="chip">최대일 <b>'+maxDay().toLocaleString()+'</b></span> <span class="chip">목표비 <b>'+gPct+'%</b></span> <span class="chip">🔥 <b>'+cst+'</b>일</span> <span class="chip">7일합 <b>'+ws.toLocaleString()+'</b></span> <span class="chip">목표내 <b>'+ug+'%</b></span>'
      +'<div class="row" style="gap:4px;margin-top:10px;align-items:flex-end;height:44px">'+weekSpark()+'</div>'
      +'<p class="sub" style="margin:4px 0 0">7일 스파크 · 목표초과=빨강</p>'
      +'<div style="margin-top:10px;display:flex;align-items:flex-end;gap:3px;height:40px">'+bars.map(function(b){var h=Math.max(4,Math.round(b.v/maxB*36));return '<div title="'+b.k+' '+b.v+'" style="flex:1;height:'+h+'px;background:'+(b.v<=(s.goal||50000)?'#67e8f9':'#fbbf24')+';border-radius:3px 3px 0 0"></div>';}).join('')+'</div>'+'<p style="margin-top:10px">'+tip(a)+'</p></div>'
      +'<div class="card"><div class="sub">최근: '+recent+'</div>'
      +'<input id="x" type="number" placeholder="'+(todayLogged?'오늘 금액 수정':'오늘 쓴 돈')+'"/>'
      +'<button id="add">'+(todayLogged?'오늘 덮어쓰기':'오늘 기록')+'</button>'
      +'<input id="goal" type="number" placeholder="일 목표" value="'+g+'" style="margin-top:8px"/>'
      +'<button class="sec" id="setG">목표 저장</button></div>'
      +'<div class="card"><button class="sec" id="reset">기록 초기화</button>'
      +'<button id="shareWeek" style="width:100%;margin-top:8px;padding:11px;border:0;border-radius:10px;background:#1c1826;color:#ece8f1">주간 요약 공유</button></div>';
    document.getElementById('add').onclick=function(){
      var v=+document.getElementById('x').value||0; if(!v)return;
      var t=dayKey(0);
      var found=-1;
      for(var i=0;i<s.entries.length;i++) if(s.entries[i].d===t) found=i;
      if(found>=0) s.entries[found].v=v; else s.entries.push({d:t,v:v});
      if(s.entries.length>30) s.entries=s.entries.slice(-30);
      save(s); bumpStreak(); render();
      try{legionTrack('activate',{v:v,upd:found>=0})}catch(e){}
    };
    document.getElementById('setG').onclick=function(){s.goal=+document.getElementById('goal').value||50000;save(s);render();};
    document.getElementById('reset').onclick=function(){if(confirm('초기화?')){s={entries:[],goal:s.goal||50000};save(s);render();}};
    document.getElementById('shareWeek').onclick=function(){
      var text='일평균 '+avg().toLocaleString()+'원 · 7일합 '+weekSum().toLocaleString()+' · '+s.entries.length+'일 기록 · https://hosuman08-netizen.github.io/ai-finance-coach/';
      if(navigator.clipboard)navigator.clipboard.writeText(text);
      else if(navigator.share) navigator.share({text:text}).catch(function(){});
      try{legionTrack('share_peak',{})}catch(e){}
    };
  }
  try{legionTrack('session_start',{})}catch(e){}
  render();

  (function(){try{
    if(document.getElementById('moneyPipe'))return;
    var d=document.createElement('div');
    d.innerHTML='\n<div id="moneyPipe" style="margin-top:12px;padding:10px;border:1px solid #67e8f944;border-radius:12px;background:#121820;text-align:center;font-size:12px">\n  <div style="color:#67e8f9;font-weight:700;margin-bottom:4px">💎 투명 금융 크로스</div>\n  <p style="opacity:.75;margin:0 0 6px">투자권유 아님 · 로컬 도구 · 후원 선택</p>\n  <a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/budget-pulse/?utm_source=pipe">💓 Budget</a>\n  <a style="color:#ece8f1;margin:0 6px" href="mailto:hoyashi95@gmail.com?subject=%5BFinance%5D%20feedback">✉ 피드백</a>\n  <a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=pipe">🎮 Arcade</a>\n</div>\n';
    var app=document.getElementById('app')||document.body;
    app.appendChild(d.firstElementChild||d);
    try{legionTrack('money_pipe_shown',{app:'auto'})}catch(e){}
  }catch(e){}})();
})();
