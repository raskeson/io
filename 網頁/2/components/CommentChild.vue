


<template>
  <div class="comment-child">
    <div style="margin: 15px 20px 0"><!----></div>

    <div class="comment-children">
      <!-- 評論列表 -->

      <CommentUser
        :commentObj="commentObj"
        :contentObj="contentObj"
        @co-success="commentSuccess"
      ></CommentUser>
      <!-- 更多回復 -->
      <div class="comment-more-replies">
        <div class="comment-more-list">
          <div class="comment-more-item">
            <!-- 作者評論內容 -->
            <div v-if="commentChildren != null">
              <div v-for="(item, keys) in commentChildren" :key="keys">
                <CommentUser
                  :commentObj="item"
                  :contentObj="contentObj"
                  @co-success="commentSuccess"
                ></CommentUser>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 暫無評論 -->
    <div v-if="total == 0"></div>

    <!-- 分頁 -->
    <div class="fenye" v-if="this.$route.name == 'c-contentId'">
      <el-pagination
        :hide-on-single-page="true"
        background
        layout="prev, pager, next"
        :total="total"
        :current-page="currentPage"
        :page-size="5"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>

  </div>
</template>

<script>
import touristApi from "@/api/tourist";
import operateApi from "@/api/operate";

import { getToken } from "@/utils/auth";
//組件
import CommentUser from "@/components/CommentUser";

export default {
  name: "CommentChild",
  props: ["contentObj", "commentObj"],
  components: { CommentUser },
  data() {
    //這裏存放數據
    return {
      commentChildren: null,
      //評論請求參數
      commentQuery: {
        contentId: "",
        pageNum: 1,
      },

      //登錄賬戶的用戶id
      loginUserId: 0,
      //****分頁 */
      total: 0, //一級評論數量
      currentPage: 1,

    };
  },
  //生命周期 - 創建完成（可以訪問當前this實例）
  created() {
    this.getCommentList(this.currentPage);
  },
  //生命周期 - 掛載完成（可以訪問DOM元素）
  mounted() {
    if (getToken() !== undefined) {
      this.loginUserId = this.globalVariable.userInfoGlobal.userId;
    }
  },
  //方法集合
  methods: {
    //加載子評論
    getCommentList(currentPage) {
      this.commentQuery.commentId = this.commentObj.commentId;
      this.commentQuery.pageNum = currentPage;
      touristApi.getCommentChildren(this.commentQuery).then((response) => {
        this.commentChildren = response.rows;
        this.total = parseInt(response.total);
      });
    },
    //當頁數改變的時候
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getCommentList(this.currentPage);
    },
    //評論成功後
    commentSuccess(response) {
      this.handleCurrentChange(1);
    },

  },
};
</script>
<style>
.comment-nick {
  font-weight: bolder;
  font-size: 12px;
  color: #eb7350;
  text-align: left;
}
.comment-list {
  font-size: 12px;
  /* font-weight: bolder; */
  line-height: 20px;
  color: #333;
}
.comment-info {
  height: 22px;
  margin: 1px 0 0;
  color: #939393;
}
.comment-iconbed {
  width: 22px;
  height: 22px;
  margin: 0 0 0 10px;
}
.comment-more-replies {
  position: relative;
  margin: 6px 0 2px 44px;
}
.comment-more-replies::before {
  content: "";
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  border-left: 2px solid #f2f2f2;
}
.comment-more-list {
  padding: 0 0 0px 10px;
  line-height: 20px;
  font-size: 12px;
}
.composer_btn {
  width: 68px;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
/* 作者標簽 */
.comment-item-tag {
  flex-shrink: 0;
  font-size: 10px;
  height: 16px;
  margin-left: 8px;
  color: #fff;

  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  font-weight: 500;
  justify-content: center;
  line-height: 20px;
  padding: 0 4px;
}
/* 工具欄圖標 */
.comment-tool-iconbed {
  font-size: 14px;
  color: grey;
}
.CommentFeed_more {
  height: 44px;
  background: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.CommentFeed_more:hover {
  color: #eb7350;
}
/* 分頁 */
.fenye {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
</style>