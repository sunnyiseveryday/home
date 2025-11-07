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
              <el-select v-model="form.type" placeholder="请选择类型" @change="onTypeChange">
                <el-option label="收入" value="income" />
                <el-option label="支出" value="expense" />
              </el-select>
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
                <el-option :value="undefined" disabled>
                  <el-button type="text" @click="openAddCategoryDialog()">+ 添加分类</el-button>
                </el-option>
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
            @change="onTypeSelect"
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
            @change="onTypeSelect"
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
            @change="onTypeSelect"
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
    <!-- 编辑对话框 -->
    <el-dialog title="编辑记录" :visible.sync="dialogVisible" width="40%">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="类型">
          <el-select v-model="editForm.type" placeholder="请选择类型" @change="onEditTypeChange">
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
            <el-option :value="undefined" disabled>
              <el-button type="text" @click="openAddCategoryDialog()">+ 添加分类</el-button>
            </el-option>
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

        <!-- 报销相关字段，仅在支出类型时显示 -->
        <template v-if="editForm.type === 'expense'">
          <el-form-item label="是否可报销">
            <el-switch v-model="editForm.isReimbursable" />
          </el-form-item>

          <el-form-item v-if="editForm.isReimbursable" label="是否有发票">
            <el-switch v-model="editForm.hasInvoice" />
          </el-form-item>

          <el-form-item v-if="editForm.isReimbursable && editForm.hasInvoice" label="发票日期">
            <el-date-picker
              v-model="editForm.invoiceDate"
              type="date"
              placeholder="选择发票日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>

          <el-form-item v-if="editForm.isReimbursable" label="报销状态">
            <el-select v-model="editForm.reimbursementStatus" placeholder="请选择报销状态">
              <el-option label="未提交" value="0" />
              <el-option label="已提交" value="1" />
              <el-option label="报销完成" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="editForm.isReimbursable && editForm.reimbursementStatus === '2'" label="报销完成时间">
            <el-date-picker
              v-model="editForm.reimbursementDate"
              type="date"
              placeholder="选择报销完成时间"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </template>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRecord">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="categoryDialogVisible" width="30%">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="categoryForm.type" placeholder="请选择类型">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择上级分类(可选)" clearable>
            <el-option
              v-for="category in categoryTree.filter(c => c.type === (categoryForm.type === 'income' ? 1 : 2))"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="categoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addRecords, getRecords, getStatistics, updateRecord, getCategoryTree, addCategory } from '@/api/accountBook'
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
        description: '',
        isReimbursable: false, // 是否可以报销
        hasInvoice: false, // 是否取得发票
        invoiceDate: '', // 发票日期
        reimbursementStatus: '0', // 报销状态
        reimbursementDate: '' // 报销完成时间
      },
      // 分类管理表单
      categoryForm: {
        parentId: 0,
        name: '',
        type: 'expense' // 默认支出类型
      },
      categoryDialogVisible: false,
      categoryTree: [], // 分类树形结构
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
        income: [],
        expense: []
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
    this.loadCategories()
  },
  methods: {
    // 加载分类数据
    loadCategories() {
      getCategoryTree().then(response => {
        if (response.code === 200) {
          this.categoryTree = response.data
          // 构建分类选项
          this.buildCategoryOptions()
        }
      }).catch(error => {
        console.error('加载分类失败:', error)
      })
    },

    // 构建分类选项
    buildCategoryOptions() {
      const incomeCategories = []
      const expenseCategories = []

      this.categoryTree.forEach(category => {
        if (category.type === 1) { // 收入类型
          incomeCategories.push(category.name)
          // 添加子分类
          if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
              incomeCategories.push(child.name)
            })
          }
        } else if (category.type === 2) { // 支出类型
          expenseCategories.push(category.name)
          // 添加子分类
          if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
              expenseCategories.push(child.name)
            })
          }
        }
      })

      this.categories.income = incomeCategories
      this.categories.expense = expenseCategories
      // 确保当前表单中的分类仍然有效
      this.validateCurrentFormCategories()
    },

    // 验证当前表单中的分类是否仍然有效
    validateCurrentFormCategories() {
      // 验证新增记录表单
      if (this.form.category && !this.categories[this.form.type].includes(this.form.category)) {
        this.form.category = ''
      }
      // 验证编辑记录表单
      if (this.editForm.category && !this.categories[this.editForm.type].includes(this.editForm.category)) {
        this.editForm.category = ''
      }
    },

    // 打开添加分类对话框
    openAddCategoryDialog() {
      this.categoryForm = {
        parentId: 0,
        name: '',
        type: this.form.type // 使用当前选中的类型
      }
      this.categoryDialogVisible = true
    },

    // 添加分类
    addCategory() {
      if (!this.categoryForm.name) {
        this.$message.warning('请输入分类名称')
        return
      }

      // 转换类型为后端需要的格式
      const categoryData = {
        ...this.categoryForm,
        type: this.categoryForm.type === 'income' ? 1 : 2
      }

      addCategory(categoryData).then(response => {
        if (response.code === 200) {
          this.$message.success('分类添加成功')
          this.categoryDialogVisible = false
          // 重新加载分类
          this.loadCategories()
        } else {
          this.$message.error('分类添加失败: ' + response.message)
        }
      }).catch(error => {
        this.$message.error('分类添加失败: ' + error.message)
      })
    },

    // 当类型改变时，清空分类选择
    onTypeChange() {
      this.form.category = ''
      this.categoryForm.type = this.form.type
    },

    // 编辑记录时类型改变处理
    onEditTypeChange() {
      // 确保分类与类型匹配
      this.editForm.category = ''
      // 验证当前类型是否与所选分类匹配
      this.validateCategoryType(this.editForm)
    },

    // 验证分类与类型是否匹配
    validateCategoryType(form) {
      // 获取当前类型对应的分类列表
      const currentCategories = this.categories[form.type]
      // 如果已选择分类且不在当前类型分类列表中，则清空
      if (form.category && !currentCategories.includes(form.category)) {
        form.category = ''
      }
    },

    addRecord() {
      if (!this.form.amount || !this.form.category) {
        this.$message.warning('请填写金额和分类')
        return
      }

      // 验证报销相关字段
      if (this.form.isReimbursable) {
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

      // 确保分类与类型匹配
      if (!this.categories[this.form.type].includes(this.form.category)) {
        this.$message.warning('所选分类与类型不匹配，请重新选择分类')
        return
      }

      addRecords(newRecord)
        .then(response => {
          if (response.code === 200) {
            // 重新加载数据而不是直接添加到records数组
            this.initData(this.currentPage, this.pageSize)
            this.loadStatistics()
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
    onTypeSelect() {
      this.loadStatistics()
      this.initData(1, this.pageSize)
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
      // 确保分类与类型匹配
      if (!this.categories[this.editForm.type].includes(this.editForm.category)) {
        this.$message.warning('所选分类与类型不匹配，请重新选择分类')
        return
      }

      // 处理数据格式
      const updatedRecord = {
        ...this.editForm,
        amount: parseFloat(this.editForm.amount),
        // 转换布尔值为数字格式以匹配后端要求
        isReimbursable: this.editForm.isReimbursable === true ? 1 : 0,
        hasInvoice: this.editForm.hasInvoice === true ? 1 : 0,
        // 类型转换
        type: this.editForm.type === 'income' ? 1 : 2
      }

      // 如果是收入类型，清除报销相关字段
      if (this.editForm.type === 'income') {
        updatedRecord.isReimbursable = 0
        updatedRecord.hasInvoice = 0
        updatedRecord.invoiceDate = ''
        updatedRecord.reimbursementStatus = '0'
        updatedRecord.reimbursementDate = ''
      }
      // 调用API更新记录
      updateRecord(updatedRecord)
        .then(response => {
          if (response.code === 200) {
            // 更新成功后更新本地数据
            const index = this.records.findIndex(item => item.id === this.editForm.id)
            if (index !== -1) {
              this.records.splice(index, 1, {
                ...this.editForm,
                type: this.editForm.type,
                isReimbursable: this.editForm.isReimbursable,
                hasInvoice: this.editForm.hasInvoice,
                amount: parseFloat(this.editForm.amount),
                reimbursementStatus: this.editForm.reimbursementStatus
              })
            }
            this.dialogVisible = false
            this.$message.success('更新成功')
          } else {
            this.$message.error('更新失败: ' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('更新失败: ' + error.message)
        })
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
              hasInvoice: record.hasInvoice === 1,
              reimbursementStatus: record.reimbursementStatus ? record.reimbursementStatus.toString() : '0'
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
