import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Typography, Row, Col, Space } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  RobotOutlined,
  AudioOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const featureCards = [
    {
      icon: <PlusOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      title: '创建旅行计划',
      description: '使用语音或文字输入，快速创建您的旅行计划',
      action: () => navigate('/plans/create'),
      buttonText: '创建计划',
      color: '#1890ff',
    },
    {
      icon: <UnorderedListOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      title: '我的计划',
      description: '查看和管理所有旅行计划',
      action: () => navigate('/plans'),
      buttonText: '查看计划',
      color: '#52c41a',
    },
    {
      icon: <SettingOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      title: 'API 配置',
      description: '配置 AI、语音识别和地图服务',
      action: () => navigate('/settings'),
      buttonText: '前往设置',
      color: '#faad14',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>🌏 AI 旅行规划师</Title>
        <Space>
          <Button onClick={() => navigate('/plans')}>我的计划</Button>
          <Button onClick={() => navigate('/settings')}>设置</Button>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Space>
      </Header>
      <Content
        style={{
          padding: '24px',
          background: '#f0f2f5',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 8, fontSize: 20 }} />
                欢迎回来，{user?.username}！
              </div>
            }
          >
            <Paragraph>
              <strong>邮箱：</strong>{user?.email}
            </Paragraph>
            <Paragraph>
              开始规划您的梦想之旅吧！使用 AI 生成个性化旅行路线，管理预算，记录美好回忆。
            </Paragraph>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {featureCards.map((feature, index) => (
              <Col xs={24} sm={24} md={8} key={index}>
                <Card
                  hoverable
                  style={{ height: '100%', textAlign: 'center' }}
                  bodyStyle={{ padding: '32px 24px' }}
                >
                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph style={{ minHeight: 60 }}>{feature.description}</Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    onClick={feature.action}
                    style={{ backgroundColor: feature.color, borderColor: feature.color }}
                  >
                    {feature.buttonText}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          <Card title="✨ 功能特性">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <RobotOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  <strong>AI 智能规划</strong>
                  <span style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                    自动生成个性化行程
                  </span>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <AudioOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <strong>语音输入</strong>
                  <span style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                    支持语音快速创建计划
                  </span>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <EnvironmentOutlined style={{ fontSize: 32, color: '#faad14' }} />
                  <strong>地图导航</strong>
                  <span style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                    可视化展示旅行路线
                  </span>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <DollarOutlined style={{ fontSize: 32, color: '#f5222d' }} />
                  <strong>预算管理</strong>
                  <span style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                    实时跟踪旅行花费
                  </span>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;

