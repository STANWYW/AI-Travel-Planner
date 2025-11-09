import WebSocket from 'ws';
import crypto from 'crypto';
import { getDecryptedApiKey } from '../controllers/apiConfigController';

// 科大讯飞语音识别 WebSocket API
// 参考文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html

interface XfyunConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * 生成科大讯飞 WebSocket 连接 URL
 */
function generateXfyunUrl(config: XfyunConfig): string {
  const { appId, apiKey, apiSecret } = config;
  
  // 生成 RFC1123 格式的时间戳
  const date = new Date().toUTCString();
  
  // 构建签名原文
  const signatureOrigin = `host: iat-api.xfyun.cn\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  
  // 使用 HMAC-SHA256 加密
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  
  // 构建 authorization_origin
  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  
  // Base64 编码
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  // 构建 WebSocket URL
  const url = `wss://iat-api.xfyun.cn/v2/iat?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=iat-api.xfyun.cn`;
  
  return url;
}

/**
 * 连接科大讯飞语音识别服务
 */
export async function connectXfyunIAT(
  userId: string,
  audioStream: Buffer[],
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // 获取用户的 API 配置
    const appId = await getDecryptedApiKey(userId, 'xfyunAppId');
    const apiKey = await getDecryptedApiKey(userId, 'xfyunApiKey');
    const apiSecret = await getDecryptedApiKey(userId, 'xfyunApiSecret');

    if (!appId || !apiKey || !apiSecret) {
      onError('请先配置科大讯飞 API 凭证');
      return;
    }

    // 生成 WebSocket URL
    const url = generateXfyunUrl({ appId, apiKey, apiSecret });

    // 创建 WebSocket 连接
    const ws = new WebSocket(url);

    // 连接建立
    ws.on('open', () => {
      console.log('科大讯飞 IAT WebSocket 连接已建立');

      // 发送首帧参数
      const params = {
        common: {
          app_id: appId,
        },
        business: {
          language: 'zh_cn',
          domain: 'iat',
          accent: 'mandarin',
          vad_eos: 5000, // 静音检测时长
          dwa: 'wpgs', // 开启动态修正
        },
        data: {
          status: 0, // 首帧
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: '', // 首帧 audio 为空
        },
      };

      ws.send(JSON.stringify(params));

      // 发送音频数据
      let frameIndex = 0;
      const sendInterval = setInterval(() => {
        if (frameIndex < audioStream.length) {
          const frame = {
            data: {
              status: 1, // 中间帧
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: audioStream[frameIndex].toString('base64'),
            },
          };
          ws.send(JSON.stringify(frame));
          frameIndex++;
        } else {
          // 发送结束帧
          const endFrame = {
            data: {
              status: 2, // 结束帧
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: '',
            },
          };
          ws.send(JSON.stringify(endFrame));
          clearInterval(sendInterval);
        }
      }, 40); // 每 40ms 发送一帧
    });

    // 接收消息
    ws.on('message', (data: Buffer) => {
      try {
        const result = JSON.parse(data.toString());

        if (result.code !== 0) {
          onError(`识别错误: ${result.message}`);
          ws.close();
          return;
        }

        // 解析识别结果
        if (result.data && result.data.result) {
          const ws_result = result.data.result.ws;
          let text = '';
          
          ws_result.forEach((ws_item: any) => {
            ws_item.cw.forEach((cw_item: any) => {
              text += cw_item.w;
            });
          });

          // 判断是否为最终结果
          const isFinal = result.data.status === 2;
          onResult(text, isFinal);

          if (isFinal) {
            ws.close();
          }
        }
      } catch (error) {
        console.error('解析识别结果失败:', error);
        onError('解析识别结果失败');
      }
    });

    // 错误处理
    ws.on('error', (error) => {
      console.error('WebSocket 错误:', error);
      onError(`WebSocket 错误: ${error.message}`);
    });

    // 连接关闭
    ws.on('close', () => {
      console.log('科大讯飞 IAT WebSocket 连接已关闭');
    });
  } catch (error: any) {
    console.error('连接科大讯飞服务失败:', error);
    onError(`连接失败: ${error.message}`);
  }
}

/**
 * 简化版：处理 base64 音频数据
 */
export async function recognizeAudioBase64(
  userId: string,
  audioBase64: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // 将 base64 转换为 Buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      // 分片处理（每片约 1280 字节）
      const chunkSize = 1280;
      const audioStream: Buffer[] = [];
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        audioStream.push(audioBuffer.slice(i, i + chunkSize));
      }

      let fullText = '';

      await connectXfyunIAT(
        userId,
        audioStream,
        (text, isFinal) => {
          fullText += text;
          if (isFinal) {
            resolve(fullText);
          }
        },
        (error) => {
          reject(new Error(error));
        }
      );
    } catch (error: any) {
      reject(error);
    }
  });
}

