<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- //分栏间隔 :gutter代表栏与栏之间的间隔 :span代表每栏所在的位置-->
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryUsersInfo.query" clearable @clear="getUserList"> <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- dialog对话框之添加用户 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogClose">
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password"> <el-input v-model="addForm.password"></el-input> </el-form-item>
          <el-form-item label="邮箱" prop="email"> <el-input v-model="addForm.email"></el-input> </el-form-item
          ><el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adduser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- dialog对话框之修改用户 -->
      <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editdialogClose">
        <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile"> <el-input v-model="editForm.mobile"></el-input> </el-form-item>
          <el-form-item label="邮箱" prop="email"> <el-input v-model="editForm.email"></el-input> </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="edituser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色dialog对话框 -->
      <el-dialog title="分配角色" :visible.sync="setrolesDialogVisible" width="50%" @close="rolesDialogVisibleClose">
        <div>
          <p>当前的用户:{{ this.userInfo.username }}</p>
          <p>当前的角色: {{ this.userInfo.role_name }}</p>
          <p>
            请选择角色:
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setrolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 信息区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop=" mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <!-- {{ scope.row }} -->
            <el-switch @change="changeState(scope.row)" v-model="scope.row.mg_state"> </el-switch>
          </template>
        </el-table-column>
        <!-- 信息区域操作栏 -->
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 操作按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditDialogVisible(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" autofocus @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setroles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryUsersInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryUsersInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    this.getUserList()
  },
  data() {
    //自定义校验规则
    //邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    //手机号验证规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确手机号'))
    }
    return {
      queryUsersInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      //控制添加用户dialog对话框的显示与隐藏
      dialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //控制修改用户dialog对话框显示与隐藏
      editdialogVisible: false,
      //保存查询到的用户信息
      editForm: {},
      //控制分配角色对话框的现实和隐藏
      setrolesDialogVisible: false,
      //点击的用户的信息
      userInfo: {},
      //角色列表
      rolesList: [],
      //当前设置的用户的id
      selectRoleId: ''
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryUsersInfo })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    //修改每页条数
    handleSizeChange(newsize) {
      this.queryUsersInfo.pagesize = newsize
      this.getUserList()
    },
    //修改当前页
    handleCurrentChange(currentpage) {
      this.queryUsersInfo.pagenum = currentpage
      this.getUserList()
    },
    //修改用户状态
    async changeState(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    //添加用户对话框关闭，清空表单
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击确定按钮，进行预验证，通过则添加新用户
    adduser() {
      // validate和valid是预校验的箭头函数和布尔值
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('用户添加失败')
        }
        this.$message.success('用户添加成功')
        //添加完成后隐藏dialog对话框
        this.dialogVisible = false
        //重新获取数据
        this.getUserList()
      })
    },
    //修改用户
    async showeditDialogVisible(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      this.editdialogVisible = true
    },
    //修改对话框关闭事件
    editdialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //点击确定按钮，进行预验证，通过则修改用户
    edituser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.errot('修改用户信息失败')
        }
        this.editdialogVisible = false
        this.getUserList()
        this.$message.success('修改成功')
      })
    },
    //删除用户
    async deleteUser(id) {
      const confirmMessage = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmMessage !== 'confirm') {
        return this.$message.info('已取消')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getUserList()
      this.$message.info(res.meta.msg)
    },
    //分配角色
    async setroles(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取信息失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
      this.setrolesDialogVisible = true
    },
    //点击确定，提交选择的角色
    async setRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        this.$message.error('分配角色失败')
      }
      this.$message.success('分配成功')
      this.getUserList()
      this.setrolesDialogVisible = false
    },
    rolesDialogVisibleClose() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
