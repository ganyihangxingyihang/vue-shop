<template>
  <div class="params">
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 警告文本 -->
      <el-alert title="警告提示的文案" type="warning" :closable="false" show-icon=""> </el-alert>
      <!-- 级联选择器 -->
      <el-row class="cateselector">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader v-model="selectKeys" :options="this.CateList" :props="cascaderProps" @change="handleChange" :clearable="true"></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="btnDisabled" @click="showCommonDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <!-- 渲染展开行下的tag标签 -->
              <template v-slot="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                <!-- 添加tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index" width="40" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="550"> </el-table-column>
            <!-- 操作插槽 -->
            <el-table-column label="操作" width="650">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParams(scope.row.attr_id)"> 编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)"> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="btnDisabled" @click="showCommonDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <!-- 渲染展开行下的tag标签 -->
              <template v-slot="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable>{{ item }}</el-tag>
                <!-- 添加tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index" width="40" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称" width="550"> </el-table-column>
            <!-- 操作插槽 -->
            <el-table-column label="操作" width="650">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParams(scope.row.attr_id)"> 编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)"> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 公共可用的dialog对话框 -->
    <el-dialog :title="'添加' + this.dialogTitle" :visible.sync="commonDialogVisible" width="50%" @close="clearInput">
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item :label="this.dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="commonDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddform">确 定</el-button>
      </span>
    </el-dialog>
    <!-- editdialog对话框 -->
    <el-dialog :title="'编辑' + this.dialogTitle" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="addFormRules">
        <el-form-item :label="this.dialogTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditform">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      // 商品分类数组
      CateList: [],
      // 级联选择框选中的id双向绑定
      selectKeys: [],
      //级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cate_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // Tabs标签当前选中的标签页
      activeName: 'many',
      // 存储动态参数数据
      manyData: [],
      //存储静态属性数据
      onlyData: [],
      // dialog对话框显示与隐藏
      commonDialogVisible: false,
      // 存储表单数据
      addForm: {
        attr_name: ''
      },
      //编辑参数dialog对话框显示与隐藏
      editDialogVisible: false,
      //表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      //存储编辑参数表单数据
      editForm: {
        attr_name: '',
        attr_id: 0
      }
    }
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.CateList = res.data
    },
    // 级联选择器事件
    handleChange() {
      this.getParamsData()
    },
    // Tabs标签页点击事件
    handleClick() {
      this.getParamsData()
    },
    // 获取商品分类的参数属性
    async getParamsData() {
      const { data: res } = await this.$http.get('categories/' + this.CateId + '/attributes', { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      //把返回参数的attr_vals字符串分割为数组，用于渲染表格展开行的内容
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //存储每个展开行的newtag输入框的属性值
        this.$set(item, 'inputVisible', false)
        this.$set(item, 'inputValue', '')
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    // 点击添加参数按钮,显示dialog对话框
    showCommonDialog() {
      this.commonDialogVisible = true
    },
    //对话框关闭，清空输入框
    clearInput() {
      this.addForm.attr_name = ''
    },
    submitAddform() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.CateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.getParamsData()
        this.$message.success('添加成功')
        this.commonDialogVisible = false
      })
    },
    //点击按钮编辑参数
    async editParams(paramsId) {
      const { data: res } = await this.$http.get(`categories/${this.CateId}/attributes/${paramsId}`)
      if (res.meta.status !== 200) return this.$messge.error('获取参数失败')
      this.editForm.attr_name = res.data.attr_name
      this.editForm.attr_id = res.data.attr_id
      this.editDialogVisible = true
    },
    //点击按钮删除参数
    async deleteParams(paramsId) {
      const { data: res } = await this.$http.delete(`categories/${this.CateId}/attributes/${paramsId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 点击确定按钮提交编辑表单
    submitEditform() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.CateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('提交成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //点击啊添加tag，input输入框出现
    showInput(row) {
      row.inputVisible = true
      //输入框渲染出来后自动对焦
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //添加tag-键盘失去焦点或空格键按下
    handleInputConfirm(row) {
      //如果输入为空的话，清空对话框返回
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //文本框不为空，做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      //提交请求
      this.saveAttrVal(row)
    },
    //将删除和添加tag标签操作保存到数据库的函数
    async saveAttrVal(row) {
      const { data: res } = await this.$http.put(`categories/${this.CateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功')
    },
    //点击叉号删除tag
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVal(row)
    }
  },
  // 计算属性
  computed: {
    // 必须选择到三级分类，按钮才能点
    btnDisabled() {
      if (this.selectKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    // 拿到第三级分类的id
    CateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      } else {
        return null
      }
    },
    //公共dialog对话框title内容
    dialogTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.cateselector {
  margin: 15px 0;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
