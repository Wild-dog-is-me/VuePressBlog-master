单个的 RabbitMQ 肯定无法实现高可用，要想高可用，还得上集群。

## 两种模式

说到集群，小伙伴们可能第一个问题是，如果我有一个 RabbitMQ 集群，那么是不是我的消息集群中的每一个实例都保存一份呢？

这其实就涉及到 RabbitMQ 集群的两种模式：

- 普通集群
- 镜像集群

## 普通集群

普通集群模式，就是将 RabbitMQ 部署到多台服务器上，每个服务器启动一个 RabbitMQ 实例，多个实例之间进行消息通信。

此时我们创建的队列 Queue，它的元数据（主要就是 Queue 的一些配置信息）会在所有的 RabbitMQ 实例中进行同步，但是队列中的消息只会存在于一个 RabbitMQ 实例上，而不会同步到其他队列。

当我们消费消息的时候，如果连接到了另外一个实例，那么那个实例会通过元数据定位到 Queue 所在的位置，然后访问 Queue 所在的实例，拉取数据过来发送给消费者。

这种集群可以提高 RabbitMQ 的消息吞吐能力，但是无法保证高可用，因为一旦一个 RabbitMQ 实例挂了，消息就没法访问了，如果消息队列做了持久化，那么等 RabbitMQ 实例恢复后，就可以继续访问了；如果消息队列没做持久化，那么消息就丢了。

大致的流程图如下图：

![图片](https://pic.imgdb.cn/item/6245651827f86abb2a3fa367.png)

## 镜像集群

它和普通集群最大的区别在于 Queue 数据和原数据不再是单独存储在一台机器上，而是同时存储在多台机器上。也就是说每个 RabbitMQ 实例都有一份镜像数据（副本数据）。每次写入消息的时候都会自动把数据同步到多台实例上去，这样一旦其中一台机器发生故障，其他机器还有一份副本数据可以继续提供服务，也就实现了高可用。

大致流程图如下图：

![图片](https://pic.imgdb.cn/item/6245652927f86abb2a3fc061.png)

## 节点类型

RabbitMQ 中的节点类型有两种：

- RAM node：内存节点将所有的队列、交换机、绑定、用户、权限和 vhost 的元数据定义存储在内存中，好处是可以使得交换机和队列声明等操作速度更快。
- Disk node：将元数据存储在磁盘中，单节点系统只允许磁盘类型的节点，防止重启 RabbitMQ 的时候，丢失系统的配置信息

RabbitMQ 要求在集群中至少有一个磁盘节点，所有其他节点可以是内存节点，当节点加入或者离开集群时，必须要将该变更通知到至少一个磁盘节点。如果集群中唯一的一个磁盘节点崩溃的话，集群仍然可以保持运行，但是无法进行其他操作（增删改查），直到节点恢复。为了确保集群信息的可靠性，或者在不确定使用磁盘节点还是内存节点的时候，建议直接用磁盘节点。

### 搭建普通集群

大致的结构了解了，接下来我们就把集群给搭建起来。先从普通集群开始，我们就使用 docker 来搭建。

搭建之前，有两个预备知识需要大家了解：

1. 搭建集群时，节点中的 Erlang Cookie 值要一致，默认情况下，文件在 /var/lib/rabbitmq/.erlang.cookie，我们在用 docker 创建 RabbitMQ 容器时，可以为之设置相应的 Cookie 值。
2. RabbitMQ 是通过主机名来连接服务，必须保证各个主机名之间可以 ping 通。可以通过编辑 /etc/hosts 来手工添加主机名和 IP 对应关系。如果主机名 ping 不通，RabbitMQ 服务启动会失败（如果我们是在不同的服务器上搭建 RabbitMQ 集群，大家需要注意这一点，接下来我们将通过 Docker 的容器连接 link 来实现容器之间的访问，略有不同）。

## 开始搭建

执行如下命令创建三个rabbitmq容器

```bash
docker run -d --hostname rabbit01 --name mq01 -p 5671:5672 -p 15671:15672 -e RABBITMQ_ERLANG_COOKIE="javaboy_rabbitmq_cookie" rabbitmq:3-management

docker run -d --hostname rabbit02 --name mq02 --link mq01:mylink01 -p 5672:5672 -p 
15672:15672 -e RABBITMQ_ERLANG_COOKIE="javaboy_rabbitmq_cookie" rabbitmq:3-management

docker run -d --hostname rabbit03 --name mq03 --link mq01:mylink02 --link mq02:mylink03 -p 5673:5672 -p 15673:15672 -e RABBITMQ_ERLANG_COOKIE="javaboy_rabbitmq_cookie" rabbitmq:3-management
```

运行结果如下

![image-20220806095159632](https://pic.imgdb.cn/item/62edc9408c61dc3b8e1960d3.png)

三个节点现在就启动好了，注意在 mq02 和 mq03 中，分别使用了 `--link` 参数来实现容器连接

接下来进入到 mq02 容器中，首先查看一下 hosts 文件，可以看到我们配置的容器连接已经生效了：

![image-20220806095342578](https://pic.imgdb.cn/item/62edc9a78c61dc3b8e1a9aa2.png)

将来在 mq02 容器中，就可以通过 mylink01 或者 rabbit01 访问到 mq01 容器了。

接下来我们开始集群的配置。

分别执行如下命令将 mq02 容器加入集群中：

```bash
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@rabbit01
rabbitmqctl start_app
```



![image-20220806095508177](https://pic.imgdb.cn/item/62edc9fc8c61dc3b8e1ba706.png)

接下来输入如下命令我们可以查看集群的状态：

```bash
rabbitmqctl cluster_status
```

![image-20220806095626749](https://pic.imgdb.cn/item/62edca4b8c61dc3b8e1c922f.png)

可以看到，集群中已经有两个节点了。

接下来通过相同的方式将 mq03 也加入到集群中：

```bash
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@rabbit01
rabbitmqctl start_app
```

然后查看集群信息

```bash
rabbitmqctl cluster_status
```

![image-20220806095821318](https://pic.imgdb.cn/item/62edcabe8c61dc3b8e1e02ee.png)

可以看到，这时候已经有三个节点了

在网页端也可以来查看集群信息。

![image-20220806101159607](https://pic.imgdb.cn/item/62edcdf08c61dc3b8e287543.png)

## 代码测试

集群配置

```properties
spring.rabbitmq.addresses=localhost:5671,localhost:5672,localhost:5673
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

提供一个简单的队列

```java
@Configuration
public class RabbitConfig {
    public static final String MY_QUEUE_NAME = "my_queue_name";
    public static final String MY_EXCHANGE_NAME = "my_exchange_name";
    public static final String MY_ROUTING_KEY = "my_queue_name";

    @Bean
    Queue queue() {
        return new Queue(MY_QUEUE_NAME, true, false, false);
    }

    @Bean
    DirectExchange directExchange() {
        return new DirectExchange(MY_EXCHANGE_NAME, true, false);
    }

    @Bean
    Binding binding() {
        return BindingBuilder.bind(queue())
                .to(directExchange())
                .with(MY_ROUTING_KEY);
    }
}
```

在单元测试中进行消息发送测试：

```java
@SpringBootTest
class ProviderApplicationTests {

    @Autowired
    RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
        rabbitTemplate.convertAndSend(null, RabbitConfig.MY_QUEUE_NAME, "hello 江南一点雨");
    }

}
```

这条消息发送成功之后，在 RabbitMQ 的 Web 管理端，我们会看到三个 RabbitMQ 实例上都会显示有一条消息，但是实际上消息本身只存在于一个 RabbitMQ 实例。

接下来我们再创建一个消息消费者，消息消费者的依赖以及配置和消息生产者都是一模一样，我就不重复了，消息消费者中增加一个消息接收器：

```java
@Component
public class MsgReceiver {

    @RabbitListener(queues = RabbitConfig.MY_QUEUE_NAME)
    public void handleMsg(String msg) {
        System.out.println("msg = " + msg);
    }
}
```

当消息消费者启动成功后，这个方法中只收到一条消息，进一步验证了我们搭建的 RabbitMQ 集群是没问题的。

## 反向测试

再举两个反例，以证明消息并没有同步到其他 RabbitMQ 实例。

确保三个 RabbitMQ 实例都是启动状态，关闭掉 Consumer，然后通过 provider 发送一条消息，发送成功之后，关闭 mq01 实例，然后启动 Consumer 实例，此时 Consumer 实例并不会消费消息，反而会报错说 mq01 实例连接不上，这个例子就可以说明消息在 mq01 上，并没有同步到另外两个 MQ 上。相反，如果 provider 发送消息成功之后，我们没有关闭 mq01 实例而是关闭了 mq02 实例，那么你就会发现消息的消费不受影响。

## 搭建镜像集群

所谓的镜像集群模式并不需要额外搭建，只需要我们将队列配置为镜像队列即可。

这个配置可以通过网页配置，也可以通过命令行配置，我们分别来看。

## 网页配置镜像队列

先来看看网页上如何配置镜像队列。

点击 Admin 选项卡，然后点击右边的 Policies，再点击 `Add/update a policy`，如下图：

![图片](https://pic.imgdb.cn/item/62edfa7b8c61dc3b8ed48b47.png)

接下来添加一个策略，如下图：

![图片](https://pic.imgdb.cn/item/62edfa878c61dc3b8ed4b941.png)

各参数含义如下：

- Name: policy 的名称。

- Pattern: queue 的匹配模式(正则表达式)。

- Definition：镜像定义，主要有三个参数：ha-mode, ha-params, ha-sync-mode。

- - ha-mode：指明镜像队列的模式，有效值为 all、exactly、nodes。其中 all 表示在集群中所有的节点上进行镜像（默认即此）；exactly 表示在指定个数的节点上进行镜像，节点的个数由 ha-params 指定；nodes 表示在指定的节点上进行镜像，节点名称通过 ha-params 指定。
- ha-params：ha-mode 模式需要用到的参数。
- ha-sync-mode：进行队列中消息的同步方式，有效值为 automatic 和 manual。

- priority 为可选参数，表示 policy 的优先级。

配置完成后，点击下面的 `add/update policy` 按钮，完成策略的添加，如下：

![图片](https://pic.imgdb.cn/item/62edfa998c61dc3b8ed50d1e.png)

添加完成后，我们可以进行一个简单的测试。

首先确认三个 RabbitMQ 都启动了，然后用上面的 provider 向消息队列发送一条消息。

发完之后关闭 mq01 实例。

接下来启动 consumer，此时发现 consumer 可以完成消息的消费（注意和前面的反向测试区分），这就说明镜像队列已经搭建成功了。