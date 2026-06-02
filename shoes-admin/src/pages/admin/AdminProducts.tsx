import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Upload } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { products, categories as initialCats } from '../../data';
import { Product } from '../../types';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [productList, setProductList] = useState<Product[]>(products.slice(0, 20));
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '', name: '', brief: '', price: '', category: initialCats[0].name, inStock: true, images: []
  });

  const handleDelete = (id: string) => {
    if (confirm('确认删除该产品吗？')) {
      setProductList(prev => prev.filter(p => p.id !== id));
      toast.success('删除成功');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      toast.error('请填写必填项');
      return;
    }
    setProductList([{ ...(formData as Product), images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'] }, ...productList]);
    setShowForm(false);
    toast.success('保存成功');
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-md shadow-sm border border-[#ebeef5]">
        {/* Toolbar - Element Plus Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-[#ebeef5] gap-4">
          <div className="font-medium text-[#303133]">产品管理</div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="请输入产品名称或货号" 
                className="w-full pl-3 pr-8 py-1.5 text-sm rounded border border-[#dcdfe6] focus:border-[#409eff] focus:outline-none transition-colors text-[#606266]"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#c0c4cc]" />
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-1.5 bg-[#409eff] hover:bg-[#66b1ff] text-white text-sm rounded transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> 新增产品
            </button>
          </div>
        </div>

        {/* Form Modal (Element Plus Dialog style) */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#dcdfe6]">
                <h3 className="text-base font-medium text-[#303133]">新增产品</h3>
                <button onClick={() => setShowForm(false)} className="text-[#909399] hover:text-[#409eff]">✕</button>
              </div>
              <div className="overflow-y-auto p-5">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm text-[#606266]">货号 <span className="text-[#f56c6c]">*</span></label>
                      <input 
                        type="text" 
                        value={formData.id}
                        onChange={e => setFormData({...formData, id: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                        placeholder="例如: SHOE-10020"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm text-[#606266]">产品名称 <span className="text-[#f56c6c]">*</span></label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                        placeholder="请输入名称"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm text-[#606266]">分类 <span className="text-[#f56c6c]">*</span></label>
                      <select 
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none bg-white"
                      >
                        {initialCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm text-[#606266]">参考价格 <span className="text-[#f56c6c]">*</span></label>
                      <input 
                        type="text"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                        placeholder="例如: $15.00 - $30.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">产品简介</label>
                    <textarea 
                      rows={3}
                      value={formData.brief}
                      onChange={e => setFormData({...formData, brief: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none resize-none" 
                      placeholder="简短的产品介绍"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">现货状态</label>
                    <div className="flex items-center gap-4 py-1">
                      <label className="flex items-center text-sm text-[#606266] cursor-pointer">
                        <input type="radio" checked={formData.inStock} onChange={() => setFormData({...formData, inStock: true})} className="mr-2" /> 现货充足
                      </label>
                      <label className="flex items-center text-sm text-[#606266] cursor-pointer">
                        <input type="radio" checked={!formData.inStock} onChange={() => setFormData({...formData, inStock: false})} className="mr-2" /> 需定做
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">产品图片</label>
                    <div className="w-24 h-24 border border-dashed border-[#c0c4cc] rounded flex flex-col items-center justify-center text-[#909399] hover:border-[#409eff] cursor-pointer bg-[#fafafa]">
                      <Upload className="w-5 h-5 mb-1 text-[#c0c4cc]" />
                      <span className="text-xs">点击上传</span>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-4 border-t border-[#dcdfe6] flex justify-end gap-3 bg-[#f5f7fa] rounded-b">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border border-[#dcdfe6] bg-white text-[#606266] rounded hover:text-[#409eff] hover:border-[#c6e2ff] hover:bg-[#ecf5ff] transition-colors">
                  取消
                </button>
                <button type="submit" form="productForm" className="px-4 py-1.5 text-sm bg-[#409eff] hover:bg-[#66b1ff] text-white rounded transition-colors">
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table - Element Plus Style */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-[#606266]">
            <thead className="bg-[#f5f7fa] text-[#909399] font-medium border-b border-[#ebeef5]">
              <tr>
                <th className="px-5 py-3 w-16">首图</th>
                <th className="px-5 py-3">货号</th>
                <th className="px-5 py-3">名称</th>
                <th className="px-5 py-3">分类</th>
                <th className="px-5 py-3">价格</th>
                <th className="px-5 py-3">状态</th>
                <th className="px-5 py-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((n, i) => (
                <tr key={n.id} className="border-b border-[#ebeef5] hover:bg-[#f5f7fa] transition-colors">
                  <td className="px-5 py-3">
                    <img src={n.images[0]} className="w-10 h-10 object-cover rounded bg-[#ebeef5]" alt="" />
                  </td>
                  <td className="px-5 py-3 font-mono text-[#303133]">{n.id}</td>
                  <td className="px-5 py-3 truncate max-w-[150px]" title={n.name}>{n.name}</td>
                  <td className="px-5 py-3">{n.category}</td>
                  <td className="px-5 py-3">{n.price}</td>
                  <td className="px-5 py-3">
                    {n.inStock ? 
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0f9eb] text-[#67c23a] border border-[#e1f3d8]">现货</span> : 
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fdf6ec] text-[#e6a23c] border border-[#faecd8]">定做</span>
                    }
                  </td>
                  <td className="px-5 py-3 flex items-center justify-center gap-2">
                    <button className="p-1.5 text-[#409eff] hover:bg-[#ecf5ff] rounded transition-colors" title="编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[#f56c6c] hover:bg-[#fef0f0] rounded transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination minimal */}
        <div className="p-4 flex items-center justify-end text-sm text-[#606266] border-t border-[#ebeef5]">
          共 {products.length} 条
        </div>
      </div>
    </AdminLayout>
  );
}
