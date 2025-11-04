// 语音识别服务
// 使用科大讯飞 WebSocket API
// 如果未配置API密钥，则返回提示信息

export interface VoiceRecognitionResult {
  text: string;
  isFinal: boolean;
}

export interface VoiceServiceConfig {
  appId?: string;
  apiKey?: string;
  apiSecret?: string;
}

class VoiceService {
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;

  // 检查浏览器是否支持录音
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // 开始录音（简化版本，不依赖科大讯飞）
  async startRecording(onResult: (text: string) => void, onError: (error: string) => void): Promise<void> {
    if (!this.isSupported()) {
      onError('您的浏览器不支持录音功能');
      return;
    }

    try {
      // 获取麦克风权限
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        // 注意：这是简化版本
        // 实际使用时需要连接到语音识别API
        onResult('（语音识别功能需要配置科大讯飞 API Key）');
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error: any) {
      onError(error.message || '无法访问麦克风');
    }
  }

  // 停止录音
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // 停止所有音频轨道
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
    }
  }

  // 检查是否正在录音
  getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceService = new VoiceService();

