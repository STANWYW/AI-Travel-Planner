import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Typography, Divider, Spin, Radio, Select } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiConfigService, ApiConfig } from '../services/apiConfigService';

const { Title, Text } = Typography;
const { Option } = Select;

// OpenRouter 可用模型
const OPENROUTER_MODELS = [
  { value: '', label: '自动选择（推荐）' },
  { value: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek Chat V3 (免费)' },
  { value: 'deepseek/deepseek-r1-0528:free', label: 'DeepSeek R1 (免费)' },
  { value: 'tngtech/deepseek-r1t2-chimera:free', label: 'DeepSeek R1T2 Chimera (免费)' },
  { value: 'tngtech/deepseek-r1t-chimera:free', label: 'DeepSeek R1T Chimera (免费)' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Google Gemini 2.0 Flash (免费)' },
];

// DeepSeek 可用模型
const DEEPSEEK_MODELS = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat (推荐)' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  { value: 'deepseek-coder', label: 'DeepSeek Coder' },
];

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [aiProvider, setAiProvider] = useState<string>('openrouter');
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await apiConfigService.get();
      form.setFieldsValue(config);
      setAiProvider(config.aiProvider || 'openrouter');
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const onFinish = async (values: ApiConfig) => {
    setLoading(true);
    try {
      await apiConfigService.update(values);
      message.success('API 配置已保存！');
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <SettingOutlined /> API 配置
              </Title>
              <Text type="secondary">
                配置第三方 API Keys 以启用完整功能。所有密钥仅存储在您的账户中。
              </Text>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              返回主页
            </Button>
          </div>

          <Divider />

          <Spin spinning={loadingConfig}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
            <Divider orientation="left">AI 提供商配置</Divider>

            <Form.Item
              label="选择 AI 提供商"
              name="aiProvider"
              rules={[{ required: true, message: '请选择 AI 提供商' }]}
            >
              <Radio.Group 
                onChange={(e) => setAiProvider(e.target.value)}
                size="large"
              >
                <Radio.Button value="openrouter">OpenRouter</Radio.Button>
                <Radio.Button value="deepseek">DeepSeek</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="选择模型"
              name="selectedModel"
              tooltip={aiProvider === 'openrouter' 
                ? '选择特定模型，或选择"自动选择"让系统自动切换' 
                : '选择 DeepSeek 模型'}
            >
              <Select size="large" placeholder="选择模型">
                {(aiProvider === 'openrouter' ? OPENROUTER_MODELS : DEEPSEEK_MODELS).map((model) => (
                  <Option key={model.value} value={model.value}>
                    {model.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {aiProvider === 'openrouter' && (
              <Form.Item
                label="OpenRouter API Key"
                name="openrouterKey"
                tooltip="用于 AI 行程生成和预算分析。获取地址：https://openrouter.ai/"
                rules={[{ required: true, message: '请输入 OpenRouter API Key' }]}
              >
                <Input.Password
                  placeholder="sk-or-v1-..."
                  size="large"
                />
              </Form.Item>
            )}

            {aiProvider === 'deepseek' && (
              <Form.Item
                label="DeepSeek API Key"
                name="deepseekKey"
                tooltip="用于 AI 行程生成和预算分析。获取地址：https://platform.deepseek.com/"
                rules={[{ required: true, message: '请输入 DeepSeek API Key' }]}
              >
                <Input.Password
                  placeholder="sk-..."
                  size="large"
                />
              </Form.Item>
            )}

            <Divider orientation="left">语音识别（可选）</Divider>

            <Form.Item
              label="科大讯飞 AppId"
              name="xfyunAppId"
              tooltip="用于语音输入功能。获取地址：https://console.xfyun.cn/"
            >
              <Input placeholder="AppId" size="large" />
            </Form.Item>

            <Form.Item
              label="科大讯飞 ApiKey"
              name="xfyunApiKey"
            >
              <Input.Password placeholder="ApiKey" size="large" />
            </Form.Item>

            <Form.Item
              label="科大讯飞 ApiSecret"
              name="xfyunApiSecret"
            >
              <Input.Password placeholder="ApiSecret" size="large" />
            </Form.Item>

            <Divider orientation="left">地图服务（可选）</Divider>

            <Form.Item
              label="高德地图 Key"
              name="amapKey"
              tooltip="用于地图展示和导航。获取地址：https://console.amap.com/"
            >
              <Input.Password placeholder="高德地图 Key" size="large" />
            </Form.Item>

            <Form.Item
              label="百度地图 Key"
              name="baiduMapKey"
              tooltip="用于地图展示和导航。获取地址：https://lbsyun.baidu.com/"
            >
              <Input.Password placeholder="百度地图 Key" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SaveOutlined />}
                block
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default Settings;
