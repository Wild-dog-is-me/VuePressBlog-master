## RabbitMQ安装

使用Docker安装，在dockerhub中搜索rabbitmq

![image-20220731185307849](https://pic.imgdb.cn/item/62e65f148c61dc3b8ee14367.png)

不带management的是没有web管理页面的，需要通过命令来安装。

本次选择3.10.6-management版本

![image-20220731185458254](https://pic.imgdb.cn/item/62e65f828c61dc3b8ee1aae4.png)

安装命令

```bash
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3-management
```

运行命令

```
docker run -d --hostname my-rabbit --name rabbit01 -p 15672:15672 -p 5672:5672 rabbitmq:3-management
```

⚠️记得开启服务器对应的防火墙～

## RabbitMQ 管理页面

![image-20220731190729538](https://pic.imgdb.cn/item/62e662718c61dc3b8ee48078.png)

默认的账号密码均为：guest

![image-20220731190908319](https://pic.imgdb.cn/item/62e662d58c61dc3b8ee4de1b.png)

首先一共有六个选项卡：

1. Overview：这里可以概览 RabbitMQ 的整体情况，如果是集群，也可以查看集群中各个节点的情况。包括 RabbitMQ 的端口映射信息等，都可以在这个选项卡中查看。
2. Connections：这个选项卡中是连接上 RabbitMQ 的生产者和消费者的情况。
3. Channels：这里展示的是“通道”信息，关于“通道”和“连接”的关系，松哥在后文再和大家详细介绍。
4. Exchange：这里展示所有的交换机信息。
5. Queue：这里展示所有的队列信息。
6. Admin：这里展示所有的用户信息。

右上角是页面刷新的时间，默认是 5 秒刷新一次，展示的是所有的 Virtual host。

这是整个管理页面的一个大致情况，接下来我们来逐个介绍。

### OverView

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57Z1mIMbf3Lwd5CibYfFVwHAYdO3kXJaXG6r0NLnXibSrwVyib3qcYN5ZGgQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**Totals：**

Totals 里面有 准备消费的消息数、待确认的消息数、消息总数以及消息的各种处理速率（发送速率、确认速率、写入硬盘速率等等）。

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZDQ7VibmPiclEMU25AkfaBBLHUaiaxzoO2LLibIDWO7YUVZbRsZtrGibKIvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**Nodes：**

Nodes 其实就是支撑 RabbitMQ 运行的一些机器，相当于集群的节点。

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZdT1NDLezeDkjO17GPS3XyjXEPujEEic5gtygSDSQSCq1VnvdUeSJvGQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

点击每个节点，可以查看节点的详细信息。

**Churn statistics：**

里边展示的是 Connection、Channel 以及 Queue 的创建/关闭速率。

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZPomAKSPJn3ibcVzBYEzicxbe3MjMl9Q1WnUSaPJe8NzUiakw7x59pp0pw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**Ports and contexts：**

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZNia8X62Ylxz1YlATe83EibovCq8pmLibvNw2tkx1gNKkorLWqckdUvnjw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这个里边展示了端口的映射信息以及 Web 的上下文信息。

- 5672 是 RabbitMQ 通信端口。
- 15672 是 Web 管理页面端口。
- 25672 是集群通信端口。

**Export definitions** && **Import definitions：**

最后面这两个可以导入导出当前实例的一些配置信息：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57Z5GcXVFE5cyaX4qm97icic7nnsibeusjtHszk3KKj1LGQDdma9XcvWMwUQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### Connections

这里主要展示的是当前连接上 RabbitMQ 的信息，无论是消息生产者还是消息消费者，只要连接上来了这里都会显示出来。

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZiaBJNY3q7QVXEOwDduP2hdQ9bcSjPjckiccC4ibAGugJvfr3SJ9T17UxA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

注意协议中的 AMQP 0-9-1 指的是 AMQP 协议的版本号。

其他属性含义如下：

- User name：当前连接使用的用户名。
- State：当前连接的状态，running 表示运行中；idle 表示空闲。
- SSL/TLS：表示是否使用 ssl 进行连接。
- Channels：当前连接创建的通道总数。
- From client：每秒发出的数据包。
- To client：每秒收到的数据包。

点击连接名称可以查看每一个连接的详情。

在详情中可以查看每一个连接的通道数以及其他详细信息，也可以强制关闭一个连接。

### Channels

这个地方展示的是通道的消息：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZatPD7JfoBbYh0QwdRlibp2P4zpTejX5pgTr9fOrS202Yalgb0Fb1YCA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**通道：**

一个连接（IP）可以有多个通道，如上图，一共是两个连接，但是一共有 12 个通道。

一个连接可以有多个通道，这个多个通道通过多线程实现，一般情况下，我们在通道中创建队列、交换机等。

生产者的通道一般会立马关闭；消费者是一直监听的，通道几乎是会一直存在。

上面各项参数含义分别如下：

- Channel：通道名称。
- User name：该通道登录使用的用户名。
- Model：通道确认模式，C 表示 confirm；T 表示事务。
- State：通道当前的状态，running 表示运行中；idle 表示空闲。
- Unconfirmed：待确认的消息总数。
- Prefetch：Prefetch 表示每个消费者最大的能承受的未确认消息数目，简单来说就是用来指定一个消费者一次可以从 RabbitMQ 中获取多少条消息并缓存在消费者中，一旦消费者的缓冲区满了，RabbitMQ 将会停止投递新的消息到该消费者中直到它发出有消息被 ack 了。总的来说，消费者负责不断处理消息，不断 ack，然后只要 unAcked 数少于 prefetch * consumer 数目，RabbitMQ 就不断将消息投递过去。
- Unacker：待 ack 的消息总数。
- publish：消息生产者发送消息的速率。
- confirm：消息生产者确认消息的速率。
- unroutable (drop)：表示未被接收，且已经删除了的消息。
- deliver/get：消息消费者获取消息的速率。
- ack：消息消费者 ack 消息的速率。

### Exchange

这个地方展示交换机信息：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZjoulfXxBc3jO00gHUoxxEEokdxdaiawajNERcVnwouENDbEficnxqOmw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这里会展示交换机的各种信息。

Type 表示交换机的类型。

Features 有两个取值 D 和 I。

D 表示交换机持久化，将交换机的属性在服务器内部保存，当 MQ 的服务器发生意外或关闭之后，重启 RabbitMQ 时不需要重新手动或执行代码去建立交换机，交换机会自动建立，相当于一直存在。

I 表示这个交换机不可以被消息生产者用来推送消息，仅用来进行交换机和交换机之间的绑定。

Message rate in 表示消息进入的速率。Message rate out 表示消息出去的速率。

点击下方的 **Add a new exchange** 可以创建一个新的交换机。

### Queue

这个选项卡就是用来展示消息队列的：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57Z7SAZ0dqhtmwDNkOhyDoQP9FtiaUn3k8RSJYR0bWEichDEQz81kPNOUfg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

各项含义如下：

- Name：表示消息队列名称。
- Type：表示消息队列的类型，除了上图的 classic，另外还有一种消息类型是 Quorum。两个区别如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZQ4LcMg0F5RUVVbNPcT3ibFQwUZC11j0vNv0mGSBGAJ3WPHCaxtKePiaA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- Features：表示消息队列的特性，D 表示消息队列持久化。
- State：表示当前队列的状态，running 表示运行中；idle 表示空闲。
- Ready：表示待消费的消息总数。
- Unacked：表示待应答的消息总数。
- Total：表示消息总数 Ready+Unacked。
- incoming：表示消息进入的速率。
- deliver/get：表示获取消息的速率。
- ack：表示消息应答的速率。

点击下方的 Add a new queue 可以添加一个新的消息队列。

点击每一个消息队列的名称，可以进入到消息队列中。进入到消息队列后，可以完成对消息队列的进一步操作，例如：

- 将消息队列和某一个交换机进行绑定。
- 发送消息。
- 获取一条消息。
- 移动一条消息（需要插件的支持）。
- 删除消息队列。
- 清空消息队列中的消息。
- ...

如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZP5ptm7QV00LyyEV31ZHnrJelKjx6686WiaLn4Nnyia6H2Sl0sLIXuaUw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### Admin

这里是做一些用户管理操作，如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZEPfYonXl069eLll3EVfBXwSJYv74Z8F5NLBl9uCwz9BUURy0j1R5QQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

各项属性含义如下：

- Name：表示用户名称。
- Tags：表示角色标签，只能选取一个。
- Can access virtual hosts：表示允许进入的虚拟主机。
- Has password：表示这个用户是否设置了密码。

常见的两个操作时管理用户和虚拟主机。

点击下方的 Add a user 可以添加一个新的用户，添加用户的时候需要给用户设置 Tags，其实就是用户角色，如下：

- none：不能访问 management plugin
- management：用户可以通过 AMQP 做的任何事 列出自己可以通过 AMQP 登入的 virtual hosts 查看自己的 virtual hosts 中的 queues, exchanges 和 bindings 查看和关闭自己的 channels 和 connections 查看有关自己的 virtual hosts 的“全局”的统计信息，包含其他用户在这些 virtual hosts 中的活动
- policymaker：management 可以做的任何事 查看、创建和删除自己的 virtual hosts 所属的 policies 和 parameters
- monitoring：management 可以做的任何事 列出所有 virtual hosts，包括他们不能登录的 virtual hosts 查看其他用户的 connections 和 channels 查看节点级别的数据如 clustering 和 memory 使用情况 查看真正的关于所有 virtual hosts 的全局的统计信息
- administrator：policymaker 和 monitoring 可以做的任何事 创建和删除 virtual hosts 查看、创建和删除 users 查看创建和删除 permissions 关闭其他用户的 connections
- impersonator(模拟者) 模拟者，无法登录管理控制台。