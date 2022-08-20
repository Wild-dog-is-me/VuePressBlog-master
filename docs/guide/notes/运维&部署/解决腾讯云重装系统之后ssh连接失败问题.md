# 解决腾讯云重装系统之后ssh连接失败问题



- 服务端版本：腾讯云[CentOS7](https://so.csdn.net/so/search?q=CentOS7&spm=1001.2101.3001.7020).6
- 客户端版本：macOS Monterey 12.2.1

### 一、客户端问题

首先ssh连接之后在客户端的`~/.ssh/known_hosts`下，生成相关连接记录，重置服务器之后因为记录对不上所以会连接失败

在客户端`sudo vim ~/.ssh/known_hosts`

找到相关IP，快捷键**dd**删掉然后wq退出

### 二、服务端问题

腾讯云重置应用之后会**修改ssh的配置文件**，我真是*了狗了，折腾了一个多小时

在服务器的`/etc/ssh/sshd_config`目录下进行如下修改(vim进入后，按 Esc 键进入命令模式并使用```:set number!```)

```bash
17行的Port  22 注释去掉

38行的PermitRootLogin yes注释去掉

65行的PasswordAuthentication no改为yes 并去掉注释
```