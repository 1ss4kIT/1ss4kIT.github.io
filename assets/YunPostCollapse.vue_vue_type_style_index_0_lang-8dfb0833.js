import{f as b,u as C,m as _,ab as g,a2 as h,R as w,g as D,o as s,h as a,a as o,t as l,j as p,F as m,i as f,ac as B,k as N,d as V,w as E,b as F}from"./app-a51598bf.js";const I={class:"post-collapse px-10 lt-sm:px-5"},L={w:"full",text:"center",class:"yun-text-light",p:"2"},M={class:"post-collapse-action",text:"center"},P={key:0,"i-ri-sort-desc":""},$={key:1,"i-ri-sort-asc":""},j={class:"collection-title"},R=["id"],S={class:"post-header"},T={class:"post-meta"},q={key:0,class:"post-time",font:"mono",opacity:"80"},z={class:"post-title",font:"serif black"},G=b({__name:"YunPostCollapse",props:{posts:{}},setup(y){const v=y,{t:k}=C(),u=_([]),r=_({});g(()=>v.posts,()=>{r.value={},u.value=[],v.posts.forEach(t=>{if(!(t.hide&&t.hide!=="index")&&t.date){const e=Number.parseInt(h(t.date,"YYYY"));r.value[e]?r.value[e].push(t):(u.value.push(e),r.value[e]=[t])}})},{immediate:!0});const i=_(!0),x=w(()=>{const e=u.value.sort((d,n)=>n-d);return i.value?e:e.reverse()});return(t,e)=>{const d=D("router-link");return s(),a("div",I,[o("div",L,l(p(k)("counter.archives",t.posts.length)),1),o("div",M,[o("button",{class:"yun-icon-btn shadow hover:shadow-md",onClick:e[0]||(e[0]=n=>i.value=!i.value)},[i.value?(s(),a("div",P)):(s(),a("div",$))])]),(s(!0),a(m,null,f(x.value,n=>(s(),a("div",{key:n,m:"b-6"},[o("div",j,[o("h2",{id:`#archive-year-${n}`,class:"archive-year",text:"4xl",p:"y-2"},l(n),9,R)]),(s(!0),a(m,null,f(p(B)(r.value[n],i.value),(c,Y)=>(s(),a("article",{key:Y,class:"post-item"},[o("header",S,[o("div",T,[c.date?(s(),a("time",q,l(p(h)(c.date,"MM-DD")),1)):N("v-if",!0)]),o("h2",z,[V(d,{to:c.path||"",class:"post-title-link"},{default:E(()=>[F(l(c.title),1)]),_:2},1032,["to"])])])]))),128))]))),128))])}}});export{G as _};
