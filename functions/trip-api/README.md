# 北疆自驾共享后端

CloudBase HTTP 云函数，提供：

- `GET/PUT /trips/northern-xinjiang-2026/checklist`
- `GET /trips/northern-xinjiang-2026/expenses`
- `PUT/DELETE /trips/northern-xinjiang-2026/expenses/:id`
- `GET /trips/northern-xinjiang-2026/files/:encodedFileId`
- `/amap/*` 高德同源安全代理
- `GET /health`

消费记录和清单存入 CloudBase 文档数据库，凭证图片存入云存储。服务端环境变量：

- `AMAP_SECURITY_JSCODE`：高德安全密钥。
- `ALLOWED_ORIGIN`：允许访问的静态站域名；未设置时允许所有来源。
- `API_PUBLIC_BASE_URL`：API 公网根地址，用于生成稳定的凭证访问链接。

以上变量只在 CloudBase 函数配置中设置，不写入代码或 Git。
