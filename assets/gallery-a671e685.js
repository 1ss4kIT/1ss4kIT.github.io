import{f as p,a3 as g,u as f,A as h,U as v,a9 as y,aa as C,R as x,D as b,E as k,g as P,o as w,c as R,w as l,d as a,j as t,a as o,t as A,a8 as B,G as D}from"./app-a51598bf.js";import{_ as E}from"./YunPageHeader.vue_vue_type_script_setup_true_lang-e8684ee8.js";const V={text:"center",class:"yun-text-light",p:"2"},G={class:"page-action",text:"center"},I=["title"],L=o("div",{"i-ri-arrow-go-back-line":""},null,-1),N=[L],j=p({__name:"gallery",setup(O){const c=g(),{t:n}=f(),e=h(),r=v(e);y([C({"@type":"CollectionPage"})]);const s=x(()=>e.value.photos||[]),u=b().value.addons["valaxy-addon-lightgallery"]?k(()=>D(()=>import("./YunGallery-22e530df.js"),["assets/YunGallery-22e530df.js","assets/app-a51598bf.js","assets/index-c11a87c2.css"])):()=>null;return(T,i)=>{const _=E,d=P("router-view"),m=B;return w(),R(m,null,{"main-header":l(()=>[a(_,{title:t(r)||t(n)("title.gallery"),icon:t(e).icon||"i-ri-gallery-line",color:t(e).color},null,8,["title","icon","color"])]),"main-content":l(()=>[o("div",V,A(t(n)("counter.photos",s.value.length)),1),o("div",G,[o("a",{class:"yun-icon-btn",title:t(n)("accessibility.back"),onClick:i[0]||(i[0]=()=>t(c).back())},N,8,I)]),a(t(u),{photos:s.value},null,8,["photos"]),a(d)]),_:1})}}});export{j as default};
