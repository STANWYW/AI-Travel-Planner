import React, { useEffect, useRef } from 'react';
import { Card, Empty, Alert } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

interface MapViewProps {
  destination: string;
  apiKey?: string;
  height?: number;
}

const MapView: React.FC<MapViewProps> = ({ destination, apiKey, height = 400 }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 这里可以集成高德或百度地图
    // 如果没有 API Key，显示占位符
    if (!apiKey) {
      return;
    }

    // TODO: 集成地图 SDK
    // 示例：高德地图初始化
    // const map = new AMap.Map(mapRef.current, {
    //   zoom: 11,
    //   center: [116.397428, 39.90923]
    // });
  }, [destination, apiKey]);

  if (!apiKey) {
    return (
      <Card>
        <Alert
          message="地图功能未启用"
          description={
            <div>
              <p>请在设置页面配置高德地图或百度地图 API Key 以启用地图功能。</p>
              <p>
                <a href="/settings">前往设置</a>
              </p>
            </div>
          }
          type="info"
          showIcon
          icon={<EnvironmentOutlined />}
        />
      </Card>
    );
  }

  return (
    <Card title="地图" bodyStyle={{ padding: 0 }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: `${height}px`,
          background: '#f0f2f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty
          description={`地图加载中... (${destination})`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    </Card>
  );
};

export default MapView;

