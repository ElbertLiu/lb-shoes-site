import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Upload } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
}

const initialBanners: Banner[] = [
  { id: 'b1', title: 'Summer Sale 2026', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', link: '/products?category=c1', active: true },
  { id: 'b2', title: 'New Arrivals', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', link: '/products?category=c2', active: true }
];

export default function AdminBanner() {
  const [bannerList, setBannerList] = useState<Banner[]>(initialBanners);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Banner>>({
    id: '', title: '', image: '', link: '', active: true
  });

  const handleDelete = (id: string) => {
    if (confirm('确认删除该轮播图吗？')) {
      setBannerList(prev => prev.filter(b => b.id !== id));
      toast.success('删除成功');
    }
  };

  const handleToggleActive = (id: string) => {
    setBannerList(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success('状态已更新');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('请填写标题');
      return;
    }
    const newId = formData.id || `b${Date.now()}`;
    const newBanner = { 
      id: newId, 
      title: formData.title as string, 
      image: formData.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 
      link: formData.link || '', 
      active: formData.active ?? true 
    };

    if (formData.id) {
      setBannerList(bannerList.map(b => b.id === formData.id ? newBanner : b));
    } else {
      setBannerList([...bannerList, newBanner]);
    }
    setShowForm(false);
    toast.success('保存成功');
    setFormData({ id: '', title: '', image: '', link: '', active: true });
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-md shadow-sm border border-[#ebeef5]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-[#ebeef5] gap-4">
          <div className="font-medium text-[#303133]">轮播图管理</div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => { setFormData({ id: '', title: '', image: '', link: '', active: true }); setShowForm(true); }}
              className="flex items-center px-4 py-1.5 bg-[#409eff] hover:bg-[#66b1ff] text-white text-sm rounded transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> 新增轮播图
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#dcdfe6]">
                <h3 className="text-base font-medium text-[#303133]">{formData.id ? '编辑轮播图' : '新增轮播图'}</h3>
                <button onClick={() => setShowForm(false)} className="text-[#909399] hover:text-[#409eff]">✕</button>
              </div>
              <div className="overflow-y-auto p-5">
                <form id="bannerForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">标题 <span className="text-[#f56c6c]">*</span></label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                      placeholder="请输入轮播图标题"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">跳转链接</label>
                    <input 
                      type="text"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                      placeholder="例如: /products?category=c1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">状态</label>
                    <div className="flex items-center gap-4 py-1">
                      <label className="flex items-center text-sm text-[#606266] cursor-pointer">
                        <input type="radio" checked={formData.active} onChange={() => setFormData({...formData, active: true})} className="mr-2" /> 启用
                      </label>
                      <label className="flex items-center text-sm text-[#606266] cursor-pointer">
                        <input type="radio" checked={!formData.active} onChange={() => setFormData({...formData, active: false})} className="mr-2" /> 禁用
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">图片</label>
                    <div className="w-full h-32 border border-dashed border-[#c0c4cc] rounded flex flex-col items-center justify-center text-[#909399] hover:border-[#409eff] cursor-pointer bg-[#fafafa]">
                      <Upload className="w-5 h-5 mb-1 text-[#c0c4cc]" />
                      <span className="text-xs">点击上传 (建议尺寸 1920x600)</span>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-4 border-t border-[#dcdfe6] flex justify-end gap-3 bg-[#f5f7fa] rounded-b">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border border-[#dcdfe6] bg-white text-[#606266] rounded hover:text-[#409eff] hover:border-[#c6e2ff] hover:bg-[#ecf5ff] transition-colors">
                  取消
                </button>
                <button type="submit" form="bannerForm" className="px-4 py-1.5 text-sm bg-[#409eff] hover:bg-[#66b1ff] text-white rounded transition-colors">
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-[#606266]">
            <thead className="bg-[#f5f7fa] text-[#909399] font-medium border-b border-[#ebeef5]">
              <tr>
                <th className="px-5 py-3 w-32">图片</th>
                <th className="px-5 py-3">标题</th>
                <th className="px-5 py-3">跳转链接</th>
                <th className="px-5 py-3 w-24">状态</th>
                <th className="px-5 py-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {bannerList.map((n, i) => (
                <tr key={n.id} className="border-b border-[#ebeef5] hover:bg-[#f5f7fa] transition-colors">
                  <td className="px-5 py-3">
                    <img src={n.image} alt={n.title} className="w-20 h-10 object-cover rounded bg-[#ebeef5]" />
                  </td>
                  <td className="px-5 py-3 font-medium text-[#303133]">{n.title}</td>
                  <td className="px-5 py-3">{n.link || '--'}</td>
                  <td className="px-5 py-3">
                    <button 
                      onClick={() => handleToggleActive(n.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border transition-colors ${n.active ? 'bg-[#f0f9eb] text-[#67c23a] border-[#e1f3d8]' : 'bg-[#f4f4f5] text-[#909399] border-[#e9e9eb]'}`}
                    >
                      {n.active ? '已启用' : '已禁用'}
                    </button>
                  </td>
                  <td className="px-5 py-3 flex items-center justify-center gap-2">
                    <button onClick={() => { setFormData({ id: n.id, title: n.title, image: n.image, link: n.link, active: n.active }); setShowForm(true); }} className="p-1.5 text-[#409eff] hover:bg-[#ecf5ff] rounded transition-colors" title="编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[#f56c6c] hover:bg-[#fef0f0] rounded transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {bannerList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#909399]">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination minimal */}
        <div className="p-4 flex items-center justify-end text-sm text-[#606266] border-t border-[#ebeef5]">
          共 {bannerList.length} 条
        </div>
      </div>
    </AdminLayout>
  );
}
