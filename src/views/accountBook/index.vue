<template>
  <div class="app-container">
    <h2>记账本</h2>
    <!-- 添加记账条目表单 -->
    <el-card class="mb-3">
      <div slot="header">
        <span>新增记账</span>
      </div>
      <el-form :model="form" label-width="120px" @submit.native.prevent="addRecord">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="类型">
              <el-select v-model="form.type" placeholder="请选择类型">
                <el-option label="收入" value="income" />
                <el-option label="支出" value="expense" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="金额">
              <el-input-number
                v-model="form.amount"
                :precision="2"
                :step="1"
                :min="0"
                placeholder="请输入金额"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="分类">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option
                  v-for="item in categories[form.type]"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日期">
              <el-date-picker
                v-model="form.recordDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.description" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否可报销">
              <el-switch v-model="form.isReimbursable" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.isReimbursable" :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否有发票">
              <el-switch v-model="form.hasInvoice" />
            </el-form-item>
          </el-col>

          <el-col v-if="form.hasInvoice" :span="12">
            <el-form-item label="发票日期">
              <el-date-picker
                v-model="form.invoiceDate"
                type="date"
                placeholder="选择发票日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.isReimbursable" :gutter="20">
          <el-col :span="12">
            <el-form-item label="报销状态">
              <el-select v-model="form.reimbursementStatus" placeholder="请选择报销状态">
                <el-option label="未提交" value="0" />
                <el-option label="已提交" value="1" />
                <el-option label="报销完成" value="2" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col v-if="form.reimbursementStatus === '2'" :span="12">
            <el-form-item label="报销完成时间">
              <el-date-picker
                v-model="form.reimbursementDate"
                type="date"
                placeholder="选择报销完成时间"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="addRecord">添加记录</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <!-- 统计信息 -->
    <el-card class="mb-3">
      <div slot="header">
        <span>统计信息</span>
      </div>
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-select v-model="statisticType" placeholder="请选择统计类型" @change="onStatisticTypeChange">
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
            <el-option label="按年" value="year" />
          </el-select>
        </el-col>

        <!-- 周选择器 -->
        <el-col v-if="statisticType === 'week'" :span="6">
          <el-date-picker
            v-model="selectedWeek"
            type="week"
            format="yyyy 第 WW 周"
            value-format="yyyy-MM-dd"
            placeholder="选择周"
            @change="loadStatistics"
          />
        </el-col>

        <!-- 月选择器 -->
        <el-col v-else-if="statisticType === 'month'" :span="6">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            format="yyyy-MM"
            value-format="yyyy-MM"
            placeholder="选择月份"
            @change="loadStatistics"
          />
        </el-col>

        <!-- 年选择器 -->
        <el-col v-else-if="statisticType === 'year'" :span="6">
          <el-date-picker
            v-model="selectedYear"
            type="year"
            format="yyyy"
            value-format="yyyy"
            placeholder="选择年份"
            @change="loadStatistics"
          />
        </el-col>
      </el-row>
      <!-- 统计结果展示部分保持不变 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="statistic-item">
            <div class="statistic-label">总收入</div>
            <div class="statistic-value income">¥{{ statistics.totalIncome.toFixed(2) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistic-item">
            <div class="statistic-label">总支出</div>
            <div class="statistic-value expense">¥{{ statistics.totalExpense.toFixed(2) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistic-item">
            <div class="statistic-label">结余</div>
            <div class="statistic-value balance" :class="{ negative: statistics.balance < 0 }">
              ¥{{ statistics.balance.toFixed(2) }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 记账记录列表 -->
    <el-card>
      <div slot="header">
        <span>记账记录</span>
      </div>
      <el-table v-loading="loading" :data="records" style="width: 100%" border>
        <el-table-column prop="recordDate" label="日期" width="120" />
        <el-table-column prop="type" label="类型" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
              {{ scope.row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template slot-scope="scope">
            <span :class="scope.row.type === 'income' ? 'income' : 'expense'">
              {{ scope.row.type === 'income' ? '+' : '-' }}{{ scope.row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click="editRecord(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteRecord(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="isReimbursable" label="可报销" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isReimbursable ? 'success' : 'info'">
              {{ scope.row.isReimbursable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reimbursementStatus" label="报销状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.reimbursementStatus === '0'">未提交</el-tag>
            <el-tag v-else-if="scope.row.reimbursementStatus === '1'" type="warning">已提交</el-tag>
            <el-tag v-else-if="scope.row.reimbursementStatus === '2'" type="success">已完成</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalRecords"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑记录" :visible.sync="dialogVisible" width="40%">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="editForm.type" placeholder="请选择类型">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>

        <el-form-item label="金额">
          <el-input-number
            v-model="editForm.amount"
            :precision="2"
            :step="1"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="editForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories[editForm.type]"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.recordDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="editForm.description" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRecord">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addRecords, getRecords, getStatistics } from '@/api/accountBook'
export default {
  name: 'AccountBook',
  data() {
    return {
      form: {
        type: 'expense',
        amount: 0,
        category: '',
        recordDate: new Date().toISOString().split('T')[0],
        description: '',
        isReimbursable: false, // 是否可以报销
        hasInvoice: false, // 是否取得发票
        invoiceDate: '', // 发票日期
        reimbursementStatus: '' // 报销状态
      },
      editForm: {
        id: null,
        type: 'expense',
        amount: 0,
        category: '',
        recordDate: new Date().toISOString().split('T')[0],
        description: ''
      },
      statisticType: 'month', // 默认按月统计
      selectedWeek: null, // 选中的周
      selectedMonth: new Date().toISOString().substring(0, 7), // 选中的月份，默认当前月份
      selectedYear: new Date(), // 选中的年份，默认当前年份
      statistics: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
      },
      dialogVisible: false,
      records: [],
      totalRecords: 0, // 添加总记录数
      pageSize: 10,
      currentPage: 1,
      categories: {
        income: ['工资', '奖金', '投资收益', '其他'],
        expense: ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']
      },
      loading: false
    }
  },
  computed: {
    totalIncome() {
      return this.records
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0)
    },
    totalExpense() {
      return this.records
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0)
    },
    balance() {
      return this.totalIncome - this.totalExpense
    }
  },
  created() {
    // 初始化一些示例数据
    this.initData(this.currentPage, this.pageSize)
    this.loadStatistics()
  },
  methods: {
    addRecord() {
      if (!this.form.amount || !this.form.category) {
        this.$message.warning('请填写金额和分类')
        return
      }

      // 验证报销相关字段
      if (this.form.reimbursable) {
        if (this.form.reimbursementStatus === '2' && !this.form.reimbursementDate) {
          this.$message.warning('请选择报销完成时间')
          return
        }
        if (this.form.hasInvoice && !this.form.invoiceDate) {
          this.$message.warning('请选择发票日期')
          return
        }
      }

      const newRecord = {
        ...this.form,
        type: this.form.type === 'income' ? 1 : 2, // 收入为1，支出为2
        isReimbursable: this.form.isReimbursable === true ? 1 : 0,
        hasInvoice: this.form.hasInvoice === true ? 1 : 0,
        amount: parseFloat(this.form.amount)
      }

      addRecords(newRecord)
        .then(response => {
          if (response.code === 200) {
            // 后端返回完整记录（包括ID）
            this.records.unshift(response.data)
            this.resetForm()
            this.$message.success('添加成功')
          } else {
            this.$message.error('添加失败: ' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('添加失败: ' + error.message)
        })
    },

    resetForm() {
      this.form = {
        type: 'expense',
        amount: 0,
        category: '',
        recordDate: new Date().toISOString().split('T')[0],
        description: '',
        isReimbursable: false,
        hasInvoice: false,
        invoiceDate: '',
        reimbursementStatus: '',
        reimbursementDate: ''
      }
    },
    onStatisticTypeChange() {
      // 重置时间选择
      this.selectedWeek = null
      this.selectedMonth = null
      this.selectedYear = null
    },

    loadStatistics() {
      const params = { type: this.statisticType }

      // 根据统计类型添加对应的时间参数
      if (this.statisticType === 'week' && this.selectedWeek) {
        params.week = this.selectedWeek
      } else if (this.statisticType === 'month' && this.selectedMonth) {
        params.month = this.selectedMonth
      } else if (this.statisticType === 'year' && this.selectedYear) {
        params.year = this.selectedYear
      }
      getStatistics(params)
        .then(response => {
          if (response.code === 200) {
            this.statistics = response.data
          } else {
            this.$message.error('统计信息加载失败: ' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('统计信息加载失败: ' + error.message)
        })
    },

    editRecord(record) {
      this.editForm = { ...record }
      this.dialogVisible = true
    },

    updateRecord() {
      const index = this.records.findIndex(item => item.id === this.editForm.id)
      if (index !== -1) {
        this.records.splice(index, 1, { ...this.editForm, amount: parseFloat(this.editForm.amount) })
        this.dialogVisible = false
        this.$message.success('更新成功')
      }
    },

    deleteRecord(record) {
      this.$confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.records.findIndex(item => item.id === record.id)
        if (index !== -1) {
          this.records.splice(index, 1)
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    handlePageChange(page) {
      this.currentPage = page
      this.initData(page, this.pageSize)
    },

    initData(page = 1, pageSize = this.pageSize, filters = {}) {
      this.loading = true
      // 从数据库获取分页数据
      const params = { page, pageSize, ...filters }

      // 添加统计参数
      if (this.statisticType) {
        params.statisticType = this.statisticType
        if (this.statisticType === 'week' && this.selectedWeek) {
          params.week = this.selectedWeek
        } else if (this.statisticType === 'month' && this.selectedMonth) {
          params.month = this.selectedMonth
        } else if (this.statisticType === 'year' && this.selectedYear) {
          params.year = this.selectedYear
        }
      }
      getRecords(params)
        .then(response => {
          if (response.code === 200) {
            this.records = response.data.records.map(record => ({
              ...record,
              type: record.type === 1 ? 'income' : 'expense',
              isReimbursable: record.isReimbursable === 1,
              hasInvoice: record.hasInvoice === 1
            }))
            // 假设后端返回总记录数
            this.totalRecords = response.data.total
          } else {
            this.$message.error('数据加载失败: ' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('数据加载失败: ' + error.message)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}

.statistic-item {
  text-align: center;
  padding: 1rem 0;
}

.statistic-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 0.5rem;
}

.statistic-value {
  font-size: 18px;
  font-weight: bold;
}

.income {
  color: #67c23a;
}

.expense {
  color: #f56c6c;
}

.balance.negative {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 1rem;
  text-align: center;
}
</style>
