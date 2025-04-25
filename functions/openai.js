// functions/openai.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // POSTメソッド以外は拒否
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    // OpenAI APIにリクエスト
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'あなたはフレンドリーなアシスタントです。簡潔に応答してください。' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    // APIからの応答をチェック
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    // 成功したレスポンスを返す
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: data.choices[0].message.content.trim()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message })
    };
  }
};