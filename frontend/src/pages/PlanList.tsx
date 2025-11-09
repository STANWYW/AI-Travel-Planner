import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  Input,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { travelPlanService, TravelPlan } from '../services/travelPlanService';

const { Title } = Typography;
const { Search } = Input;

const PlanList: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { travelPlans } = await travelPlanService.getAll();
      setPlans(travelPlans);
    } catch (error) {
      message.error('加载旅行计划失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'completed':
        return 'blue';
      default:
        return 'orange';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'completed':
        return '已完成';
      default:
        return '草稿';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space direction="vertical">
            <Title level={2} style={{ margin: 0 }}>我的旅行计划</Title>
            <Button onClick={() => navigate('/dashboard')} style={{ padding: 0 }} type="link">
              ← 返回主页
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/plans/create')}
          >
            创建新计划
          </Button>
        </div>

        <Search
          placeholder="搜索计划..."
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
        />

        <Spin spinning={loading}>
          {filteredPlans.length === 0 ? (
            <Empty
              description={plans.length === 0 ? '还没有旅行计划，创建一个吧！' : '没有找到匹配的计划'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {plans.length === 0 && (
                <Button type="primary" onClick={() => navigate('/plans/create')}>
                  创建第一个计划
                </Button>
              )}
            </Empty>
          ) : (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              dataSource={filteredPlans}
              renderItem={(plan) => (
                <List.Item>
                  <Card
                    hoverable
                    onClick={() => navigate(`/plans/${plan.id}`)}
                    style={{ height: '100%' }}
                    actions={[
                      <Button
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/plans/${plan.id}`);
                        }}
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <span>{plan.title}</span>
                          <Tag color={getStatusColor(plan.status)}>
                            {getStatusText(plan.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div>
                            <CalendarOutlined /> {plan.destination}
                          </div>
                          <div>
                            {new Date(plan.startDate).toLocaleDateString()} -{' '}
                            {new Date(plan.endDate).toLocaleDateString()}
                          </div>
                          <div>
                            <DollarOutlined /> 预算：¥{plan.budget.toLocaleString()}
                          </div>
                          <div>👥 {plan.travelers} 人 · {plan.days} 天</div>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Space>
    </div>
  );
};

export default PlanList;
