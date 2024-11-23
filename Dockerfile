# 基于官方 bncr 镜像
FROM anmour/bncr:latest

# 设置工作目录为 /bncr
WORKDIR /bncr

EXPOSE 9090

RUN timeout 90s node /bncr/start.js

RUN rm -rf /bncr/BncrData/config && rm -rf /bncr/BncrData/db

# 复制本地的 config 目录到容器的 /bncr/BncrData 目录
COPY config /bncr/BncrData
COPY db /bncr/BncrData

# 启动容器时运行 node start.js
CMD ["node", "start.js"]
