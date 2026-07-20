
(function(){
  var K='afc_v1';
  function load(){try{return JSON.parse(localStorage.getItem(K)||'{"days":[],"goal":50000}');}catch(e){return{days:[],goal:50000};}}
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  var s=load(); var root=document.getElementById('app');
  function avg(){if(!s.days.length)return 0;return Math.round(s.days.reduce(function(a,b){return a+b;},0)/s.days.length);}
  function maxDay(){if(!s.days.length)return 0;return Math.max.apply(null,s.days);}
  function tip(a){
    if(a===0)return '오늘 지출을 한 줄만 적어보세요. 기록이 습관의 시작.';
    if(a>100000)return '일평균이 높아요. 고정비/변동비 분리부터.';
    if(a>50000)return '카페·배달 3건만 줄여도 주 변화가 큽니다.';
    if(s.days.length>=3){var prev=(s.days[s.days.length-2]||0); if(a<prev*0.85)return '평균이 내려가는 중 · 정진 중.';}
    return '페이스 괜찮아요. 주 1회 리뷰 알림만 지키세요.';
  }
  function render(){
    var cst=0;try{var st=JSON.parse(localStorage.getItem('coach_streak')||'{}');cst=st.count||0;}catch(e){}
    var a=avg();
    var g=s.goal||50000; var gPct=g?Math.min(100,Math.round(a/g*100)):0;
    root.innerHTML='<div class="card"><span class="chip">일평균 <b>'+a.toLocaleString()+'</b></span> <span class="chip">기록일 <b>'+s.days.length+'</b></span> <span class="chip">최대일 <b>'+maxDay().toLocaleString()+'</b></span> <span class="chip">목표 <b>'+gPct+'%</b></span> <span class="chip">🔥 <b>'+cst+'</b>일</span><p style="margin-top:10px">'+tip(a)+'</p></div>'
      +'<div class="card"><div class="sub">최근: '+(s.days.slice(-5).join(', ')||'-')+'</div><input id="x" type="number" placeholder="오늘 쓴 돈"/><button id="add">오늘 기록</button><input id="goal" type="number" placeholder="일 목표" value="'+(s.goal||50000)+'" style="margin-top:8px"/><button class="sec" id="setG">목표 저장</button></div>'
      +'<div class="card"><button class="sec" id="reset">기록 초기화</button></div>';
    document.getElementById('add').onclick=function(){var v=+document.getElementById('x').value||0;if(!v)return;s.days.push(v);if(s.days.length>14)s.days.shift();save(s);try{var st=JSON.parse(localStorage.getItem('coach_streak')||'{}');var t0=new Date().toDateString();if(st.last!==t0){st.count=(st.last===new Date(Date.now()-864e5).toDateString()?(st.count||0)+1:1);st.last=t0;localStorage.setItem('coach_streak',JSON.stringify(st));}}catch(e){}render();try{legionTrack('activate',{v:v})}catch(e){}};
    var sg=document.getElementById('setG'); if(sg) sg.onclick=function(){s.goal=+document.getElementById('goal').value||50000;save(s);render();};
    document.getElementById('reset').onclick=function(){if(confirm('초기화?')){s={days:[]};save(s);render();}};
    if(!document.getElementById('shareWeek')){
      var b=document.createElement('button');b.id='shareWeek';b.style.cssText='width:100%;margin-top:8px;padding:11px;border:0;border-radius:10px;background:#1c1826;color:#ece8f1';
      b.textContent='주간 요약 공유';b.onclick=function(){var text='일평균 '+avg().toLocaleString()+'원 · '+s.days.length+'일 기록 · https://hosuman08-netizen.github.io/ai-finance-coach/';
        if(navigator.clipboard)navigator.clipboard.writeText(text);try{legionTrack('share_peak',{})}catch(e){}};
      root.appendChild(b);
    }
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