import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Alert } from 'antd';
import { apiConfigService } from '../services/apiConfigService';

const { Title, Paragraph } = Typography;

interface MapViewProps {
  destination: string;
}

const MapView: React.FC<MapViewProps> = ({ destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const config = await apiConfigService.get();
      if (config.amapKey || config.baiduMapKey) {
        setHasApiKey(true);
        loadMap(config.amapKey || config.baiduMapKey || '', config.amapKey ? 'amap' : 'baidu');
      }
    } catch (error) {
      console.error('检查 API Key 失败:', error);
    }
  };

  const loadMap = (apiKey: string, provider: 'amap' | 'baidu') => {
    if (!mapRef.current) return;

    if (provider === 'amap') {
      // 高德地图
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        const map = new AMap.Map(mapRef.current, {
          zoom: 13,
          center: [116.397428, 39.90923], // 默认北京，实际应通过地理编码获取目的地坐标
        });

        // 搜索目的地
        // @ts-ignore
        AMap.plugin('AMap.PlaceSearch', () => {
          // @ts-ignore
          const placeSearch = new AMap.PlaceSearch({
            map: map,
          });
          placeSearch.search(destination);
        });

        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      // 百度地图
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}&callback=initBaiduMap`;
      script.async = true;
      // @ts-ignore
      window.initBaiduMap = () => {
        if (!mapRef.current) return;
        // @ts-ignore
        const map = new BMap.Map(mapRef.current);
        const point = new BMap.Point(116.404, 39.915); // 默认北京
        map.centerAndZoom(point, 13);
        // 搜索目的地
        // @ts-ignore
        const local = new BMap.LocalSearch(map, {
          onSearchComplete: (results: any) => {
            if (local.getStatus() === BMAP_STATUS_SUCCESS) {
              const poi = results.getPoi(0);
              map.centerAndZoom(poi.point, 13);
            }
          },
        });
        local.search(destination);
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <Alert
          message="地图功能需要配置 API Key"
          description={
            <div>
              <Paragraph>
                请在 <a href="/settings">设置页面</a> 配置高德地图或百度地图的 API Key
              </Paragraph>
              <Paragraph type="secondary">
                高德地图：https://console.amap.com/ <br />
                百度地图：https://lbsyun.baidu.com/
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>目的地：{destination}</Title>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
        }}
      />
      {!mapLoaded && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          正在加载地图...
        </div>
      )}
    </Card>
  );
};

export default MapView;
