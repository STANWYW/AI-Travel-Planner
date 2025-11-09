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

  const recognizeAudio = async (audioBlob: Blob) => {
    setRecognizing(true);
    try {
      // 将音频转换为 base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          // 移除 data URL 前缀，只保留 base64 数据
          const base64Audio = base64Data.split(',')[1];

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
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('识别失败:', error);
      message.error('语音识别失败');
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
