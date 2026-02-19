from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(
    title="ErdTree API",
    description="非线性思维导图与对话版本管理系统 API",
    version="0.1.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "ErdTree API is running"}

# 对话相关端点
@app.get("/api/chat/{chat_id}")
def get_chat(chat_id: str):
    """获取对话历史"""
    return {
        "chat_id": chat_id,
        "messages": [
            {
                "id": "1",
                "role": "system",
                "content": "你是 ErdTree，一个智能对话助手。",
                "timestamp": "2024-01-01T00:00:00Z"
            },
            {
                "id": "2",
                "role": "assistant",
                "content": "你好！我是 ErdTree，一个支持树状对话结构的智能助手。",
                "timestamp": "2024-01-01T00:00:01Z"
            }
        ]
    }

# 分支相关端点
@app.post("/api/chat/{chat_id}/branch")
def create_branch(chat_id: str, parent_node_id: str):
    """创建对话分支"""
    return {
        "branch_id": f"branch_{chat_id}_{parent_node_id}_{int(time.time())}",
        "message": "分支创建成功"
    }

# 节点相关端点
@app.post("/api/node")
def create_node():
    """创建新节点"""
    return {
        "node_id": f"node_{int(time.time())}",
        "message": "节点创建成功"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
