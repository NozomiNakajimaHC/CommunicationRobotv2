// functions/getRealtimeToken.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    // 1) Realtime セッション作成エンドポイントを呼び出す
    const response = await fetch(
      'https://api.openai.com/v1/realtime/sessions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          // ここで使いたいモデル名を指定
          model: 'gpt-4o-mini'
        })
      }
    );

    // 2) ステータスチェック
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `セッション作成失敗: ${response.status}`);
    }

    // 3) JSON から client_secret.value を取り出す
    const data = await response.json();
    const token = data.client_secret?.value;
    if (!token) {
      throw new Error('client_secret.value が取得できませんでした');
    }

    // 4) クライアントに返す
    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };

  } catch (error) {
    console.error('getRealtimeToken error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};