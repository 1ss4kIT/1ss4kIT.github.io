---
layout: post
title: ssh登陆失败的解决方法
tags: []
categories:
  - 杂记
date: 2021-03-05 21:52:00
---
之前想设置ssh连接不断开，一通操作之后不能登陆了... 以下记录恢复过程。

```python
my@192:~$ --> ssh -p22 root@(ip)
ssh: connect to host (ip) port 22: Connection refused
```



1、更改服务器ssh配置

​	依稀记得是在`/etc/ssh/sshd_config`中加了两条语句，现在尝试把它删掉。但是现在不能直接ssh登陆，final shell也不能登陆，控制台标准方式也不行(需要开启ssh端口)，采用控制台VNC方式。

​	root用户登录不上(不知道为啥)，先登陆普通用户，`su root`切换用户登陆。

​	罪魁祸首如下


![upload successful](/images/pasted-248.png)

参考https://blog.csdn.net/tojohnonly/article/details/79746588，

设置为

```python
ClientAliveInterval 60
ClientAliveCountMax 3
```

再`systemctl restart sshd` 重启ssh服务。

成功啦～～～

![upload successful](/images/pasted-249.png)



2、设置ssh连接不断开

参考`https://ngwind.github.io/2019/01/25/保持ssh服务连接不断开的方法/`，原来的设置应该就可以保持连接～