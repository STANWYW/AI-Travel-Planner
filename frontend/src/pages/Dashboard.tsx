import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Title level={3} style={{ margin: 0 }}>AI 旅行规划师</Title>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Header>
      <Content style={{
        padding: '24px',
        background: '#f0f2f5',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 8, fontSize: 20 }} />
                用户信息
              </div>
            }
          >
            <Paragraph>
              <strong>用户名：</strong>{user?.username}
            </Paragraph>
            <Paragraph>
              <strong>邮箱：</strong>{user?.email}
            </Paragraph>
          </Card>

          <Card title="欢迎使用 AI 旅行规划师">
            <Paragraph>
              您已成功登录系统！这是一个功能强大的 AI 旅行规划应用。
            </Paragraph>
            <Paragraph>
              即将推出的功能：
            </Paragraph>
            <ul>
              <li>🎤 智能语音识别旅行需求</li>
              <li>🗺️ AI 自动生成个性化旅行路线</li>
              <li>💰 智能费用预算与管理</li>
              <li>📍 实时地图导航与景点推荐</li>
              <li>☁️ 云端同步所有旅行计划</li>
            </ul>
            <Paragraph style={{ marginTop: 20, color: '#999' }}>
              当前版本仅包含用户注册登录系统，更多精彩功能敬请期待...
            </Paragraph>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;

