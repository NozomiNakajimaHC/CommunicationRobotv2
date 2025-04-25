// DOM要素の取得
const chatMessages = document.getElementById('chat-messages');
const userMessageInput = document.getElementById('user-message');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const avatarImage = document.getElementById('avatar-image');
const statusIndicator = document.getElementById('status');

// 音声認識の設定
let recognition;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userMessageInput.value = transcript;
        statusIndicator.textContent = '認識完了: ' + transcript;
    };
    
    recognition.onerror = function(event) {
        statusIndicator.textContent = '音声認識エラー: ' + event.error;
    };
    
    recognition.onend = function() {
        voiceButton.textContent = '🎤';
        statusIndicator.textContent = '音声認識終了';
    };
} else {
    alert('お使いのブラウザは音声認識をサポートしていません。');
}

// 音声合成の設定
const synth = window.speechSynthesis;

// メッセージを表示する関数
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    
    const messagePara = document.createElement('p');
    messagePara.textContent = text;
    messageDiv.appendChild(messagePara);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// APIを使って応答を取得する関数
async function getAIResponse(message) {
    // この部分は後でバックエンドAPIに接続します
    // 現在はデモ用にシンプルな応答を返します
    statusIndicator.textContent = 'AIが応答を生成中...';
    
    // Netlify Function経由でOpenAIの返答を取得
    const res = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await res.json();

    // エラー処理
    if (data.error) {
        statusIndicator.textContent = 'エラー: ' + data.error;
        return '申し訳ありません、AI応答中にエラーが発生しました。';
    }

    const response = data.message;

    changeAvatarMood('neutral');
    speakText(response);

    statusIndicator.textContent = '準備完了';
    return response;
}

// テキストを音声で読み上げる関数
function speakText(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    synth.speak(utterance);
}

// アバターの表情を変更する関数
function changeAvatarMood(mood) {
    // 実際のアプリではmoodに応じて異なる画像を表示
    // 今回はplaceholder.comの画像を使用
    try {
        avatarImage.src = `images/avatar-${mood}.png`;
    } catch (e) {
        console.error('アバター画像の変更に失敗しました', e);
    }
}

// メッセージ送信処理
async function sendMessage() {
    const message = userMessageInput.value.trim();
    if (!message) return;
    
    // ユーザーメッセージを表示
    addMessage(message, true);
    userMessageInput.value = '';
    
    // AIの応答を取得して表示
    const response = await getAIResponse(message);
    addMessage(response, false);
}

// イベントリスナーの設定
sendButton.addEventListener('click', sendMessage);

userMessageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

voiceButton.addEventListener('click', function() {
    if (recognition) {
        if (synth.speaking) {
            synth.cancel();
        }
        
        try {
            recognition.start();
            voiceButton.textContent = '⏹️';
            statusIndicator.textContent = '聞いています...';
        } catch (e) {
            console.error('音声認識の開始に失敗しました', e);
        }
    }
});