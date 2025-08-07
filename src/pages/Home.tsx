import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// 表单验证schema
const formSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(10, '姓名最多10个字符'),
  gender: z.enum(['male', 'female', 'other'], { required_error: '请选择性别' }),
  age: z.number().min(18, '年龄必须大于18岁').max(60, '年龄不能超过60岁'),
  height: z.number().min(140, '身高至少140cm').max(220, '身高不能超过220cm'),
  weight: z.number().min(40, '体重至少40kg').max(150, '体重不能超过150kg'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  education: z.enum(['highSchool', 'college', 'bachelor', 'master', 'doctor'], { required_error: '请选择学历' }),
  occupation: z.string().min(2, '职业至少2个字符').max(20, '职业最多20个字符'),
  income: z.enum(['below5k', '5k-10k', '10k-20k', '20k-30k', '30k-50k', 'above50k'], { required_error: '请选择收入范围' }),
  marriageStatus: z.enum(['single', 'divorced', 'widowed'], { required_error: '请选择婚姻状况' }),
  acceptLongDistance: z.enum(['yes', 'no'], { required_error: '请选择是否接受异地' }),
  house: z.enum(['yes', 'no'], { required_error: '请选择是否有房' }),
  car: z.enum(['yes', 'no'], { required_error: '请选择是否有车' }),
  location: z.string().min(2, '请输入所在城市').max(20, '城市名称最多20个字符'),
  description: z.string().min(10, '个人描述至少10个字符').max(300, '个人描述最多300个字符'),
  partnerRequirements: z.string().min(10, '择偶要求至少10个字符').max(300, '择偶要求最多300个字符'),
});

type FormValues = z.infer<typeof formSchema>;

export default function MarriageRegistrationForm() {
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // 初始化表单
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
defaultValues: {
  name: '',
  gender: 'male',
  age: 25,
  height: 170,
  weight: 65,
  phone: '',
  education: 'bachelor',
  occupation: '',
  income: '10k-20k',
  marriageStatus: 'single',
  acceptLongDistance: 'yes',
  house: 'yes',
  car: 'yes',
  location: '',
  description: '',
  partnerRequirements: '',
}
  });

  // 表单提交处理
   const onSubmit = async (data: FormValues) => {
      try {
        // 验证图片是否已上传
        if (!selectedImage) {
          setImageError('请上传您的人像照片');
          setIsSubmitting(false);
          return;
        }
        
        setIsSubmitting(true);
        setFormData(data);
        setShowResult(true);
       
       // 自动保存到相册
       setTimeout(async () => {
         await saveToAlbum();
         document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
       }, 500);
       
       toast.success('信息已保存到相册，请发送给工作人员');
     } catch (error) {
       toast.error('保存失败，请重试');
     } finally {
       setIsSubmitting(false);
     }
   };

  // 保存到相册功能
  const saveToAlbum = async () => {
    if (!formData) return;
    
    try {
      const resultElement = document.getElementById('registration-result');
      if (!resultElement) {
        toast.error('找不到要保存的内容');
        return;
      }
      
      // 添加临时样式以确保截图质量
      resultElement.classList.add('p-6', 'bg-white');
      
      // 使用html2canvas将表单结果转换为图片
      const canvas = await html2canvas(resultElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // 移除临时样式
      resultElement.classList.remove('p-6', 'bg-white');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `和美缘婚恋登记-${formData.name}-${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('信息已保存到相册，请发送给工作人员');
    } catch (error) {
      toast.error('保存失败，请重试');
      console.error('保存失败:', error);
    }
  };

  // 重置表单
  const resetForm = () => {
    reset();
    setShowResult(false);
    setFormData(null);
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 格式化枚举值显示文本
  const formatEnumValue = (value: string, type: string): string => {
    const mappings: Record<string, Record<string, string>> = {
      gender: { male: '男', female: '女', other: '其他' },
      education: { 
        highSchool: '高中/中专', 
        college: '大专', 
        bachelor: '本科', 
        master: '硕士', 
        doctor: '博士' 
      },
      income: {
        below5k: '5k以下',
        '5k-10k': '5k-10k',
        '10k-20k': '10k-20k',
        '20k-30k': '20k-30k',
        '30k-50k': '30k-50k',
        above50k: '50k以上'
      },
      marriageStatus: { single: '未婚', divorced: '离异', widowed: '丧偶' }
    };
    
    return mappings[type]?.[value] || value;
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // 触发相机拍照
  const triggerCamera = () => {
    const cameraInput = document.getElementById('camera-input') as HTMLInputElement;
    cameraInput.click();
  };

  // 触发相册选择
  const triggerGallery = () => {
    const galleryInput = document.getElementById('gallery-input') as HTMLInputElement;
    galleryInput.click();
  };

   return (
      <div className="min-h-screen py-8 px-4 max-w-md mx-auto relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-50 via-white to-purple-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/4"></div>
      {/* 页面标题 */}
       <div className="mb-8">
        <h1 className="text-[clamp(1.8rem,5vw,2.5rem)] font-bold text-pink-600 mb-2">和美缘婚恋网</h1>
        <p className="text-gray-600">寻找您的理想伴侣，开启美好姻缘</p>
      </div>
      
      {/* 表单区域 */}
      <section id="form-section" className={`transition-all duration-500 ${showResult ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 transform transition-all hover:shadow-2xl border border-white/50">
           <h2 className="text-xl font-semibold text-gray-800 mb-6">个人信息登记表</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* 基本信息组 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 姓名 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">姓名 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的姓名"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              {/* 性别 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">性别 <span className="text-red-500">*</span></label>
                <div className="flex space-x-4">
                  {[
                    { value: 'male', label: '男' },
                    { value: 'female', label: '女' },
                    { value: 'other', label: '其他' }
                  ].map(option => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        {...register('gender')}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
              </div>
              
              {/* 年龄 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">年龄 <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  {...register('age', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的年龄"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
              </div>
              
              {/* 身高 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">身高(cm) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  {...register('height', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的身高"
                />
                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>}
              </div>
              
              {/* 体重 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">体重(kg) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  {...register('weight', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的体重"
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
              </div>
              
              {/* 电话 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">手机号码 <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的手机号码"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            
            {/* 详细信息组 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 学历 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">学历 <span className="text-red-500">*</span></label>
                <select 
                  {...register('education')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                >
                  <option value="" disabled selected>请选择学历</option>
                  <option value="highSchool">高中/中专</option>
                  <option value="college">大专</option>
                  <option value="bachelor">本科</option>
                  <option value="master">硕士</option>
                  <option value="doctor">博士</option>
                </select>
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>}
              </div>
              
              {/* 职业 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">职业 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  {...register('occupation')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  placeholder="请输入您的职业"
                />
                {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation.message}</p>}
              </div>
              
              {/* 收入 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">月收入 <span className="text-red-500">*</span></label>
                <select 
                  {...register('income')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                >
                  <option value="" disabled selected>请选择月收入范围</option>
                  <option value="below5k">5k以下</option>
                  <option value="5k-10k">5k-10k</option>
                  <option value="10k-20k">10k-20k</option>
                  <option value="20k-30k">20k-30k</option>
                  <option value="30k-50k">30k-50k</option>
                  <option value="above50k">50k以上</option>
                </select>
                {errors.income && <p className="text-red-500 text-xs mt-1">{errors.income.message}</p>}
              </div>
              
              {/* 婚姻状况 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">婚姻状况 <span className="text-red-500">*</span></label>
                <select 
                  {...register('marriageStatus')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                >
                  <option value="" disabled selected>请选择婚姻状况</option>
                  <option value="single">未婚</option>
                  <option value="divorced">离异</option>
                  <option value="widowed">丧偶</option>
                </select>
                {errors.marriageStatus && <p className="text-red-500 text-xs mt-1">{errors.marriageStatus.message}</p>}
              </div>
              
               {/* 可接受异地 */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">可接受异地吗？ <span className="text-red-500">*</span></label>
                 <div className="flex space-x-4">
                   {[
                     { value: 'yes', label: '是' },
                     { value: 'no', label: '否' }
                   ].map(option => (
                     <label key={option.value} className="inline-flex items-center">
                       <input
                         type="radio"
                         value={option.value}
                         {...register('acceptLongDistance')}
                         className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                       />
                        <span className="ml-2 text-base text-gray-700">{option.label}</span>
                     </label>
                   ))}
                 </div>
                 {errors.acceptLongDistance && <p className="text-red-500 text-xs mt-1">{errors.acceptLongDistance.message}</p>}
                </div>
                
                {/* 有房吗 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">有房吗？ <span className="text-red-500">*</span></label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'yes', label: '有' },
                      { value: 'no', label: '无' }
                    ].map(option => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          {...register('house')}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                        />
                        <span className="ml-2 text-base text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.house && <p className="text-red-500 text-xs mt-1">{errors.house.message}</p>}
                </div>
                
                {/* 有车吗 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">有车吗？ <span className="text-red-500">*</span></label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'yes', label: '有' },
                      { value: 'no', label: '无' }
                    ].map(option => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          {...register('car')}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                        />
                        <span className="ml-2 text-base text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.car && <p className="text-red-500 text-xs mt-1">{errors.car.message}</p>}
                </div>
                
                {/* 所在地 */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">所在城市 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    {...register('location')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="请输入您所在的城市"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                 </div>
               </div>

             {/* 人像照片上传 */}
             <div className="space-y-4 mt-6">
                <label className="block text-sm font-medium text-gray-700">人像自拍 <span className="text-red-500">*</span></label>
               
               {/* 图片预览区域 */}
               <div className="flex justify-center">
                 <div className={`w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                   selectedImage ? 'border-green-500' : 'border-gray-300 hover:border-pink-500'
                 }`}>
                   {selectedImage ? (
                     <img 
                       src={selectedImage} 
                       alt="预览" 
                       className="w-full h-full object-cover rounded-md"
                     />
                   ) : (
                     <div className="text-center text-gray-500">
                       <i className="fa fa-user-circle text-4xl mb-2 block"></i>
                       <span className="text-sm">点击下方按钮上传照片</span>
                     </div>
                   )}
                 </div>
               </div>
               
               {/* 错误提示 */}
               {imageError && (
                 <p className="text-red-500 text-xs text-center mt-1">{imageError}</p>
               )}
               
               {/* 操作按钮 */}
               <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={triggerCamera}
                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                 >
                   <i className="fa fa-camera mr-2"></i> 拍照
                 </button>
                 <button
                   type="button"
                   onClick={triggerGallery}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                 >
                   <i className="fa fa-image mr-2"></i> 相册选择
                 </button>
               </div>
               
               {/* 隐藏的文件输入 */}
               <input
                 id="camera-input"
                 type="file"
                 accept="image/*"
                 capture="environment"
                 onChange={handleImageUpload}
                 className="hidden"
               />
               <input
                 id="gallery-input"
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                 className="hidden"
               />
             </div>
            
            {/* 个人描述和择偶要求 */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">个人描述 <span className="text-red-500">*</span></label>
                <textarea 
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none"
                  placeholder="请简要描述您的性格、爱好、生活习惯等（10-300字）"
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">择偶要求 <span className="text-red-500">*</span></label>
                <textarea 
                  {...register('partnerRequirements')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none"
                  placeholder="请描述您对理想伴侣的要求（10-300字）"
                ></textarea>
                {errors.partnerRequirements && <p className="text-red-500 text-xs mt-1">{errors.partnerRequirements.message}</p>}
              </div>
            </div>
            
            {/* 提交按钮 */}
             <div className="pt-4">
               {/* 工作人员微信二维码 */}
               <div className="mb-4 flex justify-center">
                 <div className="relative">
                   <img 
                     src="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=WeChat%20QR%20code%20for%20marriage%20consultant&sign=52f95e3c240a92494d7e7f74fb7365f4" 
                     alt="工作人员微信二维码" 
                      className="w-56 h-56 object-cover rounded-lg shadow-md"
                   />
                         <div className="absolute -bottom-2 left-0 right-0 flex justify-center text-center text-lg font-bold text-red-600 whitespace-nowrap">添加工作人员微信 下方保存图片发送
               </div>
              </div>
              
             </div>
               
               {/* 保存照片按钮 */}
               <button
                 onClick={handleSubmit(onSubmit)}
                 disabled={isSubmitting}
                 className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
               >
                 {isSubmitting ? (
                   <>
                     <i className="fa fa-spinner fa-spin mr-2"></i> 处理中...
                   </>
                 ) : (
                   <>
                     <i className="fa fa-download mr-2"></i> 保存登记信息
                   </>
                 )}
               </button>
             </div>
          </form>
        </div>
      </section>
      
      {/* 结果展示区域 */}
      <section 
        id="result-section" 
        className={`transition-all duration-500 ${showResult ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
      >
         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8 overflow-hidden border border-white/50">
           <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4">
            <h2 className="text-xl font-bold">和美缘婚恋登记信息</h2>
            <p className="text-sm opacity-90 mt-1">请保存此信息并发送给工作人员</p>
          </div>
          
          <div id="registration-result" className="p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
               <div className="text-center">
                 <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-pink-200">
                   {selectedImage ? (
                     <img 
                       src={selectedImage} 
                       alt="用户头像" 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                       <i className="fa fa-user text-3xl text-gray-400"></i>
                     </div>
                   )}
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800">{formData?.name}</h3>
                 <p className="text-gray-500 mt-1">{formatEnumValue(formData?.gender || '', 'gender')} | {formData?.age}岁 | {formData?.location}</p>
              </div>
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-3xl">
                <i className="fa fa-user"></i>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">身高/体重</p>
                <p className="font-medium">{formData?.height}cm / {formData?.weight}kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">手机号码</p>
                <p className="font-medium">{formData?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">学历</p>
                <p className="font-medium">{formData && formatEnumValue(formData.education, 'education')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">职业</p>
                <p className="font-medium">{formData?.occupation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">月收入</p>
                <p className="font-medium">{formData && formatEnumValue(formData.income, 'income')}</p>
              </div>
               <div>
                 <p className="text-sm text-gray-500">婚姻状况</p>
                 <p className="font-medium">{formData && formatEnumValue(formData.marriageStatus, 'marriageStatus')}</p>
               </div>
                <div>
                  <p className="text-sm text-gray-500">可接受异地</p>
                  <p className="font-medium">{formData?.acceptLongDistance === 'yes' ? '是' : '否'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">有房吗</p>
                  <p className="font-medium">{formData?.house === 'yes' ? '有' : '无'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">有车吗</p>
                  <p className="font-medium">{formData?.car === 'yes' ? '有' : '无'}</p>
                </div>
             </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">个人描述</p>
              <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg">{formData?.description}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">择偶要求</p>
              <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg">{formData?.partnerRequirements}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
              登记日期: {new Date().toLocaleString()}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 flex space-x-3">
            <button
              onClick={saveToAlbum}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
            >
              <i className="fa fa-download mr-2"></i> 保存到相册
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
            >
              <i className="fa fa-refresh mr-2"></i> 重新填写
            </button>
          </div>
        </div>
        
        {/* 工作人员联系区域 */}
         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/50">
           <h3 className="text-lg font-bold text-gray-800 mb-4">联系工作人员</h3>
          
          <div className="flex flex-col items-center justify-center">
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=WeChat%20QR%20code%20for%20marriage%20consultant&sign=52f95e3c240a92494d7e7f74fb7365f4" 
                alt="工作人员微信二维码" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <p className="text-gray-700 font-medium mb-1">和美缘婚恋顾问</p>
            <p className="text-gray-500 text-sm mb-4">wechat: hemeiyuan001</p>
            
            <a
              href="weixin://dl/business/?t=xxxxxx"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center"
            >
              <i className="fa fa-weixin mr-2"></i> 打开微信添加
            </a>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg w-full">
              <p className="text-sm text-yellow-800 flex items-start">
                <i className="fa fa-exclamation-circle mt-1 mr-2 text-yellow-500"></i>
                <span>请保存您的登记信息图片并发送给工作人员，我们将为您提供专业的婚恋咨询服务。</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 页脚提示 */}
        <div className="text-xs text-gray-500 mt-8 pb-4">
         <p>和美缘婚恋网 © {new Date().getFullYear()} 版权所有</p>
         <p className="mt-1">请填写真实信息，以便我们为您匹配最合适的伴侣</p>
      </div>
    </div>
  );
}