-- 创建项目表
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,  -- 根节点的系统提示
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建节点表
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    
    -- 内容区
    role VARCHAR(20) NOT NULL,  -- user, assistant, system_note
    content TEXT NOT NULL,
    
    -- 元数据区
    summary TEXT,      -- 后台异步生成的摘要
    tokens_count INT,  -- 用于计算成本
    embedding VECTOR(1536),  -- 向量嵌入
    
    -- 状态区
    is_checkpoint BOOLEAN DEFAULT FALSE,  -- 是否是关键决策点
    branch_name VARCHAR(50),  -- 仅用于 UI 显示标记
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_nodes_project_id ON nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_role ON nodes(role);
CREATE INDEX IF NOT EXISTS idx_nodes_is_checkpoint ON nodes(is_checkpoint);

-- 创建向量索引（需要 pgvector 扩展）
-- 注意：在 Supabase 中，pgvector 扩展默认已启用
CREATE INDEX IF NOT EXISTS idx_nodes_embedding ON nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 创建触发器函数，用于更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 projects 表添加触发器
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为 nodes 表添加触发器
CREATE TRIGGER update_nodes_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO projects (name, system_prompt)
VALUES (
    '示例对话',
    '你是 ErdTree，一个智能对话助手，专注于帮助用户组织思路和探索不同的思考路径。'
);

-- 获取刚插入的项目 ID
DO $$
DECLARE
    project_id UUID;
BEGIN
    SELECT id INTO project_id FROM projects WHERE name = '示例对话' LIMIT 1;
    
    -- 插入根节点
    INSERT INTO nodes (project_id, parent_id, role, content, is_checkpoint)
    VALUES (
        project_id,
        NULL,
        'system',
        '你是 ErdTree，一个智能对话助手，专注于帮助用户组织思路和探索不同的思考路径。',
        TRUE
    );
    
    -- 插入助手欢迎消息
    INSERT INTO nodes (project_id, parent_id, role, content)
    VALUES (
        project_id,
        (SELECT id FROM nodes WHERE project_id = project_id AND role = 'system' LIMIT 1),
        'assistant',
        '你好！我是 ErdTree，一个支持树状对话结构的智能助手。我可以帮助你组织思路，探索不同的思考路径。'
    );
END $$;
