import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Alert } from 'antd';
import { apiConfigService } from '../services/apiConfigService';

const { Title, Paragraph } = Typography;

// 百度地图类型声明
declare const BMap: any;
declare const BMAP_STATUS_SUCCESS: any;

interface MapViewProps {
  destination: string;
}

const MapView: React.FC<MapViewProps> = ({ destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      setLoading(true);
      const config = await apiConfigService.get();
      if (config.amapKey || config.baiduMapKey) {
        setHasApiKey(true);
        loadMap(config.amapKey || config.baiduMapKey || '', config.amapKey ? 'amap' : 'baidu');
      } else {
        setError('未配置地图 API Key');
        setLoading(false);
      }
    } catch (error) {
      console.error('检查 API Key 失败:', error);
      setError('检查 API Key 失败');
      setLoading(false);
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
        if (!mapRef.current) return;
        try {
          setLoading(false); // 脚本加载完成，设置加载完成
          
          // @ts-ignore
          const map = new AMap.Map(mapRef.current, {
            zoom: 13,
            center: [116.397428, 39.90923], // 默认北京
          });

          // 搜索目的地并定位
          // @ts-ignore
          AMap.plugin('AMap.Geocoder', () => {
            // @ts-ignore
            const geocoder = new AMap.Geocoder();
            geocoder.getLocation(destination, (status: string, result: any) => {
              if (status === 'complete' && result.info === 'OK') {
                const location = result.geocodes[0].location;
                map.setCenter(location);
                // @ts-ignore
                new AMap.Marker({
                  position: location,
                  map: map,
                  title: destination
                });
              } else {
                console.warn('地理编码失败，使用默认位置');
              }
            });
          });
        } catch (err) {
          console.error('地图加载失败:', err);
          setError('地图加载失败');
          setLoading(false);
        }
      };
      script.onerror = () => {
        setError('地图脚本加载失败');
        setLoading(false);
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
        try {
          setLoading(false); // 脚本加载完成，设置加载完成
          
          // @ts-ignore
          const map = new BMap.Map(mapRef.current);
          map.enableScrollWheelZoom(true);
          
          // 地理编码
          // @ts-ignore
          const geocoder = new BMap.Geocoder();
          geocoder.getPoint(destination, (point: any) => {
            if (point) {
              map.centerAndZoom(point, 13);
              // @ts-ignore
              const marker = new BMap.Marker(point);
              map.addOverlay(marker);
              // @ts-ignore
              marker.setTitle(destination);
            } else {
              console.warn('百度地图地理编码失败，使用默认位置');
              // 使用默认位置（北京）
              // @ts-ignore
              const defaultPoint = new BMap.Point(116.404, 39.915);
              map.centerAndZoom(defaultPoint, 13);
            }
          }, destination);
        } catch (err) {
          console.error('百度地图加载失败:', err);
          setError('地图加载失败');
          setLoading(false);
        }
      };
      script.onerror = () => {
        setError('地图脚本加载失败');
        setLoading(false);
      };
      document.head.appendChild(script);
    }
  };

  // 显示错误信息
  if (error) {
    return (
      <Card>
        <Alert
          message="地图加载失败"
          description={error}
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  // 显示未配置 API Key 提示
  if (!loading && !hasApiKey) {
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

  // 地图加载中或已加载
  return (
    <Card>
      <Title level={4}>目的地：{destination}</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>地图功能正在开发中...</p>
          <p style={{ color: '#999', fontSize: '14px' }}>
            提示：地图 API 需要完整的 SDK 集成，当前版本已预留接口
          </p>
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '500px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        />
      )}
    </Card>
  );
};

export default MapView;
