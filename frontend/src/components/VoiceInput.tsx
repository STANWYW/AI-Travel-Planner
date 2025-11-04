import React, { useState } from 'react';
import { Button, message } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import { voiceService } from '../services/voiceService';

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceInput = async () => {
    if (isRecording) {
      // 停止录音
      voiceService.stopRecording();
      setIsRecording(false);
      message.info('录音已停止');
    } else {
      // 开始录音
      if (!voiceService.isSupported()) {
        message.error('您的浏览器不支持录音功能');
        return;
      }

      setIsRecording(true);
      message.info('开始录音，再次点击停止...');

      await voiceService.startRecording(
        (text) => {
          onResult(text);
          message.success('语音识别完成');
        },
        (error) => {
          message.error(`语音识别失败：${error}`);
          setIsRecording(false);
        }
      );
    }
  };

  return (
    <Button
      type={isRecording ? 'primary' : 'default'}
      icon={isRecording ? <LoadingOutlined /> : <AudioOutlined />}
      onClick={handleVoiceInput}
      disabled={disabled}
      danger={isRecording}
    >
      {isRecording ? '停止录音' : '语音输入'}
    </Button>
  );
};

export default VoiceInput;

