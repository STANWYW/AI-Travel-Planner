import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Card, message, Divider, Typography, Space, Tag } from 'antd';
import { SaveOutlined, KeyOutlined } from '@ant-design/icons';
import { getApiConfig, updateApiConfig, ApiConfig } from '../services/configService';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<ApiConfig>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await getApiConfig();
      setConfigStatus(config);
      message.success('配置加载成功');
    } catch (error) {
      message.error('加载配置失败');
    }
  };

  const handleSubmit = async (values: ApiConfig) => {
    setLoading(true);
    try {
      await updateApiConfig(values);
      message.success('配置保存成功！');
      loadConfig();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Card>
          <Title level={2}>
            <KeyOutlined /> API 配置
          </Title>
          <Paragraph>
            配置 API Keys 以启用各项功能。API Keys 会安全保存在服务器端。
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Divider orientation="left">
              <Space>
                AI 服务（必需）
                {configStatus.openrouterKey && <Tag color="green">已配置</Tag>}
              </Space>
            </Divider>
            
            <Form.Item
              label="OpenRouter API Key"
              name="openrouterKey"
              extra={
                <Text type="secondary">
                  用于 AI 行程生成和预算分析。获取地址：
                  <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">
                    https://openrouter.ai/
                  </a>
                </Text>
              }
            >
              <Input.Password
                placeholder={configStatus.openrouterKey || "sk-or-v1-..."}
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Divider orientation="left">
              <Space>
                语音识别（可选）
                {configStatus.xfyunAppId && <Tag color="green">已配置</Tag>}
              </Space>
            </Divider>
            
            <Paragraph type="secondary">
              科大讯飞语音识别服务。获取地址：
              <a href="https://console.xfyun.cn/" target="_blank" rel="noopener noreferrer">
                https://console.xfyun.cn/
              </a>
            </Paragraph>

            <Form.Item
              label="科大讯飞 AppId"
              name="xfyunAppId"
            >
              <Input placeholder={configStatus.xfyunAppId || "输入 AppId"} />
            </Form.Item>

            <Form.Item
              label="科大讯飞 ApiKey"
              name="xfyunApiKey"
            >
              <Input placeholder={configStatus.xfyunApiKey || "输入 ApiKey"} />
            </Form.Item>

            <Form.Item
              label="科大讯飞 ApiSecret"
              name="xfyunApiSecret"
            >
              <Input.Password placeholder={configStatus.xfyunApiSecret || "输入 ApiSecret"} />
            </Form.Item>

            <Divider orientation="left">
              <Space>
                地图服务（可选）
                {(configStatus.amapKey || configStatus.baiduMapKey) && <Tag color="green">已配置</Tag>}
              </Space>
            </Divider>
            
            <Form.Item
              label="高德地图 API Key"
              name="amapKey"
              extra={
                <Text type="secondary">
                  获取地址：
                  <a href="https://console.amap.com/" target="_blank" rel="noopener noreferrer">
                    https://console.amap.com/
                  </a>
                </Text>
              }
            >
              <Input placeholder={configStatus.amapKey || "输入高德地图 Key"} />
            </Form.Item>

            <Form.Item
              label="百度地图 API Key"
              name="baiduMapKey"
              extra={
                <Text type="secondary">
                  获取地址：
                  <a href="https://lbsyun.baidu.com/" target="_blank" rel="noopener noreferrer">
                    https://lbsyun.baidu.com/
                  </a>
                </Text>
              }
            >
              <Input placeholder={configStatus.baiduMapKey || "输入百度地图 Key"} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={loading}
                block
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Settings;

