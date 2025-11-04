import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { authService, LoginData } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: LoginData) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      message.success(response.message || '登录成功！');
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '登录失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        title={<h2 style={{ textAlign: 'center', margin: 0 }}>AI 旅行规划师 - 登录</h2>}
        style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址！' },
              { type: 'email', message: '请输入有效的邮箱地址！' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ marginBottom: 10 }}
            >
              登录
            </Button>
            <div style={{ textAlign: 'center' }}>
              还没有账号？<Link to="/register">立即注册</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

