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
      console.log('开始检查地图 API Key...');
      const config = await apiConfigService.get();
      console.log('API 配置:', {
        hasAmapKey: !!config.amapKey,
        hasBaiduKey: !!config.baiduMapKey,
        amapKeyLength: config.amapKey?.length || 0,
        baiduKeyLength: config.baiduMapKey?.length || 0,
      });
      
      if (config.amapKey || config.baiduMapKey) {
        setHasApiKey(true);
        const provider = config.amapKey ? 'amap' : 'baidu';
        const apiKey = config.amapKey || config.baiduMapKey || '';
        console.log(`使用 ${provider} 地图，API Key: ${apiKey.substring(0, 10)}...`);
        loadMap(apiKey, provider);
      } else {
        console.warn('未配置地图 API Key');
        setError('未配置地图 API Key，请在设置页面配置');
        setLoading(false);
      }
    } catch (error) {
      console.error('检查 API Key 失败:', error);
      setError('检查 API Key 失败: ' + (error as Error).message);
      setLoading(false);
    }
  };

  const loadMap = (apiKey: string, provider: 'amap' | 'baidu') => {
    if (!mapRef.current) {
      console.error('地图容器不存在');
      setError('地图容器不存在');
      setLoading(false);
      return;
    }

    console.log(`开始加载 ${provider} 地图，目的地: ${destination}`);

    if (provider === 'amap') {
      // 检查是否已经加载过高德地图脚本
      if ((window as any).AMap) {
        console.log('高德地图脚本已存在，直接初始化');
        initializeAmapMap(apiKey);
        return;
      }

      // 高德地图
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
      script.async = true;
      
      script.onload = () => {
        console.log('高德地图脚本加载成功');
        if (!mapRef.current) {
          console.error('地图容器在脚本加载后不存在');
          setError('地图容器不存在');
          setLoading(false);
          return;
        }
        initializeAmapMap(apiKey);
      };
      
      script.onerror = (err) => {
        console.error('高德地图脚本加载失败:', err);
        setError('地图脚本加载失败，请检查网络连接或 API Key 是否正确');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    } else {
      // 百度地图逻辑保持不变
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}&callback=initBaiduMap`;
      script.async = true;
      
      // @ts-ignore
      window.initBaiduMap = () => {
        console.log('百度地图脚本加载成功');
        if (!mapRef.current) return;
        try {
          setLoading(false);
          
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
              // @ts-ignore
              const defaultPoint = new BMap.Point(116.404, 39.915);
              map.centerAndZoom(defaultPoint, 13);
            }
          }, destination);
        } catch (err) {
          console.error('百度地图加载失败:', err);
          setError('地图加载失败: ' + (err as Error).message);
          setLoading(false);
        }
      };
      
      script.onerror = () => {
        console.error('百度地图脚本加载失败');
        setError('地图脚本加载失败');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    }
  };

  // 初始化高德地图的辅助函数
  const initializeAmapMap = (_apiKey: string) => {
    if (!mapRef.current) return;
    
    try {
      setLoading(false);
      console.log('初始化高德地图...');
      
      // @ts-ignore
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center: [116.397428, 39.90923], // 默认北京
      });

      console.log('高德地图对象创建成功');

      // 搜索目的地并定位
      // @ts-ignore
      AMap.plugin('AMap.Geocoder', () => {
        console.log('高德地图 Geocoder 插件加载成功');
        // @ts-ignore
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(destination, (status: string, result: any) => {
          console.log('地理编码结果:', { status, result: result?.info });
          if (status === 'complete' && result.info === 'OK') {
            const location = result.geocodes[0].location;
            console.log('目的地坐标:', location);
            map.setCenter(location);
            // @ts-ignore
            new AMap.Marker({
              position: location,
              map: map,
              title: destination
            });
            console.log('地图标记已添加');
          } else {
            console.warn('地理编码失败，使用默认位置', result);
            // 即使地理编码失败，也显示地图（使用默认位置）
          }
        });
      });
    } catch (err) {
      console.error('地图初始化失败:', err);
      setError('地图初始化失败: ' + (err as Error).message);
      setLoading(false);
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
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          backgroundColor: loading ? '#f5f5f5' : 'transparent',
          position: 'relative',
        }}
      >
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999'
          }}>
            <p>正在加载地图...</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              请稍候
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MapView;
