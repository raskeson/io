<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="分類名" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="請輸入分類名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="數據狀態"
          clearable
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['campus:category:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
          >展開/折疊</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      row-key="categoryId"
      :data="categoryList"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="分類名" align="center" prop="categoryName" />
      <el-table-column prop="icon" label="圖標" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column label="縮略名" align="center" prop="slug" />
      <el-table-column label="排序" align="center" width="60" prop="orderNum" />

      <el-table-column label="系統內置" align="center" prop="type">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.type == 'Y'"
            content="系統內容不可刪除，不可修改其id，且不可發布墻，只用於前臺展示，代碼邏輯處理獲取墻內容"
            placement="top"
          >
            <el-badge is-dot class="item">
               <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.type" />
            </el-badge>
          </el-tooltip>

            <dict-tag v-else :options="dict.type.sys_yes_no" :value="scope.row.type" />
         
        </template>
      </el-table-column>

      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="狀態" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.sys_normal_disable"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="創建時間"
        align="center"
        prop="createTime"
        width="180"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['campus:category:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleAdd(scope.row)"
            v-hasPermi="['campus:category:add']"
            >新增</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['campus:category:remove']"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改分類對話框 -->
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上級分類" prop="parentId">
          <treeselect
            v-model="form.parentId"
            :options="categoryOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="選擇上級分類"
          />
        </el-form-item>
        <el-form-item label="分類名" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="請輸入分類名" />
        </el-form-item>
        <el-form-item label="菜單圖標" prop="icon">
          <el-popover
            placement="bottom-start"
            width="460"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input
              slot="reference"
              v-model="form.icon"
              placeholder="點擊選擇圖標"
              readonly
            >
              <svg-icon
                v-if="form.icon"
                slot="prefix"
                :icon-class="form.icon"
                class="el-input__icon"
                style="height: 32px; width: 16px"
              />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item label="縮略名" prop="slug">
          <el-input v-model="form.slug" placeholder="請輸入縮略名" />
        </el-form-item>
        <el-form-item label="顯示排序" prop="orderNum">
          <el-input-number
            v-model="form.orderNum"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="系統內置" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio
              v-for="dict in dict.type.sys_yes_no"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>

        <el-form-item label="狀態" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="請輸入描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCategory,
  getCategory,
  delCategory,
  addCategory,
  updateCategory,
} from "@/api/campus/category";

import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Category",
  dicts: ["sys_yes_no", "sys_normal_disable"],
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩層
      loading: true,
      // 選中數組
      ids: [],
      //分類樹選項
      categoryOptions: [],
      // 非單個禁用
      single: true,
      // 非多個禁用
      multiple: true,
      // 顯示搜索條件
      // 是否展開，默認全部折疊
      isExpandAll: false,
      // 重新渲染表格狀態
      refreshTable: true,
      showSearch: true,
      // 分類表格數據
      categoryList: [],
      // 彈出層標題
      title: "",
      // 是否顯示彈出層
      open: false,
      // 查詢參數
      queryParams: {
        categoryName: null,
        slug: null,
        description: null,
        status: null,
      },
      // 表單參數
      form: {},
      // 表單校驗
      rules: {
        categoryName: [
          { required: true, message: "分類名不能為空", trigger: "blur" },
        ],
        slug: [{ required: true, message: "縮略名不能為空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 選擇圖標
    selected(name) {
      this.form.icon = name;
    },
    /** 查詢分類列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams).then((response) => {
        this.categoryList = this.handleTree(response.data, "categoryId");
        this.loading = false;
      });
    },
    /** 轉換菜單數據結構 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.categoryId,
        label: node.categoryName,
        children: node.children,
      };
    },
    /** 展開/折疊操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 查詢下拉樹結構 */
    getTreeselect() {
      listCategory().then((response) => {
        this.categoryOptions = [];
        const category = {
          categoryId: 0,
          categoryName: "主類目",
          children: [],
        };
        category.children = this.handleTree(response.data, "categoryId");
        this.categoryOptions.push(category);
      });
    },
    // 取消按鈕
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        categoryId: null,
        categoryName: null,
        parentId: null,
        icon: undefined,
        slug: null,
        type: "N",
        status: "0",
        description: null,
      };
      this.resetForm("form");
    },
    /** 搜索按鈕操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按鈕操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多選框選中數據
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.categoryId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按鈕操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.categoryId) {
        this.form.parentId = row.categoryId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "添加分類";
    },
    /** 修改按鈕操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getCategory(row.categoryId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改分類";
      });
    },
    /** 提交按鈕 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.categoryId != null) {
            updateCategory(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCategory(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 刪除按鈕操作 */
    handleDelete(row) {
      const categoryIds = row.categoryId || this.ids;
      this.$modal
        .confirm('是否確認刪除分類編號為"' + categoryIds + '"的數據項？')
        .then(function () {
          return delCategory(categoryIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("刪除成功");
        })
        .catch(() => {});
    },
    /** 導出按鈕操作 */
    handleExport() {
      this.download(
        "system/category/export",
        {
          ...this.queryParams,
        },
        `category_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
