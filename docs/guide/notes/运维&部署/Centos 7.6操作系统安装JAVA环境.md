### Centos 7.6操作系统安装JAVA环境

```bash
yum -y list java*
```

![image-20220513144010628](https://pic.imgdb.cn/item/627dfd4b0947543129470390.png)

#### 安装Java JDK

```
yum -y install java-1.8.0-openjdk*
```

出现complete!
安装成功

#### 查找java安装路径

```bash
which java
```

![image-20220513144304064](https://pic.imgdb.cn/item/627dfdf8094754312948f5cc.png)

输入ls -lrt /usr/bin/java（也就是上一步查询出来的路径），然后回车

```bash
ls -lrt /usr/bin/java
```

输入ls -lrt /etc/alternatives/java（也就是上一步查询出来的路径），然后回车

```bash
ls -lrt /etc/alternatives/java
```

![image-20220513144430707](https://pic.imgdb.cn/item/627dfe4e094754312949e7a3.png)

从路径中可以看到在jvm目录下，输入cd /usr/lib/jvm，跳转到jvm的目录

```bash
cd /usr/lib/jvm
```

输入ls 列出当前目录下的文件和文件夹

![image-20220513144530181](https://pic.imgdb.cn/item/627dfe8a09475431294a902d.png)

#### 配置Java环境变量

输入vi /etc/profile去编辑环境变量

```bash
vi /etc/profile
```

![image-20220513144731109](https://pic.imgdb.cn/item/627dff0309475431294be331.png)

按键盘上的Esc键退出编辑模式
输入:wq进行保存并退出

输入source /etc/profile，使配置立即生效

```bash
source /etc/profile
```

#### 检查Java安装和配置情况

输入java -version，然后回车

![image-20220513144937612](/Users/zhanghaojian/Library/Application%20Support/typora-user-images/image-20220513144937612.png)

输入javac，然后回车

![image-20220513145015746](https://pic.imgdb.cn/item/627dffa809475431294db6d0.png)

至此 安装完成。