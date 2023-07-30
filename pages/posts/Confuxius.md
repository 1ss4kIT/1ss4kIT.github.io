---
title: 对APT组织Confucius的分析
date: 2021-11-27 
updated: 2021-11-28
categories: 威胁情报
tags: null
layout: post
---

溯源取证的课程已经结束了，但是自己单靠上课听讲并没有学到很多能够实际应用的知识，两次大作业也没有比较实际的产出，有点愧疚。正好近期有需要整理APT组织相关信息的任务，并且溯源课程也快要考试了，此处以实际的APT组织Confucius为例，进行一下系统的学习，希望能够提高自己在溯源取证方面的知识和能力。

​	恶意样本分析可以使用在线环境AnyRun。地址：https://app.any.run / 使用教程：https://www.anquanke.com/post/id/100472， 但是自己尝试了一下体验感不是很好，还是使用虚拟机来分析。

## 一、组织简介

​	APT组织”魔罗桫”（又名为Confucius、提菩），有印度背景，2013年首次出现，是一个长期针对中国，巴基斯坦，尼泊尔等地区，主要针对政府机构，军工企业，核能行业等领域进行网络间谍活动的活跃组织。

​	该组织与Patchwork存在一定的关联。

## 二、常用攻击方式

​	参考奇安信红雨滴团队分析报告 https://ti.qianxin.com/uploads/2020/09/17/69da886eecc7087e9dac2d3ea4c66ba8.pdf

### 1、邮件结合钓鱼网站定向攻击
​	没太多技术性的东西，但一些钓鱼的小技巧很有意思。


### 2、邮件木马附件定向攻击

​	通常用恶意宏来下载和执行恶意文件。

​	例如：Warzone RAT，使用了UAC绕过技术。关于[Confucius使用Waezone RAT的报告可以看这篇文章](https://socprime.com/blog/warzone-rat-malware-used-by-confucius-apt-in-targeted-attacks/)

​	样本下载地址：[GitHub - PWN-Hunter/WARZONE-RAT-1.71: WARZONE RAT 1.71 CRACKED by UNKNOWN-Remote Administration Trojan-RAT](https://github.com/PWN-Hunter/WARZONE-RAT-1.71)




**bypass UAC**

​	使用sdclt.exe。可参考[知乎上的教程](https://zhuanlan.zhihu.com/p/29325846)，[github上原作者](https://gist.github.com/netbiosX/54a305a05b979e13d5cdffeba5436bcc)2019年称，在最新的windows10上已经不能用了，自己在windows10上进行尝试发现确实不能成功。([无法执行.ps1参考该文章](https://blog.csdn.net/jinhaijing/article/details/85004126))

​	接下来的分析操作参考[uptycs.com的这篇文章](https://www.uptycs.com/blog/warzone-rat-comes-with-uac-bypass-technique)，这种技术属于T1548.002，并且现在由于windows的系统设置，很多方法已经不能用了。具体原因是：

```tex
There are many UAC bypass techniques that are not effective on Windows 10 because of the default file system restrictions. A 32-bit application can’t access the native c:\windows\system32 directory because the operating system redirects the request to c:\windows\SysWOW64. Sdclt.exe and other UAC bypass binaries are (not???) 64-bit applications and are not available in the SysWOW64 directory.
```
​	本RAT使用了另一种机制Wow64DisableWow64FsRedirection API，来禁用上文提到的重定向操作。

![1-Wow64](/Confuxius/1-Wow64.png)

​	根据函数的交叉引用定位到sub_14001B634，但是之后就不知道怎么分析了。参考文章给出之后修改注册表，但是没找到相应的代码在哪里，不知道是不是版本的原因。

​	随后分析了其各项功能，但是我还不太会分析，所以此处只看了一下别人的文章，没有自己手工分析。

​	关于早期版本的UAC绕过技术，[这篇文章](https://research.checkpoint.com/2020/warzone-behind-the-enemy-lines/)分析地也很详细，不过后半部分我没具体看了，还是水平不够理解不了。



​	前期可以利用多种漏洞进行木马的下载，如此处使用了公式编辑器漏洞。2021年1月，uptycsy又发布了一篇关于[Confucius使用Warzone RAT](https://www.uptycs.com/blog/confucius-apt-deploys-warzone-rat)的文章，文中还提到了模版注入技术(用于下载RTF，随后下载Warzone RAT)和C2 TLL。其使用到了CVE-2018-0802 公式编辑器漏洞，是一个栈溢出漏洞，之后有时间的话可以复现一下。(之后 == never)

​	一篇相关的中文[样本分析文章](http://cn-sec.com/archives/271661.html)，对RAT的功能的分析较为详尽。


### 3、安卓APK攻击

​	奇安信报告指出，其改写了开源安卓木马 spynote进行攻击。

​	2017年，其又使用了ChatSpy。

​	2021年2月，LookOut发布关于其使用SunBird和Hornbill的文章，称其在更早的时间就开始使用这些恶意软件了。SunBird有RAT功能，Hornbill仅用来监控，提取其运营商感兴趣的数据。具体可以参考[这篇](https://blog.lookout.com/lookout-discovers-novel-confucius-apt-android-spyware-linked-to-india-pakistan-conflict)，但其中没有技术性的分析。SunBird和BuzzOut可能是由同一拨人开发的。目前也没找到关于这两个恶意软件的较为详细的技术分析文章，大多都是引用的LookOut的那篇。

​	由于网上关于spynote的分析文章较多，此处对其进行分析。(先去补充了安卓的基础知识)。分析spynote 5.0，从GitHub下载。

​	**spynote 5.0使用教程：**参考[freebuf的文章](https://www.freebuf.com/sectool/164077.html)。文中内网穿透工具网络通不能再使用了，使用花生壳。

生成的木马功能设置如下图所示，build的时候，选择的patch为Patch-release，没有选Patch-StaminaMode-release (因为手误)。但是进度条一直卡在那里不懂，查看freebuf文章的评论，说是.net的版本需要为4.5.2，但是win10又没办法安装这个版本的....尝试安装一个win7的虚拟机，反正其他地方也要用到。

![2-function.png](/Confuxius/2-function.png)


