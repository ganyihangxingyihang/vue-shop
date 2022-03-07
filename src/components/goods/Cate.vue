<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- //栅格 添加分类按钮 -->
      <el-row :gutter="20">
        <el-col :span="24"><el-button class="addbutton" type="primary" @click="showaddCateDialog">添加分类</el-button></el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="categoriesList" :columns="this.columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="status" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <div class="page">
        <el-pagination @current-change="handleCurrentChange" :current-page="querycategoriesInfo.pagenum" :page-size="querycategoriesInfo.pagesize" layout="total, prev, pager, next, jumper" :total="this.total"> </el-pagination>
      </div>
    </el-card>
    <!-- 添加分类dialog对话框 -->
    <el-dialog title="提示" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="90px" :rules="addCateFormrules">
        <!-- prop是表单验证所需要的，表示需要验证的属性 -->
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- //级联选择器 -->
        <!-- props用来指定配置对象 -->
        <el-form-item label="父级分类:">
          <el-cascader :options="CategoriesList12" v-model="selectKeys" :props="cascaderProps" @change="handleChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类dialog对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editCateFormRef" :model="editCateForm" label-width="90px" :rules="addCateFormrules">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCategoriesList()
  },
  data() {
    return {
      // 存储商品分类列表
      categoriesList: [],
      //请求商品分类数组时的请求参数
      querycategoriesInfo: {
        pagenum: 1,
        pagesize: 5
      },
      // 总的数据条数
      total: 0,
      //tree-table的colums属性
      columns: [
        {
          label: '名称分类',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'status'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      //控制添加分类dialog对话框
      addCateDialogVisible: false,
      //保存添加分类表单信息
      addCateForm: {
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        //分类层级
        cat_level: 0
      },
      //一二级分类列表，供级联选择框渲染
      CategoriesList12: [],
      //添加分类表单校验规则
      addCateFormrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      //级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cate_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //级联选择器选中的父级分类的id数组
      selectKeys: [],
      //编辑分类对话框显示和隐藏
      editDialogVisible: false,
      //存储编辑分类表单数据
      editCateForm: {
        cat_name: '',
        cat_id: 0
      }
    }
  },
  methods: {
    //获取商品分类列表
    async getCategoriesList() {
      const { data: res } = await this.$http.get('categories', { params: this.querycategoriesInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品类别失败')
      }
      console.log(res)
      this.categoriesList = res.data.result
      this.total = res.data.total
    },
    //修改当前页
    handleCurrentChange(currentpage) {
      this.querycategoriesInfo.pagenum = currentpage
      this.getCategoriesList()
    },
    //点击按钮添加分类
    showaddCateDialog() {
      //获取级联选择器需要的数据
      this.getCategoriesList12()
      this.addCateDialogVisible = true
    },
    //获取1，2级父级分类，供级联选择框渲染
    async getCategoriesList12() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品类别失败')
      }
      console.log(res)
      this.CategoriesList12 = res.data
    },
    //选择项发生变化触发
    handleChange() {
      // 判断是否选中父级分类
      if (this.selectKeys.length > 0) {
        // 拿到父级分类的id和商品登记
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定按钮，添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.getCategoriesList()
        this.addCateDialogVisible = false
      })
    },
    // 监听dialog对话框关闭事件，清空form表单内容
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = ''
      this.addCateForm.cat_level = ''
    },
    //点击编辑按钮事件
    async editCate(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateForm.cat_id = res.data.cat_id
      this.editDialogVisible = true
    },
    //编辑dialog对话框---点击确定按钮，提交编辑信息
    async confirmEditCate() {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
      if (res.meta.status !== 200) return this.$message.error('编辑失败')
      this.$message.success('编辑成功')
      this.getCategoriesList()
      this.editDialogVisible = false
    },
    //点击删除按钮删除分类
    async deleteCate(id) {
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCategoriesList()
    }
  }
}
</script>

<style scoped>
.addbutton {
  margin-bottom: 20px;
}
</style>
