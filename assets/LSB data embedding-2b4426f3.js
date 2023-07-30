import{_ as p}from"./ValaxyMain.vue_vue_type_style_index_0_lang-fe952921.js";import{_,p as c,c as h,w as e,o as u,a as t,b as o,d as i,r as s,e as m}from"./app-a51598bf.js";import"./YunFooter.vue_vue_type_script_setup_true_lang-9cc900c2.js";import"./YunCard.vue_vue_type_script_setup_true_lang-fac3e250.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang-e8684ee8.js";const ot=JSON.parse('{"title":"LSB信息隐藏","description":"","frontmatter":{"layout":"post","title":"LSB信息隐藏","categories":["杂记"],"tags":[],"date":"2021-05-21T18:10:00.000Z"},"headers":[{"level":2,"title":"文献参考","slug":"文献参考","link":"#文献参考","children":[]},{"level":2,"title":"实验设计","slug":"实验设计","link":"#实验设计","children":[]}],"relativePath":"pages/posts/LSB data embedding.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/LSB data embedding.md","lastUpdated":1690730773000}'),a=JSON.parse('{"title":"LSB信息隐藏","description":"","frontmatter":{"layout":"post","title":"LSB信息隐藏","categories":["杂记"],"tags":[],"date":"2021-05-21T18:10:00.000Z"},"headers":[{"level":2,"title":"文献参考","slug":"文献参考","link":"#文献参考","children":[]},{"level":2,"title":"实验设计","slug":"实验设计","link":"#实验设计","children":[]}],"relativePath":"pages/posts/LSB data embedding.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/LSB data embedding.md","lastUpdated":1690730773000}'),f={name:"pages/posts/LSB data embedding.md",data(){return{data:a,frontmatter:a.frontmatter,$frontmatter:a.frontmatter}},setup(){c("pageData",a)}},g={id:"文献参考",tabindex:"-1"},B=t("p",null,[t("strong",null,"一、抵御SPA分析、动态补偿的LSB算法")],-1),b=t("p",null,[o("复杂。但提供了一种思路，可以去抵抗一下提取的内容。 "),t("strong",null,"二、直接位平面替换")],-1),E=t("p",null,"1、图像4*4分块，计算灰度差值来决定替换最低1位还是2位。用一个密钥串记录下来嵌入的是1位还是2位。",-1),S=t("p",null,"嵌入时是与最高一位进行异或的。",-1),$=t("p",null,"可以尝试。 重点是嵌入到最低位和第二位中。",-1),k=t("p",null,[t("strong",null,"三、基于BMP位图")],-1),L=t("p",null,"操作对象时BMP，没啥新内容",-1),v=t("p",null,[t("strong",null,"四、自适应、逆LSB嵌入")],-1),A=t("p",null,"1、嵌入信息RC4加密",-1),w=t("p",null,"2、选择某一位",-1),C=t("p",null,"3、用p000 —— p111来计算是否改变了",-1),T={id:"实验设计",tabindex:"-1"},P=t("p",null,[t("strong",null,"一、原有实验1---可以当作2改进，随机嵌入位置")],-1),D=t("p",null,"1、修改if sprintf语句缩进",-1),N=t("p",null,"2、本质上是随机选择嵌入位置",-1),V=t("p",null,"效果是：嵌入较少攻击时能抵抗剪切攻击",-1),I=t("p",null,[t("strong",null,"二、LSB基础实验---当作对比实验")],-1),y=t("p",null,"可以直接使用bitset来设置，bitget来提取相应的水印信息。",-1),F=t("p",null,"根据嵌入信息的多少，设置嵌入间隔。",-1),M=t("p",null,"用最低位嵌入提取信息。",-1),J=t("p",null,[t("strong",null,"三、选择位嵌入")],-1),O=t("p",null,"图像Arnold置乱，每个块都是4*4的大小，共嵌入16bit的信息。",-1),U=t("p",null,"首先求G、AVE，决定了要嵌入的位。",-1),Z=t("p",null,"攻击：",-1),G=t("p",null,"(1)攻击图像，还能提取多少？---50%的误码率，所以抵抗不了任何攻击",-1),R=t("p",null,"(2)抵抗检测？：抵抗SPA---未实现",-1),j=t("p",null,[t("strong",null,"四、高容量嵌入")],-1),q=t("p",null,"图像分成3*3的块，每一个像素值都嵌入第三位或低四位，可以很大程度上提高嵌入容量。",-1),z=t("p",null,"根据一定的条件来判定到底是嵌入低三位还是低四位。但是这种方法隐患很大，某一个位置提取出错了，后面就都错了。而且代码存在一定的问题，总是有错误最后也没改好。",-1),H=t("p",null,[o("本文记录了实现的过程，用以纪念自己人生最后的"),t("strong",null,"善良"),o("。")],-1);function K(n,Q,W,X,d,Y){const l=m,r=p;return u(),h(r,{frontmatter:d.frontmatter,data:d.data},{"main-content-md":e(()=>[t("h2",g,[o("文献参考 "),i(l,{class:"header-anchor",href:"#文献参考","aria-hidden":"true"},{default:e(()=>[o("#")]),_:1})]),B,b,E,S,$,t("p",null,[o("一种类似的方法："),i(l,{href:"https://www.docin.com/p-1696546625.html%EF%BC%8C%E9%9A%8F%E6%9C%BA%E9%80%89%E6%8B%A9%E5%B5%8C%E5%85%A5%E7%9A%84%E4%BD%8D%EF%BC%8C%E6%9B%B4%E7%AE%80%E5%8D%95%E4%B8%80%E4%BA%9B%E3%80%82",target:"_blank",rel:"noreferrer"},{default:e(()=>[o("https://www.docin.com/p-1696546625.html，随机选择嵌入的位，更简单一些。")]),_:1})]),k,L,v,A,w,C,t("h2",T,[o("实验设计 "),i(l,{class:"header-anchor",href:"#实验设计","aria-hidden":"true"},{default:e(()=>[o("#")]),_:1})]),P,D,N,V,I,y,F,M,J,O,U,Z,G,R,j,q,z,H]),"main-header":e(()=>[s(n.$slots,"main-header")]),"main-header-after":e(()=>[s(n.$slots,"main-header-after")]),"main-nav":e(()=>[s(n.$slots,"main-nav")]),"main-content":e(()=>[s(n.$slots,"main-content")]),"main-content-after":e(()=>[s(n.$slots,"main-content-after")]),"main-nav-before":e(()=>[s(n.$slots,"main-nav-before")]),"main-nav-after":e(()=>[s(n.$slots,"main-nav-after")]),comment:e(()=>[s(n.$slots,"comment")]),footer:e(()=>[s(n.$slots,"footer")]),aside:e(()=>[s(n.$slots,"aside")]),"aside-custom":e(()=>[s(n.$slots,"aside-custom")]),default:e(()=>[s(n.$slots,"default")]),_:3},8,["frontmatter","data"])}const at=_(f,[["render",K]]);export{ot as __pageData,at as default};