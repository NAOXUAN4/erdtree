import { NextRequest, NextResponse } from 'next/server'

// 支持的提供商配置
const providerConfigs: Record<string, { baseUrl: string; authHeader: string }> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    authHeader: 'Authorization',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization',
  },
  custom: {
    baseUrl: '',
    authHeader: 'Authorization',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      provider = 'deepseek',
      baseUrl,
      apiKey,
      model,
      messages,
      temperature = 0.7,
      max_tokens = 4096,
      stream = true,
    } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key 未提供' },
        { status: 400 }
      )
    }

    // 确定 API 端点
    const config = providerConfigs[provider]
    const apiBaseUrl = baseUrl || config?.baseUrl || providerConfigs.deepseek.baseUrl
    const apiUrl = `${apiBaseUrl}/chat/completions`

    // 构建请求体
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    }

    // 发送请求到 LLM 提供商
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [config?.authHeader || 'Authorization']: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LLM API Error:', errorText)
      return NextResponse.json(
        { error: `LLM API 错误: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    // 如果是流式响应，直接返回 ReadableStream
    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // 非流式响应
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
