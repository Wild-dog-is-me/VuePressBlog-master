### Redis

## 1、Redis概述

### Redis介绍

- Redis是一个开源的key-value存储系统。
- 和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set –有序集合)和hash（哈希类型）。
- 这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。
- 在此基础上，Redis支持各种不同方式的排序。
- 与memcached一样，为了保证效率，数据都是缓存在内存中。
- 区别的是Redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件。
- 并且在此基础上实现了master-slave(主从)同步。

### 

**配合关系型数据库做高速缓存**

- 高频次，热门访问的数据，降低数据库IO。

- 分布式架构，做session共享。

  ![image-20220514164304374](https://pic.imgdb.cn/item/627f6b99094754312977975c.png)

- 多样的数据结构存储持久化数据

  ![image-20220514164403546](https://pic.imgdb.cn/item/627f6bd4094754312978524e.png)

相关技术
Redis 使用的是单线程 + 多路 IO 复用技术：

多路复用是指使用一个线程来检查多个文件描述符（Socket）的就绪状态，比如调用 select 和 poll 函数，传入多个文件描述符，如果有一个文件描述符就绪，则返回，否则阻塞直到超时。得到就绪状态后进行真正的操作可以在同一个线程里执行，也可以启动线程执行（比如使用线程池）。

串行 vs 多线程 + 锁（memcached） vs 单线程 + 多路 IO 复用 (Redis)（与 Memcache 三点不同：支持多数据类型，支持持久化，单线程 + 多路 IO 复用） 。




## 2、Redis安装

1、下载安装包

```bash
wget http://download.redis.io/releases/redis-6.0.6.tar.gz
```

![image-20220514165138305](https://pic.imgdb.cn/item/627f6d9b09475431297dc17c.png)

下载完成以后我们可以看到如下，其中redis-6.6.6.tar.gz就是我们的目标文件。

2、解压安装包

我们一般将程序的安装包放在opt目录下，所以我们将下载好的安装包移动到opt目录下，并解压。

```bash
mv redis-6.0.6.tar.gz /opt
tar -zxvf redis-6.0.6.tar.gz
```

解压完成以后，文件目录如下。

![image-20220514165357054](https://pic.imgdb.cn/item/627f6e2509475431297f87ac.png)

3、进入解压过后的文件夹

```bash
cd redis-6.0.6
```

![image-20220514165516769](https://pic.imgdb.cn/item/627f6e75094754312980873d.png)

4、基本的环境安装

如果没有gcc环境，需要执行以下命令。
`yum install gcc-c++`
如果有，则直接执行`make`、`make install`命令。

![image-20220514165838158](https://pic.imgdb.cn/item/627f6f3e0947543129831bdb.png)

5、默认安装路径

默认的安装路径一般都是`usr/local/bin`，我们进入到这个目录。

![image-20220514165932980](https://pic.imgdb.cn/item/627f6f75094754312983bf5f.png)

可以看到，已经有了redis服务

6、将配置文件复制粘贴到另一个目录下

```bash
mkdir config # 创建文件夹
cp /opt/redis-6.0.6/redis.conf config # 将/opt目录下redis配置文件拷贝到config目录下
```

这样做的好处是原生的配置文件不动，我们以后做修改就在复制后的配置文件下改动就可以了。

7、redis的后台不是默认启动的，我们需要修改配置文件

```bash
vim redis.conf
```

![image-20220514172636648](https://pic.imgdb.cn/item/627f75cd094754312997b07a.png)



8、启动redis服务

通过指定的配置文件启动

```bash
redis-server /config/redis.conf
```

## 3、Redis常用五大数据类型

redis常见数据类型操作命令  [网页链接](http://www.redis.cn/commands.html)

### 3.1 Redis键（key）

```bash
keys *查看当前库所有key    (匹配：keys *1)
exists key判断某个key是否存在
type key 查看你的key是什么类型
del key       删除指定的key数据
unlink key   根据value选择非阻塞删除
仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
expire key 10   10秒钟：为给定的key设置过期时间
ttl key 查看还有多少秒过期，-1表示永不过期，-2表示已过期

select命令切换数据库
dbsize查看当前数据库的key的数量
flushdb清空当前库
flushall通杀全部库
```

### 3.2 Redis字符串(String)

#### 简介

String是

Redis最基本的类型，可以理解成与Memcached一模一样的类型，一个key对应一个value。

String类型是二进制安全的。意味着Redis的string可以包含任何数据。比如jpg图片或者序列化的对象。

String类型是Redis最基本的数据类型，一个Redis中字符串value最多可以是512M。

#### 常用命令

**set  <key><value>添加键值对**

![image-20220515094151301](https://pic.imgdb.cn/item/62805a600947543129e534b5.png)

- *NX：当数据库中key不存在时，可以将key-value添加数据库

- *XX：当数据库中key存在时，可以将key-value添加数据库，与NX参数互斥

- *EX：key的超时秒数

- *PX：key的超时毫秒数，与EX互斥



**get  <key>查询对应键值**

**append  <key><value>将给定的<value> 追加到原值的末尾**

**strlen  <key>获得值的长度**

**setnx  <key><value>只有在 key 不存在时   设置 key 的值**

**incr  <key>**

- 将 key 中储存的数字值增1

- 只能对数字值操作，如果为空，新增值为1

**decr  <key>**

- 将 key 中储存的数字值减1

- 只能对数字值操作，如果为空，新增值为-1

incrby / decrby  <key><步长>将 key 中储存的数字值增减。自定义步长。



**原子性**

所谓**原子**操作是指不会被线程调度机制打断的操作；

这种操作一旦开始，就一直运行到结束，中间不会有任何 context switch （切换到另一个线程）。

（1）在单线程中， 能够在单条指令中完成的操作都可以认为是"原子操作"，因为中断只能发生于指令之间。

（2）在多线程中，不能被其它进程（线程）打断的操作就叫原子操作。

Redis单命令的原子性主要得益于Redis的单线程。



**mset  <key1><value1><key2><value2>  .....**

同时设置一个或多个 key-value对



**mget  <key1><key2><key3> .....**

同时获取一个或多个 value



**msetnx <key1><value1><key2><value2>  .....**

同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在。



根据原子性 ，有一个失败则都失败。



**getrange  <key><起始位置><结束位置>**

获得值的范围，类似java中的substring，***\*前包，后包\****



**setrange  <key><起始位置><value>**

用 <value>  覆写<key>所储存的字符串值，从<起始位置>开始(***\*索引从0开始\****)。



**setex  <key><过期时间><value>**

设置键值的同时，设置过期时间，单位秒。

getset <key><value>

以新换旧，设置了新值同时获得旧值。

### 3.3 Redis列表（List）

#### 简介

单键多值

Redis 列表是简单的字符串列表，按照插入顺序排序。你可以添加一个元素到列表的头部（左边）或者尾部（右边）。

它的底层实际是个双向链表，对两端的操作性能很高，通过索引下标的操作中间的节点性能会较差。

![image-20220515110448246](https://pic.imgdb.cn/item/62806dd1094754312920c72c.png)

#### 常用命令

lpush/rpush  <key><value1><value2><value3> .... 从左边/右边插入一个或多个值。

lpop/rpop  <key>从左边/右边吐出一个值。值在键在，值光键亡。

rpoplpush  <key1><key2>从<key1>列表右边吐出一个值，插到<key2>列表左边。

lrange <key><start><stop>

按照索引下标获得元素(从左到右)

lrange mylist 0 -1  0左边第一个，-1右边第一个，（0-1表示获取所有）

lindex <key><index>按照索引下标获得元素(从左到右)

llen <key>获得列表长度

linsert <key>  before <value><newvalue>在<value>的后面插入<newvalue>插入值

lrem <key><n><value>从左边删除n个value(从左到右)

lset<key><index><value>将列表key下标为index的值替换成value

#### 数据结构

List的数据结构为快速链表quickList。

****

首先在列表元素较少的情况下会使用一块连续的内存存储，这个结构是ziplist，也即是压缩列表。

它将所有的元素紧挨着一起存储，分配的是一块连续的内存。

当数据量比较多的时候才会改成quicklist。

****

因为普通的链表需要的附加指针空间太大，会比较浪费空间。比如这个列表里存的只是int类型的数据，结构上还需要两个额外的指针prev和next。

![image-20220515120256985](https://pic.imgdb.cn/item/62807b7109475431294e023a.png)

Redis将链表和ziplist结合起来组成了quicklist。也就是将多个ziplist使用双向指针串起来使用。这样既满足了快速的插入删除性能，又不会出现太大的空间冗余。

###  3.4 Redis集合（Set）

#### 简介

Redis set对外提供的功能与list类似是一个列表的功能，特殊之处在于set是可以**自动去重**的，当你需要存储一个列表数据，又不希望出现重复数据时，set是一个很好的选择，并且set提供了判断某个成员是否在一个set集合内的重要接口，这个也是list所不能提供的。

Redis的Set是string类型的无序集合。它底层其实是一个value为null的hash表，所以添加，删除，查找的复杂度都是O(1)。

一个算法，随着数据的增加，执行时间的长短，如果是O(1)，数据增加，查找数据的时间不变。

#### 常用命令

sadd <key><value1><value2> .....

将一个或多个 member 元素加入到集合 key 中，已经存在的 member 元素将被忽略

smembers <key>取出该集合的所有值。

sismember <key><value>判断集合<key>是否为含有该<value>值，有1，没有0

scard<key>返回该集合的元素个数。

srem <key><value1><value2> .... 删除集合中的某个元素。

spop <key>***\*随机从该集合中吐出一个值。\****

srandmember <key><n>随机从该集合中取出n个值。不会从集合中删除 。

smove <source><destination>value把集合中一个值从一个集合移动到另一个集合

sinter <key1><key2>返回两个集合的交集元素。

sunion <key1><key2>返回两个集合的并集元素。

sdiff <key1><key2>返回两个集合的***\*差集\****元素(key1中的，不包含key2中的)

#### 数据结构

Set数据结构是dict字典，字典是用哈希表实现的。

****

Java中HashSet的内部实现使用的是HashMap，只不过所有的value都指向同一个对象。Redis的set结构也是一样，它的内部也使用hash结构，所有的value都指向同一个内部值。

### 3.5 Redis哈希（Hash）

#### 简介

Redis hash 是一个键值对集合。

Redis hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。

类似Java里面的Map<String,Object>

用户ID为查找的key，存储的value用户对象包含姓名，年龄，生日等信息，如果用普通的key/value结构来存储

主要有以下2种存储方式：

![image-20220515125632291](https://pic.imgdb.cn/item/6280880209475431297d3a23.png)

#### 常用命令

hset <key><field><value>给<key>集合中的  <field>键赋值<value>

hget <key1><field>从<key1>集合<field>取出 value

hmset <key1><field1><value1><field2><value2>... 批量设置hash的值

hexists<key1><field>查看哈希表 key 中，给定域 field 是否存在。

hkeys <key>列出该hash集合的所有field

hvals <key>列出该hash集合的所有value

hincrby <key><field><increment>为哈希表 key 中的域 field 的值加上增量 1  -1

hsetnx <key><field><value>将哈希表 key 中的域 field 的值设置为 value ，当且仅当域 field 不存在 .

#### 数据结构

Hash类型对应的数据结构是两种：ziplist（压缩列表），hashtable（哈希表）。当field-value长度较短且个数较少时，使用ziplist，否则使用hashtable。

### 3.6 Redis有序集合

#### 简介

Redis有序集合zset与普通集合set非常相似，是一个没有重复元素的字符串集合。

不同之处是有序集合的每个成员都关联了一个***\*评分（score）\****,这个评分（score）被用来按照从最低分到最高分的方式排序集合中的成员。集合的成员是唯一的，但是评分可以是重复了 。

因为元素是有序的, 所以你也可以很快的根据评分（score）或者次序（position）来获取一个范围的元素。

访问有序集合的中间元素也是非常快的,因此你能够使用有序集合作为一个没有重复成员的智能列表。

####  常用命令

zadd  <key><score1><value1><score2><value2>…

将一个或多个 member 元素及其 score 值加入到有序集 key 当中。

zrange <key><start><stop>  [WITHSCORES]

返回有序集 key 中，下标在<start><stop>之间的元素

带WITHSCORES，可以让分数一起和值返回到结果集。

zrangebyscore key minmax [withscores] [limit offset count]

返回有序集 key 中，所有 score 值介于 min 和 max 之间(包括等于 min 或 max )的成员。有序集成员按 score 值递增(从小到大)次序排列。

zrevrangebyscore key maxmin [withscores] [limit offset count]

同上，改为从大到小排列。

zincrby <key><increment><value>    为元素的score加上增量

zrem  <key><value>删除该集合下，指定值的元素

zcount <key><min><max>统计该集合，分数区间内的元素个数

zrank <key><value>返回该值在集合中的排名，从0开始。

#### 数据结构

SortedSet(zset)是Redis提供的一个非常特别的数据结构，一方面它等价于Java的数据结构Map<String, Double>，可以给每一个元素value赋予一个权重score，另一方面它又类似于TreeSet，内部的元素会按照权重score进行排序，可以得到每个元素的名次，还可以通过score的范围来获取元素的列表。

zset底层使用了两个数据结构

（1）hash，hash的作用就是关联元素value和权重score，保障元素value的唯一性，可以通过元素value找到相应的score值。

（2）跳跃表，跳跃表的目的在于给元素value排序，根据score的范围获取元素列表。

**跳跃表介绍**

有序集合在生活中比较常见，例如根据成绩对学生排名，根据得分对玩家排名等。对于有序集合的底层实现，可以用数组、平衡树、链表等。数组不便元素的插入、删除；平衡树或红黑树虽然效率高但结构复杂；链表查询需要遍历所有效率低。Redis采用的是跳跃表。跳跃表效率堪比红黑树，实现远比红黑树简单。

实例

​	对比有序链表和跳跃表，从链表中查询出51

（1） 有序链表

![img](https://pic.imgdb.cn/item/628091ad0947543129a0464c.jpg)

要查找值为51的元素，需要从第一个元素开始依次查找、比较才能找到。共需要6次比较。

（2） 跳跃表

![img](https://pic.imgdb.cn/item/628091ad0947543129a04682.jpg)

从第2层开始，1节点比51节点小，向后比较。

21节点比51节点小，继续向后比较，后面就是NULL了，所以从21节点向下到第1层

在第1层，41节点比51节点小，继续向后，61节点比51节点大，所以从41向下

在第0层，51节点为要查找的节点，节点被找到，共查找4次。

从此可以看出跳跃表比有序链表效率要高



## 4、Redis配置文件介绍

### Units单位

配置大小单位,开头定义了一些基本的度量单位，只支持bytes，不支持bit

大小写不敏感

![image-20220515140841165](https://pic.imgdb.cn/item/628098e90947543129b96cfe.png)

### INCLOUDES 包含

![image-20220515141151708](https://pic.imgdb.cn/item/628099a80947543129bc15ae.png)

### 网络相关配置

#### bind

默认情况bind=127.0.0.1只能接受本机的访问请求

不写的情况下，无限制接受任何ip地址的访问

生产环境肯定要写你应用服务器的地址；服务器是需要远程访问的，所以需要将其注释掉

如果开启了protected-mode，那么在没有设定bind ip且没有设密码的情况下，Redis只允许接受本机的响应

![image-20220515143247222](https://pic.imgdb.cn/item/62809e8f0947543129ce64e8.png)

保存配置，停止服务，重启启动查看进程，不再是本机访问了。

#### Protected-mode

将本机访问保护模式设置no

![image-20220515143414921](https://pic.imgdb.cn/item/62809ee70947543129cfa00a.png)

#### port

端口号 ，默认为6379

![image-20220515143510197](https://pic.imgdb.cn/item/62809f1e0947543129d06019.png)

#### tcp-backlog

设置tcp的backlog，backlog其实是一个连接队列，backlog队列总和=未完成三次握手队列 + 已经完成三次握手队列。

在高并发环境下你需要一个高backlog值来避免慢客户端连接问题。

注意Linux内核会将这个值减小到/proc/sys/net/core/somaxconn的值（128），所以需要确认增大/proc/sys/net/core/somaxconn和/proc/sys/net/ipv4/tcp_max_syn_backlog（128）两个值来达到想要的效果

![image-20220515143551743](https://pic.imgdb.cn/item/62809f480947543129d103e1.png)

#### timeout

一个空闲的客户端维持多少秒会关闭，0表示关闭该功能。即永不关闭。

![image-20220515143627752](https://pic.imgdb.cn/item/62809f6c0947543129d19146.png)

#### Tcp-keepalive

对访问客户端的一种心跳检测，每个n秒检测一次。

单位为秒，如果设置为0，则不会进行Keepalive检测，建议设置成60 。

![image-20220515145103339](https://pic.imgdb.cn/item/6280a2d70947543129ddcb38.png)

### GENERAL通用

#### daemonize

是否为后台进程，设置为yes

守护进程，后台启动

![image-20220515145556036](https://pic.imgdb.cn/item/6280a3fc0947543129e20dfd.png)

#### pidfile

存放pid文件的位置，每个实例会产生一个不同的pid文件

![image-20220515145634541](https://pic.imgdb.cn/item/6280a4230947543129e2981f.png)

#### Loglevel

指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为**notice**

四个级别根据使用阶段来选择，生产环境选择notice 或者warning

![image-20220515145721720](https://pic.imgdb.cn/item/6280a4520947543129e33e48.png)

#### logfile

日志文件名称

![image-20220515145755733](https://pic.imgdb.cn/item/6280a4740947543129e3ba84.png)

#### database16

设定库的数量 默认16，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id

![image-20220515145827534](https://pic.imgdb.cn/item/6280a4940947543129e43971.png)

### SERURITY安全

#### 设置密码

![image-20220515145920968](https://pic.imgdb.cn/item/6280a4c90947543129e4fa18.png)

访问密码的查看、设置和取消

在命令中设置密码，只是临时的。重启redis服务器，密码就还原了。

永久设置，需要再配置文件中进行设置。

![image-20220515150009214](https://pic.imgdb.cn/item/6280a4f90947543129e5b96a.png)

### LIMITS限制

#### Max clients

Ø 设置redis同时可以与多少个客户端进行连接。

Ø 默认情况下为10000个客户端。

Ø 如果达到了此限制，redis则会拒绝新的连接请求，并且向这些连接请求方发出“max number of clients reached”以作回应。

![image-20220515150526320](https://pic.imgdb.cn/item/6280a6360947543129ea0183.png)

#### maxmemory

Ø 建议***\*必须设置\****，否则，将内存占满，造成服务器宕机

Ø 设置redis可以使用的内存量。一旦到达内存使用上限，redis将会试图移除内部数据，移除规则可以通过maxmemory-policy来指定。

Ø 如果redis无法根据移除规则来移除内存中的数据，或者设置了“不允许移除”，那么redis则会针对那些需要申请内存的指令返回错误信息，比如SET、LPUSH等。

Ø 但是对于无内存申请的指令，仍然会正常响应，比如GET等。如果你的redis是主redis（说明你的redis有从redis），那么在设置内存使用上限时，需要在系统中留出一些内存空间给同步队列缓存，只有在你设置的是“不移除”的情况下，才不用考虑这个因素。

![image-20220515150635584](https://pic.imgdb.cn/item/6280a67c0947543129eb1212.png)

#### maxmemory-policy

Ø volatile-lru：使用LRU算法移除key，只对设置了过期时间的键；（最近最少使用）

Ø allkeys-lru：在所有集合key中，使用LRU算法移除key

Ø volatile-random：在过期集合中移除随机的key，只对设置了过期时间的键

Ø allkeys-random：在所有集合key中，移除随机的key

Ø volatile-ttl：移除那些TTL值最小的key，即那些最近要过期的key

Ø noeviction：不进行移除。针对写操作，只是返回错误信息

![image-20220515150817363](https://pic.imgdb.cn/item/6280a6e10947543129ec89f3.png)



#### maxmemory-samples

Ø 设置样本数量，LRU算法和最小TTL算法都并非是精确的算法，而是估算值，所以你可以设置样本的大小，redis默认会检查这么多个key并选择其中LRU的那个。

Ø 一般设置3到7的数字，数值越小样本越不准确，但性能消耗越小。

![image-20220515150942326](https://pic.imgdb.cn/item/6280a7360947543129edc0d5.png)

## 5.Redis的发布和订阅

### 什么是发布和订阅

Redis 发布订阅 (pub/sub) 是一种消息通信模式：发送者 (pub) 发送消息，订阅者 (sub) 接收消息。

Redis 客户端可以订阅任意数量的频道。

### Redis的发布和订阅

1、客户端可以订阅频道如下图

![img](https://pic.imgdb.cn/item/6280acbf094754312901df0a.jpg)

2、当给这个频道发布消息后，消息就会发送给订阅的客户端

![img](https://pic.imgdb.cn/item/6280acbf094754312901decb.jpg)

#### 发布订阅命令行实现

**1、 打开一个客户端订阅channel1**

```bash
SUBSCRIBE channel1
```

![image-20220515154658208](https://pic.imgdb.cn/item/6280aff209475431290db34f.png)

**2、打开另一个客户端，给channel1发布消息hello**

```bash
publish channel1 hello
```

![image-20220515154728357](https://pic.imgdb.cn/item/6280b01009475431290e362c.png)

返回的1是订阅者数量

**3、打开第一个客户端可以看到发送的消息**

![image-20220515154609823](https://pic.imgdb.cn/item/6280afc209475431290cf5fb.png)

注：发布的消息没有持久化，如果在订阅的客户端收不到hello，只能收到订阅后发布的消息

## 6.Redis新数据类型

### Bitmaps

#### 简介

现代计算机用二进制（位） 作为信息的基础单位， 1个字节等于8位， 例如“abc”字符串是由3个字节组成， 但实际在计算机存储时将其用二进制表示， “abc”分别对应的ASCII码分别是97、 98、 99， 对应的二进制分别是01100001、 01100010和01100011，如下图![image-20220515161511741](https://pic.imgdb.cn/item/6280b690094754312924b5f1.png)

合理地使用操作位能够有效地提高内存使用率和开发效率。

Redis提供了Bitmaps这个“数据类型”可以实现对位的操作：

（1） Bitmaps本身不是一种数据类型， 实际上它就是字符串（key-value） ， 但是它可以对字符串的位进行操作。

（2） Bitmaps单独提供了一套命令， 所以在Redis中使用Bitmaps和使用字符串的方法不太相同。 可以把Bitmaps想象成一个以位为单位的数组， 数组的每个单元只能存储0和1， 数组的下标在Bitmaps中叫做偏移量。

![image-20220515161559180](https://pic.imgdb.cn/item/6280b6bf094754312925523b.png)

#### 命令

**1、setbit**

（1）格式

setbit<key><offset><value>设置Bitmaps中某个偏移量的值（0或1）

offset:偏移量从0开始

（2）实例

每个独立用户是否访问过网站存放在Bitmaps中， 将访问的用户记做1， 没有访问的用户记做0， 用偏移量作为用户的id。

设置键的第offset个位的值（从0算起） ， 假设现在有20个用户，userid=1， 6， 11， 15， 19的用户对网站进行了访问， 那么当前Bitmaps初始化结果如图

![image-20220515192833321](https://pic.imgdb.cn/item/6280e3e40947543129be126b.png)



unique:users:20201106代表2020-11-06这天的独立访问用户的Bitmaps

![image-20220515193024078](https://pic.imgdb.cn/item/6280e4520947543129bf79a8.png)

注：

很多应用的用户id以一个指定数字（例如10000） 开头， 直接将用户id和Bitmaps的偏移量对应势必会造成一定的浪费， 通常的做法是每次做setbit操作时将用户id减去这个指定数字。

在第一次初始化Bitmaps时， 假如偏移量非常大， 那么整个初始化过程执行会比较慢， 可能会造成Redis的阻塞。

**2、getbit**

（1）格式

getbit<key><offset>获取Bitmaps中某个偏移量的值

获取键的第offset位的值（从0开始算）

（2）实例

获取id=8的用户是否在2020-11-06这天访问过， 返回0说明没有访问过：

![image-20220515193859313](https://pic.imgdb.cn/item/6280e6550947543129c627de.png)

**3、bitcount**

统计**字符串**被设置为1的bit数。一般情况下，给定的整个字符串都会被进行计数，通过指定额外的 start 或 end 参数，可以让计数只在特定的位上进行。start 和 end 参数的设置，都可以使用负数值：比如 -1 表示最后一个位，而 -2 表示倒数第二个位，start、end 是指bit组的字节的下标数，二者皆包含。

（1）格式

bitcount<key>[start end] 统计字符串从start字节到end字节比特值为1的数量

（2）实例

计算2022-11-06这天的独立访问用户数量

![image-20220515194106805](https://pic.imgdb.cn/item/6280e6d50947543129c7d8f2.png)

start和end代表起始和结束字节数， 下面操作计算用户id在第1个字节到第3个字节之间的独立访问用户数， 对应的用户id是11， 15， 19。

![image-20220515200402485](https://pic.imgdb.cn/item/6280ec340947543129d99db2.png)

举例： K1 【01000001 01000000  00000000 00100001】，对应【0，1，2，3】

bitcount K1 1 2  ： 统计下标1、2字节组中bit=1的个数，即01000000  00000000

--》bitcount K1 1 2 　　--》1



bitcount K1 1 3  ： 统计下标1、2字节组中bit=1的个数，即01000000  00000000 00100001

--》bitcount K1 1 3　　--》3



bitcount K1 0 -2  ： 统计下标0到下标倒数第2，字节组中bit=1的个数，即01000001  01000000  00000000

--》bitcount K1 0 -2　　--》3



注意：redis的setbit设置或清除的是bit位置，而bitcount计算的是byte位置。

**4、bitop**

(1)格式

bitop and(or/not/xor) <destkey> [key…]

bitop是一个复合操作， 它可以做多个Bitmaps的and（交集） 、 or（并集） 、 not（非） 、 xor（异或） 操作并将结果保存在destkey中。

(2)实例

2020-11-04 日访问网站的userid=1,2,5,9。

setbit unique:users:20201104 1 1

setbit unique:users:20201104 2 1

setbit unique:users:20201104 5 1

setbit unique:users:20201104 9 1

****

2020-11-03 日访问网站的userid=0,1,4,9。

setbit unique:users:20201103 0 1

setbit unique:users:20201103 1 1

setbit unique:users:20201103 4 1

setbit unique:users:20201103 9 1

****

计算出两天都访问过网站的用户数量

bitop and unique:users:and:20201104_03 unique:users:20201103 unique:users:20201104



![img](https://pic.imgdb.cn/item/6280ede70947543129df2d62.jpg)



![img](https://pic.imgdb.cn/item/6280ede70947543129df2df7.jpg)

计算出任意一天都访问过网站的用户数量（例如月活跃就是类似这种） ， 可以使用or求并集

![img](https://pic.imgdb.cn/item/6280ede70947543129df2d67.jpg)

**Bitmaps与set对比**

假设网站有1亿用户， 每天独立访问的用户有5千万， 如果每天用集合类型和Bitmaps分别存储活跃用户可以得到表

| set和Bitmaps存储一天活跃用户对比 |                    |                  |                        |
| -------------------------------- | ------------------ | ---------------- | ---------------------- |
| 数据类型                         | 每个用户id占用空间 | 需要存储的用户量 | 全部内存量             |
| 集合类型                         | 64位               | 50000000         | 64位*50000000 = 400MB  |
| Bitmaps                          | 1位                | 100000000        | 1位*100000000 = 12.5MB |

很明显， 这种情况下使用Bitmaps能节省很多的内存空间， 尤其是随着时间推移节省的内存还是非常可观的

| set和Bitmaps存储独立用户空间对比 |        |        |       |
| -------------------------------- | ------ | ------ | ----- |
| 数据类型                         | 一天   | 一个月 | 一年  |
| 集合类型                         | 400MB  | 12GB   | 144GB |
| Bitmaps                          | 12.5MB | 375MB  | 4.5GB |



| set和Bitmaps存储一天活跃用户对比（独立用户比较少） |                    |                  |                        |
| -------------------------------------------------- | ------------------ | ---------------- | ---------------------- |
| 数据类型                                           | 每个userid占用空间 | 需要存储的用户量 | 全部内存量             |
| 集合类型                                           | 64位               | 100000           | 64位*100000 = 800KB    |
| Bitmaps                                            | 1位                | 100000000        | 1位*100000000 = 12.5MB |

### HyperLogLog

#### 简介

在工作当中，我们经常会遇到与统计相关的功能需求，比如统计网站PV（PageView页面访问量）,可以使用Redis的incr、incrby轻松实现。

但像UV（UniqueVisitor，独立访客）、独立IP数、搜索记录数等需要去重和计数的问题如何解决？这种求集合中不重复元素个数的问题称为基数问题。

解决基数问题有很多种方案：

（1）数据存储在MySQL表中，使用distinct count计算不重复个数

（2）使用Redis提供的hash、set、bitmaps等数据结构来处理

以上的方案结果精确，但随着数据不断增加，导致占用空间越来越大，对于非常大的数据集是不切实际的。

能否能够降低一定的精度来平衡存储空间？Redis推出了HyperLogLog

Redis HyperLogLog 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定的、并且是很小的。

在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。

但是，因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。

**什么是基数?**

比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 基数(不重复元素)为5。 基数估计就是在误差可接受的范围内，快速计算基数。

#### 命令

**1、pfadd**

（1）格式

pfadd <key>< element> [element ...]  添加指定元素到 HyperLogLog 中

（2）实例

将所有元素添加到指定HyperLogLog数据结构中。如果执行命令后HLL估计的近似基数发生变化，则返回1，否则返回0。

![image-20220515205731481](https://pic.imgdb.cn/item/6280f8be094754312904e01f.png)

**2、pfcount**

（1）格式

pfcount<key> [key ...] 计算HLL的近似基数，可以计算多个HLL，比如用HLL存储每天的UV，计算一周的UV可以使用7天的UV合并计算即可

(2) 实例

![image-20220515210221615](https://pic.imgdb.cn/item/6280f9e0094754312908b0df.png)

**3、pfmerge**

（1）格式

pfmerge<destkey><sourcekey> [sourcekey ...]  将一个或多个HLL合并后的结果存储在另一个HLL中，比如每月活跃用户可以使用每天的活跃用户来合并计算可得

（2）实例

![image-20220515210335844](https://pic.imgdb.cn/item/6280fa2a094754312909b069.png)

### Geospatial

#### 简介

Redis 3.2 中增加了对GEO类型的支持。GEO，Geographic，地理信息的缩写。该类型，就是元素的2维坐标，在地图上就是经纬度。redis基于该类型，提供了经纬度设置，查询，范围查询，距离查询，经纬度Hash等常见操作。

#### 命令

**1、geoadd**

（1）格式

geoadd<key>< longitude><latitude><member> [longitude latitude member...]  添加地理位置（经度，纬度，名称）

（2）实例

geoadd china:city 121.47 31.23 shanghai

geoadd china:city 106.50 29.53 chongqing 114.05 22.52 shenzhen 116.38 39.90 beijing

![image-20220515210959026](https://pic.imgdb.cn/item/6280fba909475431290efd5e.png)

两极无法直接添加，一般会下载城市数据，直接通过 Java 程序一次性导入。

有效的经度从 -180 度到 180 度。有效的纬度从 -85.05112878 度到 85.05112878 度。

当坐标位置超出指定范围时，该命令将会返回一个错误。

已经添加的数据，是无法再次往里面添加的。

**2、geopos**

（1）格式

geopos  <key><member> [member...]  获得指定地区的坐标值

（2）实例

![image-20220515211929549](https://pic.imgdb.cn/item/6280fde2094754312916ca36.png)

**3、geodist**

（1）格式

geodist<key><member1><member2>  [m|km|ft|mi ]  获取两个位置之间的直线距离

（2）实例

获取两个位置之间的直线距离

![image-20220515212104617](https://pic.imgdb.cn/item/6280fe410947543129182afb.png)

单位：

m 表示单位为米[默认值]。

km 表示单位为千米。

mi 表示单位为英里。

ft 表示单位为英尺。

如果用户没有显式地指定单位参数， 那么 GEODIST 默认使用米作为单位

**4、georadius**

（1）格式

georadius<key>< longitude><latitude>radius m|km|ft|mi  以给定的经纬度为中心，找出某一半径内的元素

经度 纬度 距离 单位

（2）实例

![image-20220515212318528](https://pic.imgdb.cn/item/6280fec709475431291a136b.png)

## 7.Redis整合Springboot

1、 在pom.xml文件中引入redis相关依赖

```xml
<!-- redis -->
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- spring2.X集成redis所需common-pool2-->
<dependency>
<groupId>org.apache.commons</groupId>
<artifactId>commons-pool2</artifactId>
<version>2.6.0</version>
</dependency>
```

2、 application.properties配置redis配置

```yaml
#Redis服务器地址
spring.redis.host=192.168.140.136
#Redis服务器连接端口
spring.redis.port=6379
#Redis数据库索引（默认为0）
spring.redis.database= 0
#连接超时时间（毫秒）
spring.redis.timeout=1800000
#连接池最大连接数（使用负值表示没有限制）
spring.redis.lettuce.pool.max-active=20
#最大阻塞等待时间(负数表示没限制)
spring.redis.lettuce.pool.max-wait=-1
#连接池中的最大空闲连接
spring.redis.lettuce.pool.max-idle=5
#连接池中的最小空闲连接
spring.redis.lettuce.pool.min-idle=0
```

3、 添加redis配置类

```java
@EnableCaching
@Configuration
public class RedisConfig extends CachingConfigurerSupport {

  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    RedisSerializer<String> redisSerializer = new StringRedisSerializer();
    Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
    ObjectMapper om = new ObjectMapper();
    om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
    om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
    jackson2JsonRedisSerializer.setObjectMapper(om);
    template.setConnectionFactory(factory);
//key序列化方式
    template.setKeySerializer(redisSerializer);
//value序列化
    template.setValueSerializer(jackson2JsonRedisSerializer);
//value hashmap序列化
    template.setHashValueSerializer(jackson2JsonRedisSerializer);
    return template;
  }

  @Bean
  public CacheManager cacheManager(RedisConnectionFactory factory) {
    RedisSerializer<String> redisSerializer = new StringRedisSerializer();
    Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
//解决查询缓存转换异常的问题
    ObjectMapper om = new ObjectMapper();
    om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
    om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
    jackson2JsonRedisSerializer.setObjectMapper(om);
// 配置序列化（解决乱码的问题）,过期时间600秒
    RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
      .entryTtl(Duration.ofSeconds(600))
      .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
      .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
      .disableCachingNullValues();
    RedisCacheManager cacheManager = RedisCacheManager.builder(factory)
      .cacheDefaults(config)
      .build();
    return cacheManager;
  }
}
```

4、测试

```java
@RestController
@RequestMapping("/redisTest")
public class RedisTestController {
    @Autowired
    private RedisTemplate redisTemplate;

    @GetMapping
    public String testRedis() {
        //设置值到redis
        redisTemplate.opsForValue().set("name","lucy");
        //从redis获取值
        String name = (String)redisTemplate.opsForValue().get("name");
        return name;
    }
}
```

## 8.Redis事务（锁机制）

### Redis的事务定义

Redis事务是一个单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。

Redis事务的主要作用就是**串联多个命令**防止别的命令插队。

### Multi、Exec、discard

从输入Multi命令开始，输入的命令都会依次进入命令队列中，但不会执行，直到输入Exec后，Redis会将之前的命令队列中的命令依次执行。

组队的过程中可以通过discard(类似mysql中的回滚事务)来放弃组队。

![image-20220516204945204](https://pic.imgdb.cn/item/6282486a0947543129511649.png)

**案列**

组队成功

![image-20220516210118975](https://pic.imgdb.cn/item/62824b1f094754312959d9f2.png)

****

组队阶段报错，提交失败

![image-20220516210248859](https://pic.imgdb.cn/item/62824b7909475431295ae29f.png)

****

组队成功，提交有成功有失败情况

![image-20220516210328081](https://pic.imgdb.cn/item/62824ba009475431295b5d18.png)

### 事务的错误处理

组队中某个命令出现了报告错误，执行时整个的所有队列都会被取消。

![image-20220516210710868](https://pic.imgdb.cn/item/62824c8009475431295e7b37.png)

如果执行阶段某个命令报出了错误，则只有报错的命令不会被执行，而其他的命令都会执行，不会回滚。

![image-20220516210728977](https://pic.imgdb.cn/item/62824c9209475431295ebf25.png)

### 事务冲突的问题

#### 例子

一个请求想给金额减8000

一个请求想给金额减5000

一个请求想给金额减1000

![image-20220516211045567](https://pic.imgdb.cn/item/62824d570947543129617a7e.png)

#### 悲观锁

![image-20220516211506625](https://pic.imgdb.cn/item/62824e5b0947543129650ed8.png)

**悲观锁(Pessimistic Lock)**, 顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会block直到它拿到锁。**传统的关系型数据库里边就用到了很多这种锁机制**，比如**行锁**，**表锁**等，**读锁**，**写锁**等，都是在做操作之前先上锁。

#### 乐观锁

![image-20220516212109120](https://pic.imgdb.cn/item/62824fc709475431296a0835.png)

**乐观锁(Optimistic Lock)** 顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制。**乐观锁适用于多读的应用类型，这样可以提高吞吐量**。Redis就是利用这种check-and-set机制实现事务的。

**WATCH key [key ...]**

在执行multi之前，先执行watch key1 [key2],可以监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。

**unwatch**

取消 WATCH 命令对所有 key 的监视。

如果在执行 WATCH 命令之后，EXEC 命令或DISCARD 命令先被执行了的话，那么就不需要再执行UNWATCH 了。

http://doc.redisfans.com/transaction/exec.html

### Redis事务三特性

**Ø 单独的隔离操作**

n 事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。

**Ø 没有隔离级别的概念**

n 队列中的命令没有提交之前都不会实际被执行，因为事务提交前任何指令都不会被实际执行

**Ø 不保证原子性**

n 事务中如果有一条命令执行失败，其后的命令仍然会被执行，没有回滚

## 9.Redis持久化之RDB(Redis DataBase)

### 简介

在指定的时间间隔内将内存中的数据集快照写入磁盘， 也就是行话讲的Snapshot快照，它恢复时是将快照文件直接读到内存里。

Redis会单独创建（fork）一个子进程来进行持久化，会先将数据写入到 一个临时文件中，待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。 整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能 如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那RDB方式要比AOF方式更加的高效。RDB的缺点是最后一次持久化后的数据可能丢失。

### Fork

- Fork的作用是复制一个与当前进程一样的进程。新进程的所有数据（变量、环境变量、程序计数器等） 数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程

- 在Linux程序中，fork()会产生一个和父进程完全相同的子进程，但子进程在此后多会exec系统调用，出于效率考虑，Linux中引入了“写时复制技术”

- 一般情况父进程和子进程会共用同一段物理内存，只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程。

**RDB持久化的进程**

![image-20220517135521384](https://pic.imgdb.cn/item/628338ca09475431294bd1ec.png)

**dump.rdb文件**

![image-20220517152901755](https://pic.imgdb.cn/item/62834ebe09475431299204bb.png)

### **如何触发RDB快照，保持策略**

### 配置文件中默认的快照配置

![image-20220517154741633](https://pic.imgdb.cn/item/6283531e0947543129a0318b.png)

**save**VS**bgsave**

save ：save时只管保存，其它不管，全部阻塞。手动保存。不建议。

bgsave：Redis会在后台异步进行快照操作， 快照同时还可以响应客户端请求。

可以通过lastsave 命令获取最后一次成功执行快照的时间

### SNAPSHOTTING快照

#### Save

格式：save 秒钟 写操作次数
RDB是整个内存的压缩过的Snapshot，RDB的数据结构，可以配置复合的快照触发条件，
默认是1分钟内改了1万次，或5分钟内改了10次，或15分钟内改了1次。
禁用
不设置save指令，或者给save传入空字符串

#### stop-writes-on-bgsave-error

当Redis无法写入磁盘的话，直接关掉Redis的写操作。推荐yes.

![image-20220517174030251](https://pic.imgdb.cn/item/62836d8f0947543129eea413.png)

#### rdbcompression 压缩文件

对于存储到磁盘中的快照，可以设置是否进行压缩存储。如果是的话，redis会采用LZF算法进行压缩。
如果你不想消耗CPU来进行压缩的话，可以设置为关闭此功能。推荐yes.

![image-20220517174035768](https://pic.imgdb.cn/item/62836d950947543129eeb94c.png)

#### rdbchecksum 检查完整性

在存储快照后，还可以让redis使用CRC64算法来进行数据校验，
但是这样做会增加大约10%的性能消耗，如果希望获取到最大的性能提升，可以关闭此功能
推荐yes.

![image-20220517174041508](https://pic.imgdb.cn/item/62836d9b0947543129eed167.png)

#### rdb的备份

先通过config get dir  查询rdb文件的目录
将*.rdb的文件拷贝到别的地方
**rdb的恢复**

- 关闭Redis
- 先把备份的文件拷贝到工作目录下 cp dump2.rdb dump.rdb
- 启动Redis, 备份数据会直接加载

**优势**

- 适合大规模的数据恢复

- 对数据完整性和一致性要求不高更适合使用

- 节省磁盘空间

- 恢复速度快

  ![image-20220517174224621](https://pic.imgdb.cn/item/62836e010947543129f0148b.png)

**劣势**

- Fork的时候，内存中的数据被克隆了一份，大致2倍的膨胀性需要考虑
- 虽然Redis在fork时使用了写时拷贝技术,但是如果数据庞大时还是比较消耗性能。
- 在备份周期在一定间隔时间做一次备份，所以如果Redis意外down掉的话，就会丢失最后一次快照后的所有修改。

#### **如何停止**

动态停止RDB：redis-cli config set save ""#save后给空值，表示禁用保存策略

### 总结

![image-20220517174237266](https://pic.imgdb.cn/item/62836e0f0947543129f03954.png)

## 10.Redis持久化之AOF（Append Only File）

### 简介

以日志的形式来记录每个写操作（增量保存），将Redis执行过的所有写指令记录下来(读操作不记录)， 只许追加文件但不可以改写文件，redis启动之初会读取该文件重新构建数据，换言之，redis 重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作

### AOF持久化流程

（1）客户端的请求写命令会被append追加到AOF缓冲区内；

（2）AOF缓冲区根据AOF持久化策略[always,everysec,no]将操作sync同步到磁盘的AOF文件中；

（3）AOF文件大小超过重写策略或手动重写时，会对AOF文件rewrite重写，压缩AOF文件容量；

（4）Redis服务重启时，会重新load加载AOF文件中的写操作达到数据恢复的目的；

![img](https://pic.imgdb.cn/item/6283746d0947543129068997.jpg)



**AOF默认不开启**
可以在redis.conf中配置文件名称，默认为 appendonly.aof
AOF文件的保存路径，同RDB的路径一致。

**AOF和RDB同时开启，redis听谁的？**

AOF和RDB同时开启，系统默认取AOF的数据（数据不会存在丢失）

**AOF启动/修复/恢复**

AOF的备份机制和性能虽然和RDB不同, 但是备份和恢复的操作同RDB一样，都是拷贝备份文件，需要恢复时再拷贝到Redis工作目录下，启动系统即加载。

**正常恢复**

- 修改默认的appendonly no，改为yes

- 将有数据的aof文件复制一份保存到对应目录(查看目录：config get dir)

- 恢复：重启redis然后重新加载



**异常恢复**

- 修改默认的appendonly no，改为yes

- 如遇到**AOF文件损坏**，通过/usr/local/bin/**redis-check-aof--fix appendonly.aof**进行恢复

- 备份被写坏的AOF文件

- 恢复：重启redis，然后重新加载

### **AOF同步频率设置**

appendfsync always

始终同步，每次Redis的写入都会立刻记入日志；性能较差但数据完整性比较好

appendfsync everysec

每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失。

appendfsync no

redis不主动进行同步，把同步时机交给操作系统。

### **Rewrite压缩**

1是什么：

AOF采用文件追加方式，文件会越来越大为避免出现此种情况，新增了重写机制, 当AOF文件的大小超过所设定的阈值时，Redis就会启动AOF文件的内容压缩， 只保留可以恢复数据的最小指令集.可以使用命令bgrewriteaof

2重写原理，如何实现重写

AOF文件持续增长而过大时，会fork出一条新进程来将文件重写(也是先写临时文件最后再rename)，redis4.0版本后的重写，是指上就是把rdb 的快照，以二级制的形式附在新的aof头部，作为已有的历史数据，替换掉原来的流水账操作。

no-appendfsync-on-rewrite：

如果 no-appendfsync-on-rewrite=yes ,不写入aof文件只写入缓存，用户请求不会阻塞，但是在这段时间如果宕机会丢失这段时间的缓存数据。（降低数据安全性，提高性能）

如果 no-appendfsync-on-rewrite=no,  还是会把数据往磁盘里刷，但是遇到重写操作，可能会发生阻塞。（数据安全，但是性能降低）

触发机制，何时重写

Redis会记录上次重写时的AOF大小，默认配置是当AOF文件大小是上次rewrite后大小的一倍且文件大于64M时触发

重写虽然可以节约大量磁盘空间，减少恢复时间。但是每次重写还是有一定的负担的，因此设定Redis要满足一定条件才会进行重写。

auto-aof-rewrite-percentage：设置重写的基准值，文件达到100%时开始重写（文件是原来重写后文件的2倍时触发）

auto-aof-rewrite-min-size：设置重写的基准值，最小文件64MB。达到这个值开始重写。

例如：文件达到70MB开始重写，降到50MB，下次什么时候开始重写？100MB

系统载入时或者上次重写完毕时，Redis会记录此时AOF大小，设为base_size,

如果Redis的AOF当前大小>= base_size +base_size*100% (默认)且当前大小>=64mb(默认)的情况下，Redis会对AOF进行重写。

3、重写流程

（1）bgrewriteaof触发重写，判断是否当前有bgsave或bgrewriteaof在运行，如果有，则等待该命令结束后再继续执行。

（2）主进程fork出子进程执行重写操作，保证主进程不会阻塞。

（3）子进程遍历redis内存中数据到临时文件，客户端的写请求同时写入aof_buf缓冲区和aof_rewrite_buf重写缓冲区保证原AOF文件完整以及新AOF文件生成期间的新的数据修改动作不会丢失。

（4）1).子进程写完新的AOF文件后，向主进程发信号，父进程更新统计信息。2).主进程把aof_rewrite_buf中的数据写入到新的AOF文件。

（5）使用新的AOF文件覆盖旧的AOF文件，完成AOF重写。



**优势**

![image-20220517211818782](https://pic.imgdb.cn/item/6283a09c0947543129b9be35.png)

- 备份机制更稳健，丢失数据概率更低。

- 可读的日志文本，通过操作AOF稳健，可以处理误操作。

**劣势**

- 比起RDB占用更多的磁盘空间。

- 恢复备份速度要慢。

- 每次读写都同步的话，有一定的性能压力。

- 存在个别Bug，造成恢复不能。

### 总结

![image-20220517212001045](https://pic.imgdb.cn/item/6283a1040947543129bbab42.png)

官方推荐两个都启用。

如果对数据不敏感，可以选单独用RDB。

不建议单独用 AOF，因为可能会出现Bug。

如果只是做纯内存缓存，可以都不用。



- RDB持久化方式能够在指定的时间间隔能对你的数据进行快照存储

- AOF持久化方式记录每次对服务器写的操作,当服务器重启的时候会重新执行这些命令来恢复原始的数据,AOF命令以redis协议追加保存每次写的操作到文件末尾.

- Redis还能对AOF文件进行后台重写,使得AOF文件的体积不至于过大

- 只做缓存：如果你只希望你的数据在服务器运行的时候存在,你也可以不使用任何持久化方式.

- 同时开启两种持久化方式

- 在这种情况下,当redis重启的时候会优先载入AOF文件来恢复原始的数据, 因为在通常情况下AOF文件保存的数据集要比RDB文件保存的数据集要完整.

- RDB的数据不实时，同时使用两者时服务器重启也只会找AOF文件。那要不要只使用AOF呢？

- 建议不要，因为RDB更适合用于备份数据库(AOF在不断变化不好备份)， 快速重启，而且不会有AOF可能潜在的bug，留着作为一个万一的手段。

- 性能建议

  因为RDB文件只用作后备用途，建议只在Slave上持久化RDB文件，而且只要15分钟备份一次就够了，只保留save 900 1这条规则。

  如果使用AOF，好处是在最恶劣情况下也只会丢失不超过两秒数据，启动脚本较简单只load自己的AOF文件就可以了。

​		代价,一是带来了持续的IO，二是AOF rewrite的最后将rewrite过程中产生的新数据写到新文件造成的阻塞几乎是不可避免的。

​		只要硬盘许可，应该尽量减少AOF rewrite的频率，AOF重写的基础大小默认值64M太小了，可以设到5G以上。

​		默认超过原大小100%大小时重写可以改到适当的数值。

## 11.Redis主从复制

主机数据更新后根据配置和策略， 自动同步到备机的master/slaver机制，Master以写为主，Slave以读为主。

作用：

- 读写分离，性能拓展
- 容灾快速恢复

![image-20220517214037844](https://pic.imgdb.cn/item/6283a5d70947543129d88fe0.png)

### 配置

拷贝多个redis.conf文件include(写绝对路径)

开启daemonize yes

Pid文件名字pidfile

指定端口port

Log文件名字

dump.rdb名字dbfilename

Appendonly 关掉或者换名字

**新建redis6379（6380，6381）.conf，填写以下内容**

include /myredis/redis.conf

pidfile /var/run/redis_6379（6380，6381）.pid

port 6379（6380，6381）

dbfilename dump6379.rdb



- slave-priority 10。
- 设置从机的优先级，值越小，优先级越高，用于选举主机时使用。默认100

**启动三台redis服务器**

redis-server redis_6379(6380，6381).conf

**查看系统进程查看三台服务器是否启动**

``` ps -ef | grep redis```

**查看三台主机的运行情况**

![image-20220521110203085](https://pic.imgdb.cn/item/6288562b0947543129d8158e.png)

![image-20220521110303991](https://pic.imgdb.cn/item/628856680947543129d83382.png)

### 配从(库)不配主(库)

slaveof  <ip><port>

- 在主机上写，在从机上可以读取数据
  在从机上写数据报错
- 主机挂掉，重启就行，一切如初
- 从机重启需重设：slaveof 127.0.0.1 6379

### 一主二仆

- 如果主机断开了，从机依然链接到主机，可以进行读操作，但是还是没有写操作。（因为主从模式还没有故障转移能力）这个时候，主机如果恢复了，从机依然可以直接从主机同步信息

- 使用命令行配置的主从机，如果从机重启了，就会变回主机。如果再通过命令变回从机的话，立马就可以从主机中获取值。这是复制原理决定的.

### 薪火相传

上一个Slave可以是下一个slave的Master，Slave同样可以接收其他 slaves的连接和同步请求，那么该slave作为了链条中下一个的master, 可以有效减轻master的写压力,去中心化降低风险。

用 slaveof  <ip><port>

中途变更转向:会清除之前的数据，重新建立拷贝最新的

风险是一旦某个slave宕机，后面的slave都没法备份

主机挂了，从机还是从机，无法写数据了

### 反客为主

当一个master宕机后，后面的slave可以立刻升为master，其后面的slave不用做任何修改。

用 slaveof  no one  将从机变为主机。

### 复制原理

- Slave启动成功连接到master后会发送一个sync命令
- Master接到命令启动后台的存盘进程，同时收集所有接收到的用于修改数据集命令， 在后台进程执行完毕之后，master将传送整个数据文件到slave,以完成一次完全同步
- 全量复制：而slave服务在接收到数据库文件数据后，将其存盘并加载到内存中。
- 增量复制：Master继续将新的所有收集到的修改命令依次传给slave,完成同步
- 但是只要是重新连接master,一次完全同步（全量复制)将被自动执行

![image-20220521134620893](https://pic.imgdb.cn/item/62887cad0947543129facba2.png)

### 哨兵模式

反客为主的自动版，能够后台监控主机是否故障，如果故障了根据投票数自动将从库转换为主库。

![image-20220521172028039](https://pic.imgdb.cn/item/6288aedd094754312920d1bf.png)

#### 操作介绍

1、调整为一主二仆模式，6379带着6380和6381，并且在配置目录下新建sentinel.conf文件。

2、配置哨兵，填写配置```sentinel monitor mymaster 127.0.0.1 6379 1```

其中mymaster为监控对象起的服务器名称， 1 为至少有多少个哨兵同意迁移的数量。

3、启动哨兵```redis-sentinel  /myredis/sentinel.conf ```

4、将主机（6379端口）shutdown，查看哨兵日志

![image-20220521194728081](https://pic.imgdb.cn/item/6288d15009475431293eb19e.png)

5、原主机重新启动会变成从机。

#### 复制延迟

由于所有的写操作都是先在Master上操作，然后同步更新到Slave上，所以从Master同步到Slave机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，Slave机器数量的增加也会使这个问题更加严重。

#### 故障恢复

![image-20220521194858816](https://pic.imgdb.cn/item/6288d1ac09475431293f08d1.png)

优先级在redis.conf中默认：slave-priority 100，值越小优先级越高

偏移量是指获得原主机数据最全的

每个redis实例启动后都会随机生成一个40位的runid

## 12.Redis集群

容量不够，redis如何进行扩容？

并发写操作， redis如何分摊？

另外，主从模式，薪火相传模式，主机宕机，导致ip地址发生变化，应用程序中配置需要修改对应的主机地址、端口等信息。

之前通过代理主机来解决，但是redis3.0中提供了解决方案。就是无中心化集群配置。

### 操作

制作6个实例，6379,6380,6381,6389,6390,6391

配置如下：开启daemonize yes，Appendonly 关掉或者换名字

```bash
include /root/myredis/redis.conf
pidfile /var/run/redis_6379.pid
port 6379
dbfilename dump6379.rdb
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 15000
```

cluster-enabled yes  打开集群模式

cluster-config-file nodes-6379.conf 设定节点配置文件名

cluster-node-timeout 15000  设定节点失联时间，超过该时间（毫秒），集群自动进行主从切换。

**启动6个redis服务**

检查nodes-####是否都正常

![image-20220523005932623](https://pic.imgdb.cn/item/628a6bf509475431298efe19.png)

合体：cd  /opt/redis-6.2.1/src

```bash
redis-cli --cluster create --cluster-replicas 1 192.168.11.101:6379 192.168.11.101:6380 192.168.11.101:6381 192.168.11.101:6389 192.168.11.101:6390 192.168.11.101:6391
```

注：ip需要换成本机的

**如果通讯端口为6379，那么集群总线端口16379一定要打开【重要】**

原因如下：

**redis集群总线：**redis集群总线端口为redis客户端端口加上10000，比如说你的redis 6379端口为客户端通讯端口，那么16379端口为集群总线端，如果不开放，便无法搭建集群



--replicas 1（表示一台主机搭配一台从机） 采用最简单的方式配置集群，一台主机，一台从机，正好三组。



可能直接进入读主机，存储数据时，会出现MOVED重定向操作。所以，应该以集群方式登录。

-c 采用集群策略连接，设置数据会自动切换到相应的写主机

```bash
redis-cli -c -p 6379
```

![image-20220523010357287](https://pic.imgdb.cn/item/628a6cfd0947543129903859.png)

通过cluster nodes查询集群信息。

![image-20220523010438091](https://pic.imgdb.cn/item/628a6d260947543129907298.png)

一个集群至少要有三个主节点。

选项 --cluster-replicas 1 表示我们希望为集群中的每个主节点创建一个从节点。

分配原则尽量保证每个主数据库运行在不同的IP地址，每个从库和主库不在一个IP地址上。

- 普通方式登录

  可能直接进入读主机，存储数据时，会出现MOVED重定向操作。所以，应该以集群方式登录。

- -c  采用集群策略连接，当存入数据时会自动存到相应的写主机。

- 通过 cluster nodes 命令查看集群信息

  一个集群至少要有三个主节点。

  选项 --cluster-replicas 1 表示我们希望为集群中的每个主节点创建一个从节点。

  分配原则尽量保证每个主数据库运行在不同的IP地址，每个从库和主库不在一个IP地址上。

### 插槽

一个 Redis 集群包含 16384 个插槽（hash slot）， 数据库中的每个键都属于这 16384 个插槽的其中一个， 集群使用公式 CRC16(key) % 16384 来计算键 key 属于哪个槽， 其中 CRC16(key) 语句用于计算键 key 的 CRC16 校验和 。

集群中的每个节点负责处理一部分插槽。 举个例子， 如果一个集群可以有主节点， 其中：

- 节点 A 负责处理 0 号至 5460 号插槽。

- 节点 B 负责处理 5461 号至 10922 号插槽。

- 节点 C 负责处理 10923 号至 16383 号插槽。

**在集群中录入值**

在redis-cli每次录入、查询键值，redis都会计算出该key应该送往的插槽，如果不是该客户端对应服务器的插槽，redis会报错，并告知应前往的redis实例地址和端口。

redis-cli客户端提供了 –c 参数实现自动重定向。

如 redis-cli  -c –p 6379 登入后，再录入、查询键值对可以自动重定向。

![image-20220524115550578](https://pic.imgdb.cn/item/628c5747094754312942d0fc.png)

不在一个slot下的键值，是不能使用mget,mset等多键操作。

![image-20220524115614156](https://pic.imgdb.cn/item/628c575e094754312942eb7c.png)

可以通过{}来定义组的概念，从而使key中{}内相同内容的键值对放到一个slot中去。

![image-20220524115706466](https://pic.imgdb.cn/item/628c5792094754312943259b.png)

![image-20220524130632632](https://pic.imgdb.cn/item/628c67d8094754312959508c.png)

**查询集群中的值**

CLUSTER GETKEYSINSLOT <slot><count> 返回 count 个 slot 槽中的键。

![image-20220524151208538](https://pic.imgdb.cn/item/628c85490947543129849e95.png)

### 故障恢复

- 如果主节点下线，从节点自动升为主节点，注意：**15秒超时**

- 主节点恢复后，主节点回来变成从机。

如果所有某一段插槽的主从节点都宕掉，redis服务是否还能继续?

- 如果某一段插槽的主从都挂掉，而cluster-require-full-coverage 为yes ，那么 ，整个集群都挂掉

- 如果某一段插槽的主从都挂掉，而cluster-require-full-coverage 为no ，那么，该插槽数据全都不能使用，也无法存储。

redis.conf中的参数  cluster-require-full-coverage

### 集群的不足

- 多键操作是不被支持的 。

- 多键的Redis事务是不被支持的，lua脚本不被支持。

- 由于集群方案出现较晚，很多公司已经采用了其他的集群方案，而代理或者客户端分片的方案想要迁移至redis cluster，需要整体迁移而不是逐步过渡，复杂度较大。

## 13.Redis应用问题解决

### 缓存穿透

**问题描述**

key对应的数据在数据源并不存在，每次针对此key的请求从缓存获取不到，请求都会压到数据源，从而可能压垮数据源。比如用一个不存在的用户id获取用户信息，不论缓存还是数据库都没有，若黑客利用此漏洞进行攻击可能压垮数据库。

![image-20220524151505655](https://pic.imgdb.cn/item/628c85fa094754312985a73b.png)

一个一定不存在缓存及查询不到的数据，由于缓存是不命中时被动写的，并且出于容错考虑，如果从存储层查不到数据则不写入缓存，这将导致这个不存在的数据每次请求都要到存储层去查询，失去了缓存的意义。

**解决方案：**

**（1）** **对空值缓存：**如果一个查询返回的数据为空（不管是数据是否不存在），我们仍然把这个空结果（null）进行缓存，设置空结果的过期时间会很短，最长不超过五分钟

**（2）** **设置可访问的名单（白名单）：**

使用bitmaps类型定义一个可以访问的名单，名单id作为bitmaps的偏移量，每次访问和bitmap里面的id进行比较，如果访问id不在bitmaps里面，进行拦截，不允许访问。

**（3）** **采用布隆过滤器**：(布隆过滤器（Bloom Filter）是1970年由布隆提出的。它实际上是一个很长的二进制向量(位图)和一系列随机映射函数（哈希函数）。

布隆过滤器可以用于检索一个元素是否在一个集合中。它的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误识别率和删除困难。)

将所有可能存在的数据哈希到一个足够大的bitmaps中，一个一定不存在的数据会被 这个bitmaps拦截掉，从而避免了对底层存储系统的查询压力。

**（4）** **进行实时监控：**当发现Redis的命中率开始急速降低，需要排查访问对象和访问的数据，和运维人员配合，可以设置黑名单限制服务

### 缓存击穿

**问题描述**

key对应的数存在，但在redis中过期，此时若有大量并发请求过来，这些请求发现缓存过期一般都会从后端DB加载数据并回设到缓存，这个时候大并发的请求可能会瞬间把后端DB压垮。

![image-20220524151727167](https://pic.imgdb.cn/item/628c8687094754312986800a.png)

**解决方案**

key可能会在某些时间点被超高并发地访问，是一种非常“热点”的数据。这个时候，需要考虑一个问题：缓存被“击穿”的问题。

解决问题：

**（1）预先设置热门数据：**在redis高峰访问之前，把一些热门数据提前存入到redis里面，加大这些热门数据key的时长

**（2）实时调整：**现场监控哪些数据热门，实时调整key的过期时长

**（3）使用锁：**

- 就是在缓存失效的时候（判断拿出来的值为空），不是立即去load db。

- 先使用缓存工具的某些带成功操作返回值的操作（比如Redis的SETNX）去set一个mutex key

- 当操作返回成功时，再进行load db的操作，并回设缓存,最后删除mutex key；

- 当操作返回失败，证明有线程在load db，当前线程睡眠一段时间再重试整个get缓存的方法。

  ![image-20220524152603224](https://pic.imgdb.cn/item/628c88810947543129897d30.png)

### 缓存雪崩

**问题描述**

key对应的数据存在，但在redis中过期，此时若有大量并发请求过来，这些请求发现缓存过期一般都会从后端DB加载数据并回设到缓存，这个时候大并发的请求可能会瞬间把后端DB压垮。

缓存雪崩与缓存击穿的区别在于这里针对很多key缓存，前者则是某一个key



正常访问

![img](https://pic.imgdb.cn/item/628c8c7509475431298f7640.jpg)

缓存失效瞬间

![image-20220524154310353](https://pic.imgdb.cn/item/628c8c8e09475431298fa086.png)

**解决方案**

缓存失效时的雪崩效应对底层系统的冲击非常可怕！

解决方案：

**（1）** **构建多级缓存架构**nginx缓存 + redis缓存 +其他缓存（ehcache等）

**（2）** **使用锁或队列**

用加锁或者队列的方式保证来保证不会有大量的线程对数据库一次性进行读写，从而避免失效时大量的并发请求落到底层存储系统上。不适用高并发情况

**（3）** **设置过期标志更新缓存：**

记录缓存数据是否过期（设置提前量），如果过期会触发通知另外的线程在后台去更新实际key的缓存。

**（4）** **将缓存失效时间分散开：**

比如我们可以在原有的失效时间基础上增加一个随机值，比如1-5分钟随机，这样每一个缓存的过期时间的重复率就会降低，就很难引发集体失效的事件。

### 分布式锁

**问题描述**随着业务发展的需要，原单体单机部署的系统被演化成分布式集群系统后，由于分布式系统多线程、多进程并且分布在不同机器上，这将使原单机部署情况下的并发控制锁策略失效，单纯的Java API并不能提供分布式锁的能力。为了解决这个问题就需要一种跨JVM的互斥机制来控制共享资源的访问，这就是分布式锁要解决的问题！

分布式锁主流的实现方案：

1. 基于数据库实现分布式锁

2. 基于缓存（Redis等）

3. 基于Zookeeper

每一种分布式锁解决方案都有各自的优缺点：

1. 性能：redis最高

2. 可靠性：zookeeper最高

这里，我们就基于redis实现分布式锁。

**解决方案，使用redis实现分布式锁**

