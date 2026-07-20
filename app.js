
(function(){
  var K='afc_v1';
  function load(){try{return JSON.parse(localStorage.getItem(K)||'{"days":[]}');}catch(e){return{days:[]};}}
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  var s=load(); var root=document.getElementById('app');
  function avg(){if(!s.days.length)return 0;return Math.round(s.days.reduce(function(a,b){return a+b;},0)/s.days.length);}
  function tip(a){
    if(a===0)return '오늘 지출을 한 줄만 적어보세요. 기록이 습관의 시작.';
    if(a>100000)return '일평균이 높아요. 고정비/변동비 분리부터.';
    if(a>50000)return '카페·배달 3건만 줄여도 주 변화가 큽니다.';
    return '페이스 괜찮아요. 주 1회 리뷰 알림만 지키세요.';
  }
  function render(){
    var a=avg();
    root.innerHTML='<div class="card"><span class="chip">일평균 <b>'+a.toLocaleString()+'</b></span> <span class="chip">기록일 <b>'+s.days.length+'</b></span><p style="margin-top:10px">'+tip(a)+'</p></div>'
      +'<div class="card"><input id="x" type="number" placeholder="오늘 쓴 돈"/><button id="add">오늘 기록</button></div>'
      +'<div class="card"><button class="sec" id="reset">기록 초기화</button></div>';
    document.getElementById('add').onclick=function(){var v=+document.getElementById('x').value||0;if(!v)return;s.days.push(v);if(s.days.length>14)s.days.shift();save(s);render();try{legionTrack('activate',{v:v})}catch(e){}};
    document.getElementById('reset').onclick=function(){if(confirm('초기화?')){s={days:[]};save(s);render();}};
  }
  try{legionTrack('session_start',{})}catch(e){}
  render();
})();
