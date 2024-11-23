# 基于官方 bncr 镜像
FROM bncr:latest

# 使用 Alpine 包管理器安装 expect
RUN apk add --no-cache expect

# 复制启动脚本到容器
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 将启动脚本作为入口点
ENTRYPOINT ["/start.sh"]
