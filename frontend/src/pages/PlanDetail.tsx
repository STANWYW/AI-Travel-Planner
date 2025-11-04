import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Tag,
  Row,
  Col,
  Spin,
  Timeline,
  Alert,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DollarOutlined,
  RobotOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTravelPlan, generateItinerary, TravelPlan } from '../services/travelPlanService';
import { getApiConfig } from '../services/configService';
import ExpenseManager from '../components/ExpenseManager';
import MapView from '../components/MapView';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mapApiKey, setMapApiKey] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadPlan();
      loadApiConfig();
    }
  }, [id]);

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getTravelPlan(id);
      setPlan(data);
    } catch (error: any) {
      message.error('加载失败：' + (error.response?.data?.error || error.message));
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const loadApiConfig = async () => {
    try {
      const config = await getApiConfig();
      setMapApiKey(config.amapKey || config.baiduMapKey || '');
    } catch (error) {
      console.error('加载API配置失败:', error);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const updated = await generateItinerary(id);
      setPlan(updated);
      message.success('AI 行程生成成功！');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      if (errorMsg.includes('API Key') || errorMsg.includes('未配置')) {
        message.error(
          <span>
            请先在<a href="/settings">设置页面</a>配置 OpenRouter API Key
          </span>,
          5
        );
      } else {
        message.error('生成失败：' + errorMsg);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Empty description="计划不存在" />
        </Content>
      </Layout>
    );
  }

  const getStatusTag = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      draft: { color: 'default', text: '草稿' },
      confirmed: { color: 'blue', text: '已确认' },
      completed: { color: 'green', text: '已完成' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/plans')}
          style={{ marginBottom: 16 }}
        >
          返回列表
        </Button>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    {plan.title}
                  </Title>
                  {getStatusTag(plan.status)}
                </div>
                <Button
                  type="primary"
                  icon={generating ? <LoadingOutlined /> : <RobotOutlined />}
                  onClick={handleGenerateItinerary}
                  loading={generating}
                  size="large"
                >
                  {plan.itinerary ? '重新生成行程' : 'AI 生成行程'}
                </Button>
              </div>

              <Divider />

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Space>
                      <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      <div>
                        <Text type="secondary">目的地</Text>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{plan.destination}</div>
                      </div>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      <div>
                        <Text type="secondary">日期</Text>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>
                          {dayjs(plan.startDate).format('YYYY-MM-DD')} ~{' '}
                          {dayjs(plan.endDate).format('YYYY-MM-DD')}
                          <Tag style={{ marginLeft: 8 }}>{plan.days} 天</Tag>
                        </div>
                      </div>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      <div>
                        <Text type="secondary">同行人数</Text>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{plan.travelers} 人</div>
                      </div>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <DollarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      <div>
                        <Text type="secondary">预算</Text>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>
                          ¥{plan.budget.toLocaleString()}
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>

                {plan.preferences && plan.preferences.interests && plan.preferences.interests.length > 0 && (
                  <div>
                    <Text type="secondary">旅行偏好</Text>
                    <div style={{ marginTop: 8 }}>
                      {plan.preferences.interests.map((interest: string) => (
                        <Tag key={interest} color="blue">
                          {interest}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {plan.preferences && plan.preferences.notes && (
                  <div>
                    <Text type="secondary">特殊要求</Text>
                    <Paragraph style={{ marginTop: 8 }}>{plan.preferences.notes}</Paragraph>
                  </div>
                )}
              </Space>
            </Card>

            {plan.itinerary ? (
              <Card title="AI 生成行程" style={{ marginTop: 16 }}>
                {typeof plan.itinerary === 'string' ? (
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{plan.itinerary}</Paragraph>
                ) : (
                  <Timeline>
                    {plan.itinerary.days?.map((day: any, index: number) => (
                      <Timeline.Item key={index} color="blue">
                        <Title level={5}>第 {index + 1} 天：{day.title || '行程安排'}</Title>
                        <Paragraph>{day.description || day.content}</Paragraph>
                        {day.activities && (
                          <ul>
                            {day.activities.map((activity: any, idx: number) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}

                {plan.suggestions && (
                  <>
                    <Divider />
                    <Title level={5}>AI 建议</Title>
                    <Paragraph>{JSON.stringify(plan.suggestions)}</Paragraph>
                  </>
                )}
              </Card>
            ) : (
              <Card style={{ marginTop: 16 }}>
                <Alert
                  message="还未生成行程"
                  description="点击右上角的「AI 生成行程」按钮，让 AI 为您规划详细的旅行路线。"
                  type="info"
                  showIcon
                  icon={<RobotOutlined />}
                />
              </Card>
            )}

            <div style={{ marginTop: 16 }}>
              <ExpenseManager
                travelPlanId={plan.id}
                expenses={plan.expenses || []}
                budget={plan.budget}
                onRefresh={loadPlan}
              />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <MapView
              destination={plan.destination}
              apiKey={mapApiKey}
              height={400}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default PlanDetail;

