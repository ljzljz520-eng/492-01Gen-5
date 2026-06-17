import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Search,
  Store,
  MapPin,
  ChevronRight,
  X,
  Camera,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function InspectorScan() {
  const navigate = useNavigate();
  const { stalls } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const filteredStalls = stalls.filter((stall) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      stall.stallName.toLowerCase().includes(term) ||
      stall.stallNumber.toLowerCase().includes(term) ||
      stall.vendorName.toLowerCase().includes(term)
    );
  });

  const handleStartScan = () => {
    setShowScanAnimation(true);
    setScanResult(null);
    setTimeout(() => {
      const availableStalls = stalls.filter((s) => s.id !== scanResult);
      const pool = availableStalls.length > 0 ? availableStalls : stalls;
      const randomStall = pool[Math.floor(Math.random() * pool.length)];
      setScanResult(randomStall.id);
      setShowScanAnimation(false);
    }, 2000);
  };

  const handleViewStall = (stallId: string) => {
    navigate(`/inspector/stall/${stallId}`);
  };

  return (
    <SidebarLayout role="inspector">
      <div className="space-y-6">
        {/* 扫码区域 */}
        <div className="bg-gradient-to-b from-secondary-500 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full opacity-10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary-300 rounded-full opacity-10 blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold mb-2">扫码查验</h2>
            <p className="text-secondary-200 mb-6">
              扫描摊位二维码，快速查验证照合规性
            </p>

            {/* 扫码框 */}
            <div className="relative w-72 h-72 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-white/30 rounded-2xl" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-2xl" />

              {showScanAnimation && (
                <div className="absolute inset-4 overflow-hidden rounded-lg">
                  <div
                    className="w-full h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent absolute"
                    style={{
                      animation: 'scanLine 2s ease-in-out infinite',
                    }}
                  />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                {scanResult ? (
                  <div className="text-center animate-bounce-soft">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success-400 flex items-center justify-center">
                      <ScanLine className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-medium">扫描成功！</p>
                  </div>
                ) : showScanAnimation ? (
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-3 text-white/50 animate-pulse" />
                    <p className="text-white/70">正在识别...</p>
                  </div>
                ) : (
                  <ScanLine className="w-20 h-20 text-white/30" />
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStartScan}
                disabled={showScanAnimation}
                className={cn(
                  'px-8 py-3 rounded-xl font-medium transition-all',
                  showScanAnimation
                    ? 'bg-white/20 text-white/70 cursor-not-allowed'
                    : 'bg-white text-secondary-600 hover:bg-secondary-50 shadow-lg'
                )}
              >
                {showScanAnimation ? '扫描中...' : '开始扫码'}
              </button>
              <button
                onClick={() => {
                  setScanResult(null);
                  setSearchTerm('');
                }}
                className="px-6 py-3 rounded-xl font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                重置
              </button>
            </div>
          </div>

          <style>{`
            @keyframes scanLine {
              0%, 100% { top: 0%; }
              50% { top: 100%; }
            }
          `}</style>
        </div>

        {/* 扫码结果 */}
        {scanResult && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-secondary-500 text-lg">扫描结果</h3>
              <button
                onClick={() => setScanResult(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {(() => {
              const stall = stalls.find((s) => s.id === scanResult);
              if (!stall) return null;
              return (
                <div
                  className="p-4 bg-success-50 rounded-xl border border-success-100 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => handleViewStall(stall.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-success-100 flex items-center justify-center">
                        <Store className="w-7 h-7 text-success-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary-500">{stall.stallName}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {stall.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusTag status={stall.status} type="stall" />
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 搜索摊位 */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg mb-4">或手动搜索摊位</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="输入摊位名称、编号或摊主姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {filteredStalls.length > 0 ? (
              filteredStalls.map((stall) => (
                <div
                  key={stall.id}
                  onClick={() => handleViewStall(stall.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-500">{stall.stallName}</p>
                      <p className="text-sm text-gray-500">
                        {stall.stallNumber} · {stall.vendorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusTag status={stall.status} type="stall" size="sm" />
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>未找到相关摊位</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
