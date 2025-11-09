import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
  Space,
  Typography,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { travelPlanService, CreateTravelPlanData } from '../services/travelPlanService';
import VoiceInput from '../components/VoiceInput';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CreatePlan: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { dateRange, preferences, ...rest } = values;
      
      const planData: CreateTravelPlanData = {
        ...rest,
        startDate: dayjs(dateRange[0]).toISOString(),
        endDate: dayjs(dateRange[1]).toISOString(),
        days: dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day') + 1,
        preferences: preferences || {},
      };

      const { travelPlan } = await travelPlanService.create(planData);
      message.success('旅行计划创建成功！');

      // 自动生成行程
      if (values.autoGenerate) {
        setGenerating(true);
        try {
          await travelPlanService.generateItinerary(travelPlan.id);
          message.success('AI 行程生成成功！');
        } catch (error: any) {
          message.warning('计划已创建，但 AI 生成失败：' + (error.response?.data?.error || '请检查 API Key 配置'));
        } finally {
          setGenerating(false);
        }
      }

      navigate(`/plans/${travelPlan.id}`);
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              <PlusOutlined /> 创建旅行计划
            </Title>
            <Button onClick={() => navigate('/dashboard')}>
              返回主页
            </Button>
          </div>

          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              marginBottom: 24 
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
                🎤 语音快速创建
              </Typography.Title>
              <Typography.Text style={{ color: '#fff', opacity: 0.9 }}>
                说出您的旅行计划，例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
              </Typography.Text>
              <VoiceInput 
                onResult={(text) => {
                  message.success('语音识别成功！正在解析...');
                  message.info(`识别内容：${text}`);
                  // 这里可以添加 AI 解析逻辑，自动填充表单
                }}
                placeholder="点击开始语音输入"
              />
            </Space>
          </Card>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              travelers: 1,
              autoGenerate: true,
            }}
          >
            <Form.Item
              label="计划标题"
              name="title"
              rules={[{ required: true, message: '请输入计划标题' }]}
            >
              <Row gutter={8}>
                <Col flex="auto">
                  <Input placeholder="例如：日本东京5日游" size="large" />
                </Col>
                <Col>
                  <VoiceInput 
                    onResult={(text) => {
                      form.setFieldsValue({ title: text });
                      message.success('标题已填充');
                    }}
                    placeholder="语音输入"
                  />
                </Col>
              </Row>
            </Form.Item>

            <Form.Item
              label="目的地"
              name="destination"
              rules={[{ required: true, message: '请输入目的地' }]}
            >
              <Row gutter={8}>
                <Col flex="auto">
                  <Input placeholder="例如：东京" size="large" />
                </Col>
                <Col>
                  <VoiceInput 
                    onResult={(text) => {
                      form.setFieldsValue({ destination: text });
                      message.success('目的地已填充');
                    }}
                    placeholder="语音输入"
                  />
                </Col>
              </Row>
            </Form.Item>

            <Form.Item
              label="旅行日期"
              name="dateRange"
              rules={[{ required: true, message: '请选择旅行日期' }]}
            >
              <RangePicker
                size="large"
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              label="预算（人民币）"
              name="budget"
              rules={[{ required: true, message: '请输入预算' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                size="large"
                placeholder="例如：10000"
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              label="同行人数"
              name="travelers"
              rules={[{ required: true, message: '请输入人数' }]}
            >
              <InputNumber min={1} max={20} size="large" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="旅行偏好"
              name="preferences"
            >
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="美食">美食</Checkbox>
                  <Checkbox value="文化">文化历史</Checkbox>
                  <Checkbox value="自然">自然风光</Checkbox>
                  <Checkbox value="购物">购物</Checkbox>
                  <Checkbox value="娱乐">娱乐活动</Checkbox>
                  <Checkbox value="亲子">亲子游</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="autoGenerate" valuePropName="checked">
              <Checkbox>
                <RobotOutlined /> 创建后自动生成 AI 行程（需要配置 OpenRouter API Key）
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || generating}
                size="large"
                block
                icon={<PlusOutlined />}
              >
                {generating ? '正在生成 AI 行程...' : '创建计划'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default CreatePlan;
