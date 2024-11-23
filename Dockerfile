# 基于官方 bncr 镜像
FROM anmour/bncr:latest

# 复制启动脚本到容器中
COPY start.sh /start.sh

# 设置脚本为可执行
RUN chmod +x /start.sh

# 使用启动脚本作为入口点
ENTRYPOINT ["/start.sh"]
