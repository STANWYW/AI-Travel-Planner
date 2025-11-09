import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Typography, Divider, Spin, Select } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiConfigService, ApiConfig } from '../services/apiConfigService';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await apiConfigService.get();
      form.setFieldsValue(config);
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

            <Form.Item
              label="AI 模型选择"
              name="aiModel"
              tooltip="选择用于生成旅行计划的 AI 模型。如果选择的模型不可用，系统会自动切换到其他可用模型。"
            >
              <Select
                placeholder="选择 AI 模型（留空则自动选择）"
                size="large"
                allowClear
              >
                <Select.Option value="deepseek/deepseek-chat-v3-0324:free">
                  DeepSeek Chat V3 (推荐) ⭐
                </Select.Option>
                <Select.Option value="deepseek/deepseek-r1-0528:free">
                  DeepSeek R1
                </Select.Option>
                <Select.Option value="tngtech/deepseek-r1t2-chimera:free">
                  DeepSeek R1T2 Chimera
                </Select.Option>
                <Select.Option value="tngtech/deepseek-r1t-chimera:free">
                  DeepSeek R1T Chimera
                </Select.Option>
                <Select.Option value="google/gemini-2.0-flash-exp:free">
                  Google Gemini 2.0 Flash
                </Select.Option>
              </Select>
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -16, marginBottom: 16 }}>
              💡 提示：留空则使用智能自动选择（推荐），系统会自动选择最快可用的模型
            </Text>

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
