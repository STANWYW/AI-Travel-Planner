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
  Select,
  Checkbox,
} from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { travelPlanService, CreateTravelPlanData } from '../services/travelPlanService';
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
          <Title level={2}>
            <PlusOutlined /> 创建旅行计划
          </Title>

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
              <Input placeholder="例如：日本东京5日游" size="large" />
            </Form.Item>

            <Form.Item
              label="目的地"
              name="destination"
              rules={[{ required: true, message: '请输入目的地' }]}
            >
              <Input placeholder="例如：东京" size="large" />
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
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
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
