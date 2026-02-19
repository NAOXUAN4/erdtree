/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许环境变量在客户端使用
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
  },
  
  // 配置图片域名（如果需要）
  images: {
    domains: [],
  },
  
  // 开发配置
  reactStrictMode: true,
  
  // 实验性功能
  experimental: {
    // 如果需要可以启用
  },
}

module.exports = nextConfig
