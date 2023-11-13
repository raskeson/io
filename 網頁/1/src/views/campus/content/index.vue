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
      <el-form-item label="用戶" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="請輸入用戶id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="類別" prop="categoryId">
        <treeselect
          v-model="queryParams.categoryId"
          :options="categoryOptions"
          :normalizer="normalizer"
          :show-count="true"
          placeholder="選擇分類"
          style="width: 130px"
        />
      </el-form-item>
      <el-form-item label="內容" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="請輸入發表的內容"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="請選擇狀態"
          clearable
        >
          <el-option
            v-for="dict in dict.type.campus_content_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="類型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="請選擇類型"
          clearable
        >
          <el-option
            v-for="dict in dict.type.campus_content_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="匿名" prop="isAnonymous">
        <el-select
          v-model="queryParams.isAnonymous"
          placeholder="請選擇是否匿名"
          clearable
        >
          <el-option
            v-for="dict in dict.type.campus_anonymous"
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
        <!-- v-hasPermi="['campus:content:add']" -->
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <!-- v-hasPermi="['campus:content:edit']" -->
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >刪除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="contentList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用戶昵稱" align="center" prop="params.nickName" />
      <el-table-column label="類別" align="center" prop="params.categoryName" />
      <el-table-column
        label="內容"
        align="center"
        prop="content"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="狀態" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.campus_content_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column label="類型" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.campus_content_type"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column label="匿名" align="center" prop="isAnonymous">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.campus_anonymous"
            :value="scope.row.isAnonymous"
          />
        </template>
      </el-table-column>
      <el-table-column label="創建時間" align="center" prop="createTime" />

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
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >刪除</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            >詳細</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改校園墻內容對話框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分類" prop="categoryId">
          <!-- <el-input v-model="form.categoryId" placeholder="分類" /> -->
          <treeselect
            v-model="form.categoryId"
            :options="categoryOptions"
            :disableBranchNodes="true"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="選擇分類"
          />
        </el-form-item>
        <el-form-item label="內容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="請輸入發表的內容"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.campus_content_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇類型">
            <el-option
              v-for="dict in dict.type.campus_content_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="匿名" prop="isAnonymous">
          <el-select v-model="form.isAnonymous" placeholder="請選擇匿名">
            <el-option
              v-for="dict in dict.type.campus_anonymous"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 調度校園墻內容詳細 -->
    <el-dialog
      title="調度日誌詳細"
      :visible.sync="viewOpen"
      width="700px"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="8">
            <el-form-item label="頭像："
              ><image-preview :src="contentParams.avatar"> </image-preview
            ></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用戶昵稱：">{{
              contentParams.nickName
            }}</el-form-item>
            <el-form-item label="用戶賬戶：">{{
              contentParams.userName
            }}</el-form-item>
            <el-form-item label="分類：">{{
              contentParams.categoryName
            }}</el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="標簽：">
              <li v-for="item in form.tags">{{ item.tagName }}</li>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="內容：" style="white-space: pre-wrap">{{
              form.content
            }}</el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.type == 1">
            <el-form-item label="圖片：">
              <div
                class="picture_item"
                v-for="(item, key) in form.fileUrl"
                :key="key"
              >
                <image-preview
                  style="border-radius: 10px; width: 25%; aspect-ratio: 1/1"
                  :src="item"
                >
                </image-preview>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.type == 2">
            <el-form-item label="視頻：">
              <div
                class="picture_item"
                v-for="(item, key) in form.fileUrl"
                :key="key"
              >
                <el-link
                  :underline="false"
                  :href="handleUrl(item)"
                  target="_blank"
                  >點擊跳轉</el-link
                >
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">關 閉</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listContent,
  getContent,
  delContent,
  addContent,
  updateContent,
} from "@/api/campus/content";

import { listSelectCategory, listCategory } from "@/api/campus/category";
import { isExternal } from "@/utils/validate";

import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import Treeselect from "@riophae/vue-treeselect";

export default {
  name: "Content",
  dicts: ["campus_content_status", "campus_content_type", "campus_anonymous"],
  components: { Treeselect },
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
      showSearch: true,
      // 總條數
      total: 0,
      // 校園墻內容表格數據
      contentList: [],
      // 彈出層標題
      title: "",
      // 是否顯示彈出層
      open: false,
      //是否顯示詳細的彈出層
      viewOpen: false,
      // 查詢參數
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        categoryId: null,
        content: null,
        status: null,
        type: null,
        isAnonymous: null,
      },
      //其他參數
      contentParams: {
        nickName: "",
        userName: "",
        avatar: "",
        categoryName: "",
      },
      // 表單參數
      form: {},
      // 表單校驗
      rules: {
        categoryId: [
          { required: true, message: "分類不能為空", trigger: "blur" },
        ],
        content: [{ required: true, message: "內容不能為空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
    this.reset();
    this.getTreeselect();
  },
  methods: {
    /** 查詢校園墻內容列表 */
    getList() {
      this.loading = true;
      listContent(this.queryParams).then((response) => {
        this.contentList = response.rows;
        this.total = response.total;
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
    /** 查詢下拉樹結構 */
    getTreeselect() {
      listSelectCategory().then((response) => {
        this.categoryOptions = this.handleTree(response.data, "categoryId");
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
        contentId: null,
        userId: null,
        categoryId: null,
        content: null,
        status: 0,
        type: null,
        fileNumber: null,
        isAnonymous: null,
        delFlag: null,
        createTime: null,
        createUser: null,
        updateTime: null,
        updateUser: null,
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
      this.ids = selection.map((item) => item.contentId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按鈕操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加校園墻內容";
    },
    /** 修改按鈕操作 */
    handleUpdate(row) {
      this.reset();
      const contentId = row.contentId || this.ids;
      getContent(contentId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改校園墻內容";
      });
    },
    /** 提交按鈕 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.contentId != null) {
            updateContent(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addContent(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 詳細按鈕操作 */
    handleView(row) {
      this.viewOpen = true;
      this.form = row;
      this.contentParams = row.params;
    },
    handleUrl(url) {
      if (!url) {
        return;
      }
      let real_src = url.split(",")[0];
      if (isExternal(real_src)) {
        return real_src;
      }
      return process.env.VUE_APP_BASE_API + real_src;
    },
    /** 刪除按鈕操作 */
    handleDelete(row) {
      const contentIds = row.contentId || this.ids;
      this.$modal
        .confirm('是否確認刪除校園墻內容編號為"' + contentIds + '"的數據項？')
        .then(function () {
          return delContent(contentIds);
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
        "system/content/export",
        {
          ...this.queryParams,
        },
        `content_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style scoped>
.picture_item {
  display: inline;
  padding-left: 0.25rem;
  padding-top: 0.25rem;
}
</style>