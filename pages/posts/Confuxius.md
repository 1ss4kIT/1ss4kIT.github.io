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
