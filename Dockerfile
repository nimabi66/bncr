# 基于官方 bncr 镜像
FROM anmour/bncr:latest

# 安装 expect 工具（需要交互支持）
RUN apt-get update && apt-get install -y expect && apt-get clean

# 复制启动脚本到容器
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 将启动脚本作为容器的入口点
ENTRYPOINT ["/start.sh"]
