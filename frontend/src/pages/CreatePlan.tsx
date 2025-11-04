import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  message,
  Space,
  Divider,
  Typography,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { SaveOutlined, RobotOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createTravelPlan } from '../services/travelPlanService';
import VoiceInput from '../components/VoiceInput';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CreatePlan: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const preferenceOptions = [
    { label: '美食', value: 'food' },
    { label: '文化', value: 'culture' },
    { label: '自然风光', value: 'nature' },
    { label: '购物', value: 'shopping' },
    { label: '历史', value: 'history' },
    { label: '冒险', value: 'adventure' },
    { label: '放松', value: 'relaxation' },
    { label: '亲子', value: 'family' },
  ];

  const handleVoiceResult = (text: string) => {
    // 将语音识别结果填充到表单
    // 这里可以使用 AI 来解析语音内容并填充到对应字段
    // 简化版本：直接显示识别结果
    message.info(`识别结果：${text}`);
    
    // 可以在这里添加逻辑解析语音内容，例如：
    // "我想去日本，5天，预算1万元"
    // 然后自动填充到表单相应字段
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { dateRange, ...rest } = values;
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const days = dateRange[1].diff(dateRange[0], 'days') + 1;

      const planData = {
        ...rest,
        startDate,
        endDate,
        days,
        preferences: {
          interests: values.interests || [],
          notes: values.notes || '',
        },
      };

      const plan = await createTravelPlan(planData);
      message.success('旅行计划创建成功！');
      navigate(`/plans/${plan.id}`);
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Card>
          <Title level={2}>
            <RobotOutlined /> 创建旅行计划
          </Title>
          <Paragraph>
            填写旅行信息，我们的 AI 将为您生成个性化的旅行路线。
          </Paragraph>

          <Space style={{ marginBottom: 16 }}>
            <VoiceInput onResult={handleVoiceResult} />
            <span style={{ color: '#999' }}>
              支持语音输入，例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
            </span>
          </Space>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              travelers: 1,
              budget: 5000,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="旅行标题"
                  name="title"
                  rules={[{ required: true, message: '请输入旅行标题' }]}
                >
                  <Input placeholder="例如：日本东京之旅" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="目的地"
                  name="destination"
                  rules={[{ required: true, message: '请输入目的地' }]}
                >
                  <Input placeholder="例如：东京" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="旅行日期"
                  name="dateRange"
                  rules={[{ required: true, message: '请选择旅行日期' }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    size="large"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="预算（元）"
                  name="budget"
                  rules={[{ required: true, message: '请输入预算' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    step={1000}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  label="同行人数"
                  name="travelers"
                  rules={[{ required: true, message: '请输入人数' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={1}
                    max={20}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>旅行偏好</Divider>

            <Form.Item
              label="您的兴趣"
              name="interests"
            >
              <Checkbox.Group options={preferenceOptions} />
            </Form.Item>

            <Form.Item
              label="其他要求"
              name="notes"
            >
              <TextArea
                rows={4}
                placeholder="例如：带小孩，需要无障碍设施，对海鲜过敏等..."
              />
            </Form.Item>

            <Form.Item>
              <Space size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                >
                  创建计划
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate('/plans')}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default CreatePlan;

