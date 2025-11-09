import WebSocket from 'ws';
import crypto from 'crypto';
import { getDecryptedApiKey } from '../controllers/apiConfigController';

// 科大讯飞中英识别大模型 API
// 参考文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html

interface XfyunConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * 生成科大讯飞中英识别大模型 WebSocket 连接 URL
 * 参考文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html
 */
function generateXfyunUrl(config: XfyunConfig): string {
  const { appId, apiKey, apiSecret } = config;
  
  // 生成 RFC1123 格式的时间戳
  const date = new Date().toUTCString();
  
  // API 主机地址（中英识别大模型）
  const host = 'iat.xf-yun.com';
  const path = '/v1';
  
  // 构建签名原文（严格按照官方文档格式）
  // signature_origin = host: $host\ndate: $date\n$request-line
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
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
  const url = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${host}`;
  
  console.log('科大讯飞 WebSocket URL 已生成');
  console.log('AppID:', appId);
  console.log('APIKey:', apiKey.substring(0, 10) + '...');
  console.log('Host:', host);
  console.log('Date:', date);
  console.log('Signature Origin:', signatureOrigin.replace(/\n/g, '\\n'));
  console.log('URL:', url.substring(0, 100) + '...');
  
  return url;
}

/**
 * 连接科大讯飞中英识别大模型服务
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

    let fullText = '';
    let isConnected = false;

    // 连接建立
    ws.on('open', () => {
      console.log('科大讯飞 IAT WebSocket 连接已建立');
      isConnected = true;

      // 发送首帧数据（包含完整参数配置）
      const firstFrame = {
        header: {
          app_id: appId,
          status: 0, // 0: 首帧
        },
        parameter: {
          iat: {
            domain: 'slm', // 大模型领域
            language: 'zh_cn', // 语种
            accent: 'mandarin', // 方言（普通话）
            eos: 6000, // 静音多少秒停止识别（6000毫秒）
            dwa: 'wpgs', // 开启动态修正
            result: {
              encoding: 'utf8',
              compress: 'raw',
              format: 'json',
            },
          },
        },
        payload: {
          audio: {
            encoding: 'raw', // raw 代表 pcm 格式
            sample_rate: 16000, // 采样率
            channels: 1, // 声道
            bit_depth: 16, // 位深
            seq: 1, // 数据序号
            status: 0, // 0: 开始
            audio: '', // 首帧 audio 为空
          },
        },
      };

      console.log('发送首帧数据...');
      ws.send(JSON.stringify(firstFrame));

      // 发送音频数据
      let seq = 2; // 从 2 开始
      let frameIndex = 0;
      
      const sendInterval = setInterval(() => {
        if (!isConnected) {
          clearInterval(sendInterval);
          return;
        }

        if (frameIndex < audioStream.length) {
          // 中间帧数据
          const middleFrame = {
            header: {
              app_id: appId,
              status: 1, // 1: 中间帧
            },
            payload: {
              audio: {
                encoding: 'raw',
                sample_rate: 16000,
                channels: 1,
                bit_depth: 16,
                seq: seq++,
                status: 1, // 1: 继续
                audio: audioStream[frameIndex].toString('base64'),
              },
            },
          };
          
          ws.send(JSON.stringify(middleFrame));
          frameIndex++;
        } else {
          // 发送结束帧
          const endFrame = {
            header: {
              app_id: appId,
              status: 2, // 2: 最后一帧
            },
            payload: {
              audio: {
                encoding: 'raw',
                sample_rate: 16000,
                channels: 1,
                bit_depth: 16,
                seq: seq++,
                status: 2, // 2: 结束
                audio: '', // 最后一帧 audio 为空
              },
            },
          };
          
          console.log('发送结束帧...');
          ws.send(JSON.stringify(endFrame));
          clearInterval(sendInterval);
        }
      }, 40); // 每 40ms 发送一帧（建议间隔）
    });

    // 接收消息
    ws.on('message', (data: Buffer) => {
      try {
        const result = JSON.parse(data.toString());
        
        console.log('收到消息:', JSON.stringify(result).substring(0, 200));

        // 检查错误
        if (result.header && result.header.code !== 0) {
          console.error('识别错误:', result.header.message);
          onError(`识别错误: ${result.header.message || '未知错误'}`);
          ws.close();
          return;
        }

        // 解析识别结果
        if (result.payload && result.payload.result) {
          const resultData = result.payload.result;
          
          // text 字段是 base64 编码的 JSON，需要解码
          if (resultData.text) {
            try {
              const decodedText = Buffer.from(resultData.text, 'base64').toString('utf8');
              const textData = JSON.parse(decodedText);
              
              console.log('解析后的文本数据:', JSON.stringify(textData).substring(0, 200));
              
              // 提取识别文本
              if (textData.ws && Array.isArray(textData.ws)) {
                let text = '';
                
                textData.ws.forEach((ws_item: any) => {
                  if (ws_item.cw && Array.isArray(ws_item.cw)) {
                    ws_item.cw.forEach((cw_item: any) => {
                      if (cw_item.w) {
                        text += cw_item.w;
                      }
                    });
                  }
                });

                if (text) {
                  console.log('识别文本:', text);
                  
                  // 判断是否为最终结果
                  const isFinal = resultData.status === 2 || textData.ls === true;
                  
                  if (isFinal) {
                    // 最终结果：追加或替换
                    if (resultData.pgs === 'rpl') {
                      // 替换前面的结果
                      fullText = text;
                    } else {
                      // 追加到前面的结果
                      fullText += text;
                    }
                    onResult(fullText, true);
                    console.log('最终识别结果:', fullText);
                    ws.close();
                  } else {
                    // 中间结果
                    if (resultData.pgs === 'rpl') {
                      // 替换前面的结果
                      fullText = text;
                    } else {
                      // 追加到前面的结果
                      fullText += text;
                    }
                    onResult(fullText, false);
                  }
                }
              }
            } catch (decodeError) {
              console.error('解码识别结果失败:', decodeError);
            }
          }
        } else if (result.header && result.header.status === 0) {
          // 首帧响应，表示连接成功
          console.log('连接成功，开始接收识别结果');
        }
      } catch (error) {
        console.error('解析识别结果失败:', error);
        console.error('原始数据:', data.toString().substring(0, 500));
      }
    });

    // 错误处理
    ws.on('error', (error: any) => {
      console.error('WebSocket 错误:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
      
      isConnected = false;
      
      if (error.message?.includes('401') || error.statusCode === 401) {
        onError('认证失败 (401): 请检查 API Key、API Secret 和 AppID 是否正确');
      } else {
        onError(`WebSocket 错误: ${error.message}`);
      }
    });

    // 连接关闭
    ws.on('close', (code: number, reason: Buffer) => {
      console.log('科大讯飞 IAT WebSocket 连接已关闭');
      console.log('关闭代码:', code);
      console.log('关闭原因:', reason.toString());
      
      isConnected = false;
      
      if (code === 1005) {
        // 1005: 没有收到关闭帧，连接异常关闭
        // 可能是没有发送数据或数据格式错误
        if (!fullText) {
          onError('连接异常关闭，未收到识别结果。请检查音频数据是否正确发送');
        }
      } else if (code === 1006) {
        // 异常关闭
        onError('连接异常关闭，可能是认证失败或网络问题');
      }
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
      
      console.log('音频数据大小:', audioBuffer.length, '字节');
      
      // 分片处理（每片约 1280 字节，对应 40ms 的 16kHz 16bit 单声道音频）
      const chunkSize = 1280;
      const audioStream: Buffer[] = [];
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        audioStream.push(audioBuffer.slice(i, i + chunkSize));
      }

      console.log('音频分片数量:', audioStream.length);

      let fullText = '';

      await connectXfyunIAT(
        userId,
        audioStream,
        (text, isFinal) => {
          fullText = text;
          if (isFinal) {
            console.log('识别完成，最终结果:', fullText);
            resolve(fullText);
          }
        },
        (error) => {
          console.error('识别失败:', error);
          reject(new Error(error));
        }
      );
    } catch (error: any) {
      reject(error);
    }
  });
}
