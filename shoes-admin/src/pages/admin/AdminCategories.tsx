import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Upload } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { categories as initialCats } from '../../data';
import { Category } from '../../types';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categoryList, setCategoryList] = useState<Category[]>(initialCats);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Category>>({
    id: '', name: ''
  });

  const handleDelete = (id: string) => {
    if (confirm('确认删除该分类吗？')) {
      setCategoryList(prev => prev.filter(c => c.id !== id));
      toast.success('删除成功');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('请填写分类名称');
      return;
    }
    const newId = formData.id || `c${Date.now()}`;
    setCategoryList([...categoryList, { id: newId, name: formData.name as string }]);
    setShowForm(false);
    toast.success('保存成功');
    setFormData({ id: '', name: '' });
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-md shadow-sm border border-[#ebeef5]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-[#ebeef5] gap-4">
          <div className="font-medium text-[#303133]">分类管理</div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="请输入分类名称" 
                className="w-full pl-3 pr-8 py-1.5 text-sm rounded border border-[#dcdfe6] focus:border-[#409eff] focus:outline-none transition-colors text-[#606266]"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#c0c4cc]" />
            </div>
            <button 
              onClick={() => { setFormData({ id: '', name: '' }); setShowForm(true); }}
              className="flex items-center px-4 py-1.5 bg-[#409eff] hover:bg-[#66b1ff] text-white text-sm rounded transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> 新增分类
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#dcdfe6]">
                <h3 className="text-base font-medium text-[#303133]">{formData.id ? '编辑分类' : '新增分类'}</h3>
                <button onClick={() => setShowForm(false)} className="text-[#909399] hover:text-[#409eff]">✕</button>
              </div>
              <div className="overflow-y-auto p-5">
                <form id="categoryForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#606266]">分类名称 <span className="text-[#f56c6c]">*</span></label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdfe6] rounded focus:border-[#409eff] focus:outline-none" 
                      placeholder="请输入分类名称"
                    />
                  </div>
                </form>
              </div>
              <div className="p-4 border-t border-[#dcdfe6] flex justify-end gap-3 bg-[#f5f7fa] rounded-b">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border border-[#dcdfe6] bg-white text-[#606266] rounded hover:text-[#409eff] hover:border-[#c6e2ff] hover:bg-[#ecf5ff] transition-colors">
                  取消
                </button>
                <button type="submit" form="categoryForm" className="px-4 py-1.5 text-sm bg-[#409eff] hover:bg-[#66b1ff] text-white rounded transition-colors">
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
                <th className="px-5 py-3 w-24">ID</th>
                <th className="px-5 py-3">分类名称</th>
                <th className="px-5 py-3 w-32">商品数量</th>
                <th className="px-5 py-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map((n, i) => (
                <tr key={n.id} className="border-b border-[#ebeef5] hover:bg-[#f5f7fa] transition-colors">
                  <td className="px-5 py-3">{n.id}</td>
                  <td className="px-5 py-3 font-medium text-[#303133]">{n.name}</td>
                  <td className="px-5 py-3 text-[#909399]">--</td>
                  <td className="px-5 py-3 flex items-center justify-center gap-2">
                    <button onClick={() => { setFormData({ id: n.id, name: n.name }); setShowForm(true); }} className="p-1.5 text-[#409eff] hover:bg-[#ecf5ff] rounded transition-colors" title="编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[#f56c6c] hover:bg-[#fef0f0] rounded transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {categoryList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#909399]">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination minimal */}
        <div className="p-4 flex items-center justify-end text-sm text-[#606266] border-t border-[#ebeef5]">
          共 {categoryList.length} 条
        </div>
      </div>
    </AdminLayout>
  );
}
