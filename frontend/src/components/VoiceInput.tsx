import React, { useState, useRef } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import { apiConfigService } from '../services/apiConfigService';
import api from '../services/api';

const { Text } = Typography;

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult: _onResult, placeholder = '点击开始录音' }) => {
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // 检查科大讯飞配置
      const config = await apiConfigService.get();
      if (!config.xfyunAppId || !config.xfyunApiKey || !config.xfyunApiSecret) {
        message.warning('请先在设置中配置科大讯飞 API 凭证');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await recognizeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      message.info('开始录音...');
    } catch (error) {
      console.error('录音失败:', error);
      message.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      message.info('正在识别...');
    }
  };

  // 将音频 Blob 转换为 PCM 格式
  const convertToPCM = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          
          // 使用 AudioContext 解码音频
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 转换为 16kHz 单声道 PCM
          const targetSampleRate = 16000;
          const sourceSampleRate = audioBuffer.sampleRate;
          const ratio = sourceSampleRate / targetSampleRate;
          
          // 获取第一个声道的数据
          const sourceData = audioBuffer.getChannelData(0);
          const targetLength = Math.floor(sourceData.length / ratio);
          const targetData = new Float32Array(targetLength);
          
          // 重采样
          for (let i = 0; i < targetLength; i++) {
            const sourceIndex = Math.floor(i * ratio);
            targetData[i] = sourceData[sourceIndex];
          }
          
          // 转换为 16-bit PCM
          const pcmData = new Int16Array(targetLength);
          for (let i = 0; i < targetLength; i++) {
            // 将 -1.0 到 1.0 的浮点数转换为 -32768 到 32767 的整数
            const s = Math.max(-1, Math.min(1, targetData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // 转换为 base64
          const bytes = new Uint8Array(pcmData.buffer);
          const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
          const base64 = btoa(binary);
          
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const recognizeAudio = async (audioBlob: Blob) => {
    setRecognizing(true);
    try {
      console.log('音频 Blob 大小:', audioBlob.size, '字节');
      
      // 将音频转换为 PCM 格式
      const base64Audio = await convertToPCM(audioBlob);
      console.log('PCM 数据大小:', base64Audio.length, '字符');

      // 调用后端语音识别接口
      const response = await api.post('/api/voice/recognize', { 
        audioBase64: base64Audio 
      });

      if (response.data.success) {
        _onResult(response.data.text);
        message.success('语音识别完成！');
      } else {
        throw new Error(response.data.error || '识别失败');
      }
    } catch (error: any) {
      console.error('语音识别失败:', error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('语音识别失败，请检查网络连接和 API 配置');
      }
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        type={recording ? 'default' : 'primary'}
        danger={recording}
        icon={recording ? <StopOutlined /> : <AudioOutlined />}
        onClick={recording ? stopRecording : startRecording}
        loading={recognizing}
        block
        size="large"
      >
        {recording ? '停止录音' : recognizing ? '正在识别...' : placeholder}
      </Button>
      {recording && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          ⏺️ 正在录音中...
        </Text>
      )}
    </Space>
  );
};

export default VoiceInput;
