import{_ as d}from"./ValaxyMain.vue_vue_type_style_index_0_lang-fe952921.js";import{_ as u,p,c as r,w as s,o as h,a as t,b as o,d as _,r as l,e as N}from"./app-a51598bf.js";import"./YunFooter.vue_vue_type_script_setup_true_lang-9cc900c2.js";import"./YunCard.vue_vue_type_script_setup_true_lang-fac3e250.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang-e8684ee8.js";const D="/images/pasted-227.png",m="/images/pasted-228.png",S="/images/pasted-229.png",f="/images/pasted-230.png",g="/images/pasted-231.png",ms=JSON.parse('{"title":"基于LSTM模型的DNS隐蔽信道检测方法","description":"","frontmatter":{"layout":"post","title":"基于LSTM模型的DNS隐蔽信道检测方法","tags":[],"categories":["paper阅读笔记"],"author":"1ss4k","date":"2021-02-03T12:05:00.000Z"},"headers":[],"relativePath":"pages/posts/LSTM DNS covert channel.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/LSTM DNS covert channel.md","lastUpdated":1690730773000}'),i=JSON.parse('{"title":"基于LSTM模型的DNS隐蔽信道检测方法","description":"","frontmatter":{"layout":"post","title":"基于LSTM模型的DNS隐蔽信道检测方法","tags":[],"categories":["paper阅读笔记"],"author":"1ss4k","date":"2021-02-03T12:05:00.000Z"},"headers":[],"relativePath":"pages/posts/LSTM DNS covert channel.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/LSTM DNS covert channel.md","lastUpdated":1690730773000}'),F={name:"pages/posts/LSTM DNS covert channel.md",data(){return{data:i,frontmatter:i.frontmatter,$frontmatter:i.frontmatter}},setup(){p("pageData",i)}},Q=t("p",null,"本文发表于Computers & Security，作者来自于北航、软件所、应急响应技术中心，发表时间2020年10月。",-1),T={id:"一、背景及目的",tabindex:"-1"},L=t("p",null,"1、DNS(域名系统)作用是将域名转为IP地址。防火墙一般不过滤DNS，攻击者通常使用DNS来构建隐蔽通道。",-1),M=t("p",null,"2、构建DNS隐蔽信道的方法大致分为两类：基于IP连接的 和 基于查询域名的。",-1),v=t("p",null,"3、文中解释了DNS隐蔽信道的实现过程。",-1),$=t("p",null,"4、DNS隐蔽信道可以分为合法的和恶意的。恶意的分为两类：DNS渗出和DNS隧道。恶意的隐蔽信道可以实现窃取用户信息以及对主机的控制。",-1),b=t("p",null,"5、FQDN是完全限定域名。它适用于检测隐蔽信道，并且能够检查出上述两种类型的。",-1),k=t("p",null,"假阳性的情况包括：CDNs(内容交付网络) 和 DDOS攻击，以及一些合法的隐蔽信道的流量。本文提出了：组合 和 白名单的方法",-1),C={id:"二、前人工作",tabindex:"-1"},I=t("p",null,"1、基于单包的检测方法",-1),y=t("ul",null,[t("li",null,[t("p",null,"检测单个DNS包 或 请求/响应对的内容。")]),t("li",null,[t("p",null,"基于FQDN的检测方法认为，在隐蔽信道中，客户端发送的数据 通常都包含在FQDNs的子域部分中。")])],-1),P=t("p",null,"[15]将每个FQDN作为一个确定单位，并根据双字符频率 计算每个FQDN的得分。然后使用阈值进行判定。",-1),w=t("ul",null,[t("li",null,"基于RR数据的方法 检测DNS响应数据包resource record。")],-1),R=t("p",null,"[18]分别检测DNS exfiltration 和 DNS tunneling。首先将标记数据进行聚类，然后将新样本分类到这些已知聚类中。",-1),V=t("ul",null,[t("li",null,"有学者不仅仅使用payload作为检测对象。")],-1),B=t("p",null,"[19]使用了DNS的比特序列，和CNN模型。",-1),O=t("p",null,"[20]使用请求响应包的结合，提取几个特征，加上SVM和kmeans。",-1),U=t("p",null,"[21]将请求和响应包对用作数据对象。他们提取了59个维度特征",-1),x=t("p",null,"2、基于包集合的检测方法",-1),z=t("p",null,"将数据包分成set，提取每个set的特征。",-1),A=t("ul",null,[t("li",null,"时间片划分")],-1),J=t("p",null,"[27]和[28]认为，普通的DNS流量之间有很多共通的信息。他们算了连续r个集合的特征之间的共通信息。",-1),Z=t("ul",null,[t("li",null,"FQDNs域划分")],-1),q=t("p",null,"这种划分方法会把一种服务划分到一个set里面。",-1),E=t("ul",null,[t("li",null,"请求、响应的IP")],-1),j=t("p",null,"[22]证明了少量的数据，比如100个FQDN，可以有效地分离正常和隧道通信。",-1),G=t("ul",null,[t("li",null,"网络流")],-1),H=t("p",null,"DNS流是由相同属性的数据包的集合。",-1),K={id:"三、本文方法",tabindex:"-1"},W=t("p",null,"1、前置知识",-1),X=t("p",null,"​ 对于序列数据的学习问题，RNN模型可以对以前的状态进行记忆并应用于输出计算，可以充分利用序列数据的信息。",-1),Y=t("p",null,"​ LSTM模型是基于RNN的，对文本具有较好的分类性能。并且LSTM可以接受流数据，因此只需要对数据进行简单的预处理，就可以实现端到端的实时检测。特征方面：提取特征比较不容易，本文用LSTM，不依赖于特征。将DNS包的FQDNs作为输入的payload，使用LSTM完成端到端的实时检测。",-1),tt=t("p",null,"​ 正常的FQDN可以看做是语义序列，而隐蔽信道的FQDNs可以看做是随机序列。只有FQDN的子域部分可以用来编码隐蔽数据，因此我们只检测FQDN的子域部分。此外，不同的工具产生的分隔符'.'的位置是不同的，所以要移除点。此外，用白名单的过滤方法，去除哪些假阳性的数据。",-1),st=t("p",null,"2、模型结构",-1),ot=t("p",null,"模型包括如下三部分：数据预处理、模型测定 和分组滤波。",-1),nt=t("p",null,[t("img",{src:D,alt:"upload successful"})],-1),lt=t("p",null,"3、预处理",-1),et=t("p",null,"​ 将不可见字符进行16进制编码。",-1),_t=t("p",null,"预处理大致的步骤如下：",-1),it=t("ol",null,[t("li",null,[t("p",null,"从FQDNs中移除 2LD.TLDs。")]),t("li",null,[t("p",null,"将所有大写字符转换为小写字符")])],-1),at=t("p",null,"3)移除FQNDs中的分隔符'.'",-1),ct=t("ol",{start:"4"},[t("li",null,"统一字符串的长度。")],-1),dt=t("p",null,"​ 将字符串转为 word vectors，并且将序列长度固定为<128。过长的只保留前128，过短的填充。",-1),ut=t("p",null,"4、模型测定",-1),pt=t("p",null,"本文的LSTM模型包含一个隐藏层。",-1),rt=t("p",null,"因为fqdn通常很短，所以前128个字符在很大程度上可以保证它包含原始信息。因此，我们的LSTM模型的隐藏状态数被设置为128。状态数对应于网络的长度，层数对应于网络的深度。",-1),ht=t("p",null,"每个LSTM接受当前输入 及其上一个消息中的状态，并将计算结果传播到下一个消息单元。",-1),Nt=t("p",null,"5、分组滤波",-1),Dt=t("p",null,"​ [31]指出，最好的方法是使用DNS zones，这样一个隐蔽信道的所有流量会被分到一个单元中去。但是不容易找到DNS zones。",-1),mt=t("p",null,"​ 本文分组方法是根据 2LD.TLD。分组算法如下",-1),St=t("p",null,[t("img",{src:m,alt:"upload successful"})],-1),ft=t("p",null,[t("img",{src:S,alt:"upload successful"})],-1),gt=t("p",null,"1）移除重复查询的FQDNs",-1),Ft=t("p",null,"​ 从人性的角度考虑，为了隐蔽性，通常不会将一个FQDNs发送多次。因此我们认为，重复的FQDNs 应该都不是隐蔽信道发送的。",-1),Qt=t("p",null,"​ 此处去除重复次数 >ts1的FQDNs包。",-1),Tt=t("p",null,"2）删除包含少量FQDNs的组",-1),Lt=t("p",null,"​ 阈值时ts2，包含的FQDNs数量<ts2的，就删除。本文实验设定的参数为5。",-1),Mt=t("p",null,"3）删除FQDNs被多个IP查询的组",-1),vt=t("p",null,"4）使用白名单滤波",-1),$t=t("p",null,"​ 将合法的创建一个白名单。",-1),bt={id:"四、实验结果",tabindex:"-1"},kt=t("p",null,"1、数据集",-1),Ct=t("p",null,"​ 数据集：使用了来自网上的数据包，以及DNS隐蔽信道工具生成的数据包。其中包括泛化的测试数据集，以及模型训练产生的FQDN和DNS数据包。",-1),It=t("p",null,"​ 构建了两个数据集：FQDNs的数据集和DNS数据包的数据集。",-1),yt=t("p",null,"1）FQDNs数据集",-1),Pt=t("p",null,"使用的良性数据集 来自于真实的数据，并且自己提前删除了可疑的数据。最后的良性数据集包含3000,000 FQDNs。",-1),wt=t("p",null,"关于泛化数据集：",-1),Rt=t("p",null,"{第一次泛化测试集中的FQDNs 与训练集中的FQDNs相同。第二第三组中的FQDNs 是随机的，但是较短，因此较难检测。第四个包含真实的数据。",-1),Vt=t("p",null,"对于一些合法的隐蔽信道，我们在训练阶段还是视为非法的，然后最后再用白名单过滤掉。}",-1),Bt=t("p",null,"2）DNS包",-1),Ot=t("p",null,"收集了真实世界的DNS数据包，进行评价。",-1),Ut=t("p",null,"2、衡量指标",-1),xt=t("p",null,"对FQDNs和DNS使用不同的衡量指标。",-1),zt=t("p",null,"对于FQDNs，使用Accuracy、precision、recall、F- Measure。",-1),At=t("p",null,"对于DNS，使用recall 和 假阳率。",-1),Jt=t("p",null,"3、实验设置",-1),Zt=t("p",null,"总共进行三组实验。",-1),qt=t("p",null,"1）实验1 --- 检测模型的有效性",-1),Et=t("p",null,"比较了LSTM和CNN、以及文献[16]的效果。数据集是FQDNs。",-1),jt=t("p",null,"CNN：将预处理的FQDNs转为图像，并且缩放到128维。CNN模型包含3个卷积层、2个max-pooling 层，一个softmax层。",-1),Gt=t("p",null,"对于[16]，类比文中到数据集，自己创建了一个数据集，用来训练孤立森林模型。",-1),Ht=t("p",null,"实验结果如下：",-1),Kt=t("p",null,[o("recall越高越好， "),t("img",{src:f,alt:"upload successful"})],-1),Wt=t("p",null,"2）实验2 --- 预处理",-1),Xt=t("p",null,[o("是否小写、是否去除分隔符 对实验结果的影响。在FQDNs进行测试。实验结果如下： "),t("img",{src:g,alt:"upload successful"})],-1),Yt=t("p",null,"3）实验3 --- 分组滤波的效果",-1),ts=t("p",null,"4、真实流量检测的结果",-1),ss=t("p",null,"检测到了使用onlinecc.com的隐蔽信道，以及两个可疑的信道。并且也发现了一些合法的隐蔽信道。",-1),os={id:"五、未来工作及收获",tabindex:"-1"},ns=t("p",null,"(1)优化模型结构和损失函数，来提升模型的泛化能力。",-1),ls=t("p",null,"(2)使用active learning 去发现实际网络中的良性或恶意的FQDNs，去补充我们的数据集。",-1),es=t("p",null,"收获",-1),_s=t("p",null,"(1) LSTM不依赖于特征，尝试一下自己能否使用？预处理过程也参考本文的。 (2) 良性URL是否寻在语义序列，恶意的更偏向于随机的？ (3) CNN更加适合于处理图像，所以可以把我们的数据转成图像再处理",-1);function is(n,as,cs,ds,a,us){const e=N,c=d;return h(),r(c,{frontmatter:a.frontmatter,data:a.data},{"main-content-md":s(()=>[Q,t("h1",T,[o("一、背景及目的 "),_(e,{class:"header-anchor",href:"#一、背景及目的","aria-hidden":"true"},{default:s(()=>[o("#")]),_:1})]),L,M,v,$,b,k,t("h1",C,[o("二、前人工作 "),_(e,{class:"header-anchor",href:"#二、前人工作","aria-hidden":"true"},{default:s(()=>[o("#")]),_:1})]),I,y,P,w,R,V,B,O,U,x,z,A,J,Z,q,E,j,G,H,t("h1",K,[o("三、本文方法 "),_(e,{class:"header-anchor",href:"#三、本文方法","aria-hidden":"true"},{default:s(()=>[o("#")]),_:1})]),W,X,Y,tt,st,ot,nt,lt,et,_t,it,at,ct,dt,ut,pt,rt,ht,Nt,Dt,mt,St,ft,gt,Ft,Qt,Tt,Lt,Mt,vt,$t,t("h1",bt,[o("四、实验结果 "),_(e,{class:"header-anchor",href:"#四、实验结果","aria-hidden":"true"},{default:s(()=>[o("#")]),_:1})]),kt,Ct,It,yt,Pt,wt,Rt,Vt,Bt,Ot,Ut,xt,zt,At,Jt,Zt,qt,Et,jt,Gt,Ht,Kt,Wt,Xt,Yt,t("p",null,[o("在DNS包上进行测试，并且白名单过滤法只包含5个2LD.TLDs："),_(e,{href:"http://baidu.com/cloudfront.net/gstatic.com/rackcdn.com/office.com%E3%80%82",target:"_blank",rel:"noreferrer"},{default:s(()=>[o("baidu.com/cloudfront.net/gstatic.com/rackcdn.com/office.com。")]),_:1})]),ts,ss,t("h1",os,[o("五、未来工作及收获 "),_(e,{class:"header-anchor",href:"#五、未来工作及收获","aria-hidden":"true"},{default:s(()=>[o("#")]),_:1})]),ns,ls,es,_s]),"main-header":s(()=>[l(n.$slots,"main-header")]),"main-header-after":s(()=>[l(n.$slots,"main-header-after")]),"main-nav":s(()=>[l(n.$slots,"main-nav")]),"main-content":s(()=>[l(n.$slots,"main-content")]),"main-content-after":s(()=>[l(n.$slots,"main-content-after")]),"main-nav-before":s(()=>[l(n.$slots,"main-nav-before")]),"main-nav-after":s(()=>[l(n.$slots,"main-nav-after")]),comment:s(()=>[l(n.$slots,"comment")]),footer:s(()=>[l(n.$slots,"footer")]),aside:s(()=>[l(n.$slots,"aside")]),"aside-custom":s(()=>[l(n.$slots,"aside-custom")]),default:s(()=>[l(n.$slots,"default")]),_:3},8,["frontmatter","data"])}const Ss=u(F,[["render",is]]);export{ms as __pageData,Ss as default};