---
layout: post
title: ATT&CK应用情况
categories: 威胁情报
date: 2021-08-19 10:21:21
tags:
---
本文转自安全内参，原文链接 https://www.secrss.com/articles/34950

经调研，ATT&CK在国内实际应用较少，主要是在国外的应用，例如被集成到一些工具中。以下重点对这些应用进行说明。


## ATT&CK信息平台

有很多平台用于发布ATT&CK相关信息，或者进行信息的可视化，方便用户理解使用。以下列举几个相关平台。

### 1、ATT&CK Groups

**网址：**https://shield.mitre.org/attack_groups/

**介绍：**该网站将各个 APT 组织公开报告中的攻击技术和使用的恶意软件，使用 ATT&CK 进行了归档。如下图所示：

![1-Group](/ATT&CK/1-Group.png)



### 2、Navigator

**网址：**https://github.com/mitre-attack/attack-navigator

https://mitre-attack.github.io/attack-navigator/enterprise/

 

**介绍：**此工具是ATT&CK的导航器，旨在提供导航和注释，可以帮助分析人员将分析结果映射到矩阵中，进行可视化操作。

### 3、OSSEM

**网址：**https://github.com/OTRF/OSSEM

https://ossemproject.com/intro.html

 

介绍：开源安全事件元数据（OSSEM）是一个社区主导的项目，主要关注来自不同数据源和操作系统的安全事件日志的文档和标准化。它由 Rodriguez 兄弟创建，提供数据源相关的四类信息：ATT&CK数据源、检测数据模型、通用信息模型和数据字典。

### 4、CAR

**网址：**https://car.mitre.org

**介绍：**MITRE发布了CAR，作为一个分析共享平台。CAR包含了映射到特定ATT&CK技术的分析，并描述了高级分析假设、伪代码分析实现、单元测试以及用于开发它们的数据模型，以便将分析转换到各种分析平台。CAR可以供整个社区的网络防御者使用，并且可以对对手行为进行分析。

 

### 5、对手模拟计划

网址：https://attack.mitre.org/resources/adversary-emulation-plans/

介绍：为了展示ATT&CK在进攻方和防守方的实际应用，MITRE创建了对手模拟计划。此项目的目的是让红队能够更加准确高效地模拟攻击行为，从而使得防守方能够更加有效地测试自己的网络防御能力。

 

### 6、Osquery-ATT&CK

网址：https://github.com/teoseller/osquery-attck

介绍：此存储库的目标是将MITRE ATT&CK与Osquery映射，用来查找企业威胁。代码文件中每个conf文件都是一个查询包，可以在osquery中使用。GitHub上项目代码见下图。

 ![2-Osquery](/ATT&CK/2-Osquery.png)



 

## 二、使用ATT&CK模拟攻击的工具

​    为了更好地检测自身的防御能力，通常需要进行攻击的模拟。以下几个开源工具集成了ATT&CK框架，用于模拟攻击行为。

### 1、Red Team Automation (RTA)

**网址：**https://github.com/endgameinc/RTA

**介绍：**RAT由python脚本组成，这些脚本可以生成超过50种不同的ATT&CK战术，并且执行相应的恶意活动。RAT提供了一个脚本框架，该框架旨在让蓝队成员去测试自己在ATT&CK方面针对恶意攻击的检测能力。

 

### 2、Atomic Red Team

**网址：**https://github.com/redcanaryco/atomic-red-team

**介绍：**它是一个测试集合，可以映射到ATT&CK上。它不基于Python或任何其他脚本语言。相反，它由单独的指令（而不是脚本本身）组成，这些指令与特定的ATT&CK策略相匹配。

 

### 3、Caldera

网址：https://github.com/mitre/caldera

介绍：CALDERA是一个网络安全框架，它基于MITER ATT＆CK框架构建，可以模拟对手的行为，是MITRE的一项研究项目。该框架包含两个组件：(1)核心系统，这是框架代码，由该存储库中可用的内容组成。其中包括带有REST API和Web界面的异步命令和控制（C2）服务器。(2)插件，这些是独立于核心框架的存储库，提供了其他功能。示例包括代理，GUI界面，TTP集合等。

### 4、Uber--- Metta

网址：https://github.com/uber-common/metta

介绍：Metta是一个允许使用Redis/Cellery、python和vagrant与virtualbox进行对抗模拟的工具，此工具允许对主机进行检测，也允许对网络进行检测和控制。

 

以上四种工具的对比及各自特点如下图所示：

![3-tool_compare](/ATT&CK/3-tool_compare.png)

还有其他收费的工具，如：Safebreach、AttackIQ的FireDrill或Verodin等。

 

## 三、利用ATT&CK进行攻击发现或攻击分类

### 1、rcATT

网址：https://github.com/vlegoy/rcATT

文章：Automated Retrieval of ATT&CK Tactics and Techniques for Cyber Threat Reports 

介绍：rcATT了利用MITRE ATT&CK框架，是一个开放的对抗战术和技术知识库，来训练分类器和标记结果。rcATT最近已整合到CERT的工具链中，以支持威胁情报共享和分析过程。

 

### 2、Unfetter Insight

网址：https://github.com/unfetter-discover/unfetter-insight

介绍：运用自然语言处理等的方法，去检测出存在的ATT&CK模式。现在此工具可以检测的文件格式包括：txt、pdf和html。

 

 

### 3、SysmonHunter

网址：https://github.com/baronpan/SysmonHunter

介绍：它是一个基于ATT&CK的sysmon日志狩猎工具，为APT hunt和IR提供了一种更有效的方法。基于 Sysmon 的日志数据结构定义了整个攻击生命周期行为的示例。该工作2019年在black hat上展示。

 

### 4、TTPDrill

文章：TTPDrill: Automatic and Accurate Extraction of Threat Actions from Unstructured Text of CTI Sources

介绍：该文章提出了一种新的文本挖掘方法，该方法结合了自然语言处理（NLP）的增强技术和信息检索（IR）技术去提取基于语义的威胁行为。同时，还将威胁活动映射为对应的ATT&CK术语。

 

### 5、hybrid analysis

网址：https://twitter.com/HybridAnalysis/status/1017066468888981505

介绍：2018年7月11日Hybrid Analysis 发布推特称其已经添加新功能，可以将恶意软件的行为指标映射到 MITRE ATT&CK 框架。

 

### 6、AnyRun沙箱

网址：https://any.run/cybersecurity-blog/mitre-attack/

介绍：AnuRun是一个交互式恶意软件分析工具，它集成了MITRE ATT&CK。这样可以帮助研究人员快速有效地找到特定的恶意软件样本，帮助沙箱用户更好地识别恶意软件的攻击行为，包括恶意软件可能组合使用了一些特定技术。

 

### 7、SANS

网址：https://www.sans.org/webcasts/measuring-improving-cyber-defense-mitre-att-ck-framework-114010/

介绍：2020年7月21日，SANS发布声明，宣布使用MITRE ATT&CK框架来衡量并改进自己的网络防御功能。

 

## 四、APT报告中对ATT&CK的使用

​    很多APT分析报告在最后都使用ATT&CK来对APT组织的攻击行为进行描述。以下举一个例子。

cyble：Bahamut组织利用钓鱼网站分发Android APK，文章发表于2021年8月10日，文章地址：https://blog.cyble.com/2021/08/10/bahamut-threat-group-targeting-users-through-phishing-campaign/。

其中ATT&CK内容如下：

![4-paper](/ATT&CK/4-paper.png)