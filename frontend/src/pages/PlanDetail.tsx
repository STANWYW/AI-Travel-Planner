import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Spin,
  message,
  Tabs,
  Timeline,
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  DeleteOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { travelPlanService, TravelPlan } from '../services/travelPlanService';
import ExpenseManager from '../components/ExpenseManager';
import MapView from '../components/MapView';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlan();
    }
  }, [id]);

  const loadPlan = async () => {
    try {
      const { travelPlan } = await travelPlanService.getById(id!);
      setPlan(travelPlan);
    } catch (error) {
      message.error('加载计划失败');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const { travelPlan } = await travelPlanService.generateItinerary(id);
      setPlan(travelPlan);
      message.success('AI 行程生成成功！');
    } catch (error: any) {
      message.error(error.response?.data?.error || '生成失败，请检查 API Key 配置');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('确定要删除这个旅行计划吗？')) return;

    try {
      await travelPlanService.delete(id);
      message.success('计划已删除');
      navigate('/plans');
    } catch (error) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const itinerary = plan.itinerary || {};
  const dailyItinerary = itinerary.dailyItinerary || [];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button onClick={() => navigate('/dashboard')}>
              返回主页
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/plans')}>
              返回列表
            </Button>
          </Space>
          <Space>
            <Button
              icon={<RobotOutlined />}
              loading={generating}
              onClick={handleGenerateItinerary}
              disabled={!!plan.itinerary}
            >
              {plan.itinerary ? '已生成行程' : '生成 AI 行程'}
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          </Space>
        </div>

        <Card>
          <Title level={2}>{plan.title}</Title>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="目的地">{plan.destination}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={plan.status === 'confirmed' ? 'green' : 'orange'}>
                {plan.status === 'confirmed' ? '已确认' : '草稿'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {new Date(plan.startDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {new Date(plan.endDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="天数">{plan.days} 天</Descriptions.Item>
            <Descriptions.Item label="人数">{plan.travelers} 人</Descriptions.Item>
            <Descriptions.Item label="预算">
              <DollarOutlined /> ¥{plan.budget.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs defaultActiveKey="itinerary">
          <TabPane tab="行程安排" key="itinerary">
            {dailyItinerary.length > 0 ? (
              <Card>
                {itinerary.overview && (
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4}>行程概述</Title>
                    <Paragraph>{itinerary.overview}</Paragraph>
                  </div>
                )}
                <Timeline>
                  {dailyItinerary.map((day: any, index: number) => (
                    <Timeline.Item key={index}>
                      <Card size="small" style={{ marginBottom: 16 }}>
                        <Title level={4}>第 {day.day} 天</Title>
                        {day.activities && day.activities.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <strong>活动安排：</strong>
                            {day.activities.map((activity: any, i: number) => (
                              <div key={i} style={{ marginLeft: 20, marginTop: 8 }}>
                                <Tag>{activity.time}</Tag> {activity.activity} - {activity.location}
                                {activity.cost && <span> (¥{activity.cost})</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {day.meals && (
                          <div>
                            <strong>用餐：</strong>
                            <div style={{ marginLeft: 20, marginTop: 8 }}>
                              <div>早餐：{day.meals.breakfast}</div>
                              <div>午餐：{day.meals.lunch}</div>
                              <div>晚餐：{day.meals.dinner}</div>
                            </div>
                          </div>
                        )}
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <RobotOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                  <Paragraph type="secondary">
                    还没有生成行程，点击上方的"生成 AI 行程"按钮开始吧！
                  </Paragraph>
                </div>
              </Card>
            )}
          </TabPane>

          <TabPane tab="费用管理" key="expenses">
            <ExpenseManager travelPlanId={plan.id} budget={plan.budget} />
          </TabPane>

          <TabPane tab="地图" key="map">
            <MapView destination={plan.destination} />
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default PlanDetail;
