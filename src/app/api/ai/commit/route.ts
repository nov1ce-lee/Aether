import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, config } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 优先使用用户提供的配置，如果没有则使用环境变量
    const apiKey = config?.apiKey || process.env.AI_API_KEY;
    let apiEndpoint = config?.apiEndpoint || process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    const model = config?.model || process.env.AI_MODEL || 'gpt-3.5-turbo';

    // 自动补全 API Endpoint，适配多种结构 (OpenAI 兼容)
    apiEndpoint = apiEndpoint.trim().replace(/\/+$/, '');
    if (!apiEndpoint.endsWith('/chat/completions')) {
      if (apiEndpoint.endsWith('/chat')) {
        apiEndpoint += '/completions';
      } else {
        apiEndpoint += '/chat/completions';
      }
    }

    if (!apiKey) {
      // 如果既没有用户提供的 Key 也没有环境变量，返回模拟响应
      return NextResponse.json({ 
        result: {
          type: 'feat',
          scope: 'ui',
          subject: `模拟生成的提交信息: ${prompt.slice(0, 20)}...`,
          body: '请点击右上角设置图标配置您的 AI API Key 以启用真实生成功能。',
          footer: 'Aether AI System'
        }
      });
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that generates professional Git Commit Messages following the Conventional Commits specification. 
            Output format MUST be a JSON object with fields: type (one of: feat, fix, docs, style, refactor, perf, test, chore), scope (optional string), subject (short description), body (optional detailed explanation), footer (optional).`
          },
          {
            role: 'user',
            content: `Generate a commit message for: ${prompt}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate commit message' }, { status: 500 });
  }
}
