---
date: 2023-05-11 11:36:56
layout: post
tags: null
categories:
  - 未写完
title: docker搭建sql注入环境
---

毕设计划用docker实现各种环境的搭建，现在进行搭建记录。



参考：DetGen的capture-150-insecureSQLwithXSS



原本的 detlearsom/php 找不到了，改用ubuntu/apache2



网络结构：

```bash
networks:
  capture:
    driver: "bridge"
    ipam:
      driver: default
      config:
      - subnet: 172.160.238.0/24
        gateway: 172.160.238.1
```





## mysql服务



Docker镜像

```bash
sql:
  image: 'mysql/mysql-server'
  container_name: mysql2
  ports:
    - '3306'
  volumes: 
    - $PWD/sql-share:/home/share/
    - $PWD/sql_settings/my.cnf:/etc/my.cnf
  networks:
    capture:
      ipv4_address: 172.160.238.22
```



```bash
CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS

83a77df84b90   mysql/mysql-server    "/entrypoint.sh mysq…"   14 minutes ago   Up 13 minutes (healthy)   33060-33061/tcp, 0.0.0.0:49153->3306/tcp, :::49153->3306/tcp   mysql2
```











## apache服务

```bash
apache:
  image: 'httpd'
  volumes:
     - '$PWD/config:/var/www/html'
  ports:
    - "80:80"
  networks:
    capture:
      ipv4_address: 172.160.238.20
```



原来有80端口在占用，删除掉apache进程即可。



出现报错：

进入容器

docker exec -i 85960e6d946f bash



本机缺少stress，安装。

```bash
apt-get update
apt-get install stress
```

但是感觉对我没啥帮助，故删除stress的命令。



docker容器进入哪儿，根目录就是在哪。



使用 php:apache 镜像

出现如下错误

```php+HTML
Fatal error: Uncaught Error: Call to undefined function mysqli_connect() in /var/www/html/config.php:10 Stack trace: #0 /var/www/html/login.php(20): require_once() #1 {main} thrown in /var/www/html/config.php on line 10
```

缺少mysqli扩展，

```bash
apt-get install php-mysqli
```

通过更换镜像解决了。



最终使用：mmorejon/apache2-php5



出现错误：mysql的密码不对。

```bash
Warning: mysqli_connect(): (HY000/2003): Can't connect to MySQL server on '172.16.238.22' (110) in /app/config.php on line 10 ERROR: Could not connect. Can't connect to MySQL server on '172.16.238.22' (110)
```



启动容器之后会运行run.sh



进入容器内部，service apache2 status。

 * apache2 is running









## 攻击者

```bash
attacker:
  image: 'python-requests'
  command: tail -f /dev/null
  volumes:
    - '$PWD/attacker-share:/usr/share/scripts'
  networks:
    - capture
```







## 总体流程



image_build.sh调用每个容器文件内的build.sh。



build.sh流程

```python
1.定义一些变量

2. ✅ UserID_generator.sh
---- 变量 ULength PWLength，分别表示用户名长度和密码长度
---- export User Password，导出用户名和密码

3. activity_selector.sh
---- 随机选择场景, 此处共有3个场景。

4. 启动容器
---- mysql容器：(172.160.238.22:3306)
              pwd
              /home/share

              ls
              dbname.sql
              sql_script.sh
              sql_script2.sh
            
            	
              /etc/my.cnf
              
---- apache容器：(172.160.238.20:80)
							/var/www/html

5. ❌ container_tc.sh（我的实验不需要）
---- ContainerIDS 存储容器的名称
---- round()，用于取整
---- get_container_veth()，用于获取指定容器的虚拟以太网接口（veth）的名称
---- tc进行拥塞控制

6. ❌ set_load.sh 设置主机负载（我的实验不需要）
---- 使用stress命令模拟cpu负载

7. 启动mysql容器
---- 运行 /home/share/sql_script2.sh，传入密码参数。

```