import React, { useState, useRef } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import { apiConfigService } from '../services/apiConfigService';

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
      await apiConfigService.get();
      
      // 这里应该调用科大讯飞 WebSocket API
      // 由于实现较复杂，这里提供一个简化版本
      // 实际应该使用 WebSocket 实时传输音频流
      
      // 示例：将音频转换为 base64 并发送到后端
      const reader = new FileReader();
      reader.onloadend = async () => {
        // const base64Audio = reader.result as string;
        
        // 调用后端语音识别接口（需要实现）
        // const response = await api.post('/api/voice/recognize', { audio: base64Audio });
        // onResult(response.data.text);
        
        // 临时提示
        message.warning('语音识别功能需要后端支持，请参考科大讯飞文档实现 WebSocket 连接');
        setRecognizing(false);
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
