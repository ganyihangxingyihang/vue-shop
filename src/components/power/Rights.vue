<template>
  <div class="rights">
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 表格 -->
      <el-table :data="rightsList" stripe border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称" width="180"> </el-table-column>
        <el-table-column prop="path" label="路径" width="180"> </el-table-column>
        <el-table-column prop="level" label="权限等级" width="180">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">标签一</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">标签二</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level === '2'">标签三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRightsList()
  },
  data() {
    return {
      rightsList: [],
      rightsListinfo: {
        id: Number,
        authName: String,
        level: Number,
        pid: Number,
        path: String
      }
    }
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list', { params: this.rightsListinfo })
      console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>

<style scoped></style>
