# git

## 概述

Git 是一个免费的、开源的分布式版本控制系统，可以快速高效地处理从小型到大型的各种

项目。

Git 易于学习，占地面积小，性能极快。 它具有廉价的本地库，方便的暂存区域和多个工作

流分支等特性。其性能优于 Subversion、CVS、Perforce 和 ClearCase 等版本控制工具。

## Git常用命令

| 命令名称                             | 作用           |
| ------------------------------------ | -------------- |
| git config --global user.name 用户名 | 设置用户签名   |
| git config --global user.email 邮箱  | 设置用户签名   |
| git init                             | 初始化本地库   |
| git status                           | 查看本地库状态 |
| git add 文件名                       | 添加到暂存区   |
| git commit -m "日志信息" 文件名      | 提交到本地库   |
| git reflog                           | 查看历史记录   |
| git reset --hard 版本号              | 版本穿梭       |

![image-20220629121806892](https://pic.imgdb.cn/item/62bbd27f1d64b07066f0fcdc.png)

### 设置用户签名

签名的作用是区分不同操作者身份。用户的签名信息在每一个版本的提交信息中能够看 到，以此确认本次提交是谁做的。Git 首次安装必须设置一下用户签名，否则无法提交代码。

1、基本语法

```git config --global user.name 用户名```

```git config --global user.email  邮箱```

※注意： 这里设置用户签名和将来登录 GitHub  (或其他代码托管中心)的账号没有任 何关系。

签名的作用是区分不同操作者身份。用户的签名信息在每一个版本的提交信息中能够看 到，以此确认本次提交是谁做的。Git 首次安装必须设置一下用户签名，否则无法提交代码。

※注意： 这里设置用户签名和将来登录 GitHub  (或其他代码托管中心)的账号没有任 何关系。

查看用户签名

![image-20220629121806892](https://pic.imgdb.cn/item/62bbd27f1d64b07066f0fcdc.png)

### 初始化本地库

```git init```

会自动生成 .git文件夹

![image-20220629122650353](https://pic.imgdb.cn/item/62bbd48a1d64b07066f38d43.png)

### 查看本地库状态

```git status```

- 首次查看

![image-20220629123212839](https://pic.imgdb.cn/item/62bbd5cd1d64b07066f5267b.png)

- 创建文件后查看（vim hello.txt）
- ![image-20220629123314737](https://pic.imgdb.cn/item/62bbd60b1d64b07066f57aa8.png)

### 添加文件到暂存区

```git add```

![image-20220629124227098](https://pic.imgdb.cn/item/62bbd8331d64b07066f809ac.png)

再次查看状态

![image-20220629124304441](https://pic.imgdb.cn/item/62bbd8581d64b07066f83a7c.png)

删除暂存区文件，对工作区没有影响

```git rm --cached <file>```

![image-20220629124607653](https://pic.imgdb.cn/item/62bbd9101d64b07066f912c2.png)

### 提交本地库

将暂存区的文件提交到本地库

```git commit -m "日志信息" 文件名```

![image-20220629125051911](https://pic.imgdb.cn/item/62bbda2c1d64b07066fa56c6.png)

### 历史版本

```git reflog```查看版本信息

```git log```查看版本详细信息

- 版本穿梭

  ```git reset --hard 版本号```

  Git 切换版本， 底层其实是移动的 HEAD 指针

## Git分支操作

![img](https://pic.imgdb.cn/item/62bbee5c1d64b0706615285a.png)

### 分支

#### 概念

在版本控制过程中， 同时推进多个任务，为每个任务， 我们就可以创建每个任务的单独 分支。使用分支意味着程序员可以把自己的工作从开发主线上分离开来，开发自己分支的时 候， 不会影响主线分支的运行。对于初学者而言， 分支可以简单理解为副本，一个分支就是 一个单独的副本。(分支底层其实也是指针的引用)

#### 好处

同时并行推进多个功能开发，提高开发效率。

各个分支在开发过程中， 如果某一个分支开发失败，不会对其他分支有任何影响。失败 的分支删除重新开始即可。

### 常用命令

| 命令名称            | 作用                         |
| ------------------- | ---------------------------- |
| git branch 分支名   | 创建分支                     |
| git branch -v       | 查看分支                     |
| git checkout 分支名 | 切换分支                     |
| git merge 分支名    | 把指定的分支合并到当前分支上 |

#### 查看分支

```git branch -v```

```
$ git branch -v
* master 087a1a7 my third commit  (*代表当前所在的分区)
```

#### 创建分支

```git branch 分支名```

#### 切换分支

```git checkout 分支名```

![image-20220629142431770](https://pic.imgdb.cn/item/62bbf0201d64b0706617a8be.png)

#### 合并分支

```git merge 分支名```

合并时可能会产生冲突，冲突产生的表现：后面状态为 M3RGING

- 冲突产生的原因：

  合并分支时，两个分支在同一个文件的同一个位置有两套完全不同的修改。 Git 无法替 我们决定使用哪一个。必须人为决定新代码内容。

- 解决冲突：

  1、编辑有冲突的文件，删除特殊符号，决定要使用的内容

  特殊符号： <<<<<<< HEAD 当前分支的代码 =======   合并过来的代码  >>>>>>> hot-fix

  2、添加到暂存区

  3、执行提交(注意： 此时使用git commit 命令时不能带文件名)

### git.gitignore模版

```
######################
# 解决java产生文件
######################
*.class

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.ear

# virtual machine crash logs, see http://www.java.com/en/download/help/error_hotspot.xml
hs_err_pid*

######################
# 解决maven产生的文件
######################

target/
**/target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties

######################
# 解决各类编辑器自动产生的文件
######################

*.iml

## Directory-based project format:
.idea/
# if you remove the above rule, at least ignore the following:

# User-specific stuff:
# .idea/workspace.xml
# .idea/tasks.xml
# .idea/dictionaries

# Sensitive or high-churn files:
# .idea/dataSources.ids
# .idea/dataSources.xml
# .idea/sqlDataSources.xml
# .idea/dynamic.xml
# .idea/uiDesigner.xml

# Gradle:
# .idea/gradle.xml
# .idea/libraries

# Mongo Explorer plugin:
# .idea/mongoSettings.xml

## File-based project format:
*.ipr
*.iws

## Plugin-specific files:

# IntelliJ
/out/
/target/

# mpeltonen/sbt-idea plugin
.idea_modules/

# JIRA plugin
atlassian-ide-plugin.xml

# Crashlytics plugin (for Android Studio and IntelliJ)
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties
```

