<template>
  <div class="roles">
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- dialog对话框之添加角色 -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%">
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc"> <el-input v-model="addForm.roleDesc"></el-input> </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- dialog对话框之编辑角色 -->
    <el-dialog title="编辑角色" :visible.sync="editdialogVisible" width="50%">
      <el-form ref="editFormRef" :rules="addFormRules" :model="editroleForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editroleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc"> <el-input v-model="editroleForm.roleDesc"></el-input> </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editrole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true"> 添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" stripe border style="width: 100%">
        <el-table-column type="expand" width="60">
          <template v-slot="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdtop', 'vcenter']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <el-icon class="el-icon-caret-right"></el-icon>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <el-icon class="el-icon-caret-right"></el-icon>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="60"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="240"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="240"> </el-table-column>
        <el-table-column prop="level" label="操作" width="540">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editroleOpen(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- //权限分配的dialog对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="50%" @close="setRightsDialogClosed">
      <el-tree ref="treeRef" :data="rightsList" :props="defaultProps" show-checkbox :default-expand-all="true" node-key="id" :default-checked-keys="defkeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getrolesList()
  },
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      // 添加角色
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      //编辑角色
      editroleForm: {},
      editdialogVisible: false,
      // 校验规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 12, message: '长度在 4 到 12个字符', trigger: 'blur' }
        ]
      },
      //控制权限设置对话框的现实和隐藏
      setRightsDialogVisible: false,
      //角色权限数组存储
      rightsList: [],
      //角色权限树组件的默认属性
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      //默认选中的权限的id值数组
      defkeys: [],
      roleId: ''
    }
  },
  methods: {
    //获取角色列表
    async getrolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    //校验通过则添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 200) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加成功')
        this.dialogVisible = false
        this.getrolesList()
      })
    },
    //点击编辑按钮出现角色信息编辑框
    async editroleOpen(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询出错')
      }
      this.editroleForm = res.data
      this.editdialogVisible = true
    },
    //编辑角色信息
    editrole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请按照规则填写')
        const { data: res } = await this.$http.put('roles/' + this.editroleForm.roleId, this.editroleForm)
        if (res.meta.status !== 200) return this.$message.error('编辑失败')
        this.editdialogVisible = false
        this.getrolesList()
        this.$message.success('编辑成功')
      })
    },
    //删除角色
    async deleteRole(id) {
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.getrolesList()
    },
    //删除角色权限
    async removeRight(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      //将返回的更新后的数据，传给浅拷贝的权限数据
      role.children = res.data
      this.$message.success('删除成功')
    },
    //显示权限分配对话框，并获取权限
    async showSetRightsDialog(role) {
      //拿到id
      this.roleId = role.id
      //获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defkeys)
      this.setRightsDialogVisible = true
    },
    //通过递归，获取所有三级权限的id，并保存到defkeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //权限对话框关闭时
    setRightsDialogClosed() {
      this.defkeys = []
    },
    //将勾选的权限对应的id拿到
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idstr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idstr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配失败')
      }
      this.$message.success('分配成功')
      this.getrolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-table .el-button {
  font-size: 12px;
}
.el-table {
  margin-top: 15px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottm {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 7px;
}
</style>
