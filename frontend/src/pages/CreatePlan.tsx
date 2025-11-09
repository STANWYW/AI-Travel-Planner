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
  Modal,
} from 'antd';
import { PlusOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { travelPlanService, CreateTravelPlanData } from '../services/travelPlanService';
import VoiceInput from '../components/VoiceInput';
import api from '../services/api';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CreatePlan: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [parsing, setParsing] = useState(false);

  // 处理语音识别结果，自动解析并创建计划
  const handleVoiceResult = async (text: string) => {
    if (!text || text.trim().length === 0) {
      message.warning('语音识别结果为空，请重试');
      return;
    }

    setParsing(true);
    try {
      message.loading('AI 正在解析语音内容...', 0);
      
      // 调用解析接口
      const parseResponse = await api.post('/api/voice/parse', { text });
      
      if (parseResponse.data.success) {
        const planData = parseResponse.data.planData;
        
        // 询问用户是自动创建还是填充表单
        Modal.confirm({
          title: '🎉 语音解析成功！',
          content: (
            <div style={{ marginTop: 16 }}>
              <p><strong>目的地：</strong>{planData.destination}</p>
              <p><strong>天数：</strong>{planData.days} 天</p>
              <p><strong>预算：</strong>¥{planData.budget}</p>
              <p><strong>人数：</strong>{planData.travelers} 人</p>
              <p style={{ marginTop: 12, color: '#666' }}>
                是否直接创建计划并生成 AI 行程？
              </p>
            </div>
          ),
          okText: '直接创建',
          cancelText: '填充表单',
          onOk: async () => {
            // 直接创建计划
            try {
              message.loading('正在创建计划并生成 AI 行程...', 0);
              const createResponse = await api.post('/api/voice/create-plan', {
                text,
                autoGenerate: true,
              });
              
              if (createResponse.data.success) {
                message.destroy();
                message.success('旅行计划创建成功！AI 正在生成详细行程...');
                navigate(`/plans/${createResponse.data.travelPlan.id}`);
              }
            } catch (error: any) {
              message.destroy();
              message.error(error.response?.data?.error || '创建失败');
            }
          },
          onCancel: () => {
            // 填充表单
            message.destroy();
            message.success('已填充表单，请检查并确认');
            
            // 填充表单字段
            form.setFieldsValue({
              title: planData.title,
              destination: planData.destination,
              dateRange: [
                dayjs(planData.startDate),
                dayjs(planData.endDate),
              ],
              budget: planData.budget,
              travelers: planData.travelers,
              preferences: planData.preferences?.interests || [],
            });
          },
        });
      }
    } catch (error: any) {
      message.destroy();
      console.error('解析语音失败:', error);
      message.error(error.response?.data?.error || 'AI 解析失败，请重试');
    } finally {
      setParsing(false);
    }
  };

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
                onResult={handleVoiceResult}
                placeholder="点击开始语音输入"
              />
              {parsing && (
                <Typography.Text style={{ color: '#fff', opacity: 0.8, fontSize: '12px' }}>
                  ⏳ AI 正在解析中...
                </Typography.Text>
              )}
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
