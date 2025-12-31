<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Note } from "#shared/types/note";
import type { Article, ArticleCategoryTree, ArticleForm } from "#shared/types/article";
import { BasicModal } from "@/components/basic-modal";
import { getNoteDetail } from "@/apis/note";
import { computed, reactive } from "vue";
import { lyEditorEmitter } from "@/events";
import {
  getArticleDetail,
  getArticleCategoryTree,
  publishArticle,
  updatedPublishArticle
} from "@/apis/article";
import dayjs from "dayjs";
import { z } from "zod";
import { useNotification } from "@/composables/useNotification";
import { TreeSelect } from "@/components/tree-select";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
import { DatePicker } from "@/components/form/date-picker";
import { ImageSelect } from "@/components/image";
import { useUserStore } from "@/stores";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";

const userStore = useUserStore();

const $notify = useNotification();

const state = reactive<{
  visible: boolean;
  path?: string;
  note_id?: number;
  article_id?: number;
}>({
  visible: false
});

const folderData = ref<ArticleCategoryTree>([]);

const schema = z.object({
  title: z.string().min(1, "请输入标题"),
  author: z.string().min(1, "请输入作者"),
  abstract: z.string().min(1, "请输入摘要")
});

const formData = reactive<ArticleForm & { enable_pinned?: boolean }>({
  title: "",
  abstract: "",
  allow_comments: true,
  allow_rewards: true,
  custom_url_access_only: false,
  enable_pinned: false
});

const handleSubmit = async (event: FormSubmitEvent<ArticleForm>) => {
  try {
    if (note.value === null) return;

    if (article.value) {
      await updatedPublishArticle({
        id: article.value.id,
        title: formData.title!,
        category_id: formData.category_id,
        author: formData.author!,
        abstract: formData.abstract!,
        tags: formData.tags,
        published_at: formData.published_at,
        cover: formData.cover,
        pin_priority: formData.enable_pinned ? formData.pin_priority : undefined,
        password: formData.password ? formData.password : undefined,
        allow_comments: formData.allow_comments ?? false,
        allow_rewards: formData.allow_rewards ?? false,
        custom_url: formData.custom_url ? formData.custom_url : undefined,
        custom_url_access_only: formData.custom_url ? formData.custom_url_access_only! : false
      });
      $notify.success({
        title: "更新成功"
      });
    } else {
      await publishArticle({
        note_id: note.value.id,
        title: event.data.title,
        category_id: event.data.category_id,
        author: event.data.author,
        abstract: event.data.abstract,
        tags: formData.tags,
        cover: formData.cover,
        published_at: formData.published_at,
        pin_priority: formData.enable_pinned ? formData.pin_priority : undefined,
        password: formData.password ? formData.password : undefined,
        allow_comments: formData.allow_comments,
        allow_rewards: formData.allow_rewards,
        custom_url: formData.custom_url ? formData.custom_url : undefined,
        custom_url_access_only: formData.custom_url ? formData.custom_url_access_only : false
      });

      $notify.success({
        title: "发布成功"
      });
    }

    handleCancel();
  } catch (error) {
    $notify.error({
      title: "发布失败",
      error
    });
  }
};

const resetForm = () => {
  formData.title = "";
  formData.category_id = undefined;
  formData.author = undefined;
  formData.abstract = "";
  formData.tags = undefined;
  formData.published_at = undefined;
  formData.cover = undefined;
  formData.pin_priority = undefined;
  formData.enable_pinned = false;
  formData.allow_comments = true;
  formData.allow_rewards = true;
  formData.custom_url = undefined;
  formData.custom_url_access_only = false;
};

const formRef = useTemplateRef("formRef");

const handleConfirm = () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  state.note_id = undefined;
  state.article_id = undefined;

  note.value = null;
  article.value = null;

  state.visible = false;

  resetForm();
};

const note = ref<Note | null>(null);
const article = ref<Article | null>(null);

/**
 * 计算属性：判断笔记内容是否比文章内容更新
 */
const needUpdate = computed(() => {
  if (!note.value || !article.value) {
    return false;
  }

  return note.value.version > article.value.note_version;
});

const initData = async () => {
  try {
    if (state.article_id) {
      article.value = await getArticleDetail(state.article_id);
      note.value = await getNoteDetail(article.value.note_id);
    } else if (state.note_id) {
      note.value = await getNoteDetail(state.note_id);
    }

    if (article.value) {
      formData.title = article.value.title;
      formData.category_id = article.value.category_id;
      formData.author = article.value.author;
      formData.abstract = article.value.abstract;
      formData.tags = article.value.tags;
      formData.published_at = article.value.published_at;
      formData.cover = article.value.cover;
      formData.pin_priority = article.value.pin_priority;
      formData.enable_pinned = Boolean(article.value.pin_priority);
      formData.password = article.value.password;
      formData.allow_comments = article.value.allow_comments;
      formData.allow_rewards = article.value.allow_rewards;
      formData.custom_url = article.value.custom_url;
      formData.custom_url_access_only = article.value.custom_url_access_only;
    } else if (note.value) {
      const ast = await parseMarkdown(note.value.content);
      formData.title = ast.data.title;
      formData.author = userStore.userInfo?.username || "";
    }
  } catch (error) {
    $notify.error({
      title: "加载数据失败",
      error
    });
  }

  // 读取目录
  folderData.value = await getArticleCategoryTree();
};

lyEditorEmitter.on("cmd.note-manager:publish:article", async (e: FolderTreeItem) => {
  if (e.type !== "note") return;

  state.note_id = e.id;
  state.article_id = e.data.article_id;
  state.visible = true;

  initData();
});

const handleInputCustomUrl = () => {
  if (!formData.custom_url) {
    formData.custom_url_access_only = false;
  }
};

const handleChangePinned = () => {
  if (formData.enable_pinned) {
    formData.pin_priority = 1;
  } else {
    formData.pin_priority = undefined;
  }
};
</script>
<template>
  <ClientOnly>
    <BasicModal
      v-model:visible="state.visible"
      content-class="max-w-[1080px] h-[80vh]"
      :title="article ? '更新文章' : '发布文章'"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <UForm
        ref="formRef"
        class="space-y-2"
        :schema="schema"
        :state="formData"
        :validate-on-input-delay="100"
        @submit="handleSubmit"
      >
        <div class="flex gap-4">
          <div class="flex-1">
            <UFormField label="文章标题" name="title">
              <UInput v-model="formData.title" placeholder="请输入标题" />
            </UFormField>
            <UFormField label="作者" name="author">
              <UInput v-model="formData.author" placeholder="请输入作者名称" />
            </UFormField>
            <UFormField label="分类" name="category">
              <TreeSelect
                v-model="formData.category_id"
                check-strictly
                label-key="name"
                value-key="id"
                :options="folderData"
              />
            </UFormField>
            <UFormField label="标签" name="tags">
              <UInputTags v-model="formData.tags" />
            </UFormField>
            <UFormField label="摘要" name="abstract">
              <UTextarea v-model="formData.abstract" type="textarea" placeholder="请输入摘要" />
            </UFormField>
            <UFormField
              label="发布时间"
              name="publish_time"
              description="文章将在到达此时间之后公开"
            >
              <DatePicker v-model="formData.published_at" />
            </UFormField>
            <UFormField label="访问密码" name="password">
              <UInput v-model="formData.password" />
            </UFormField>
            <UFormField label="自定义URL访问" name="custom_url">
              <UInput v-model="formData.custom_url" icon="ep:link" @input="handleInputCustomUrl" />
            </UFormField>

            <div class="flex gap-4 items-center pb-4">
              <UCheckbox
                v-model="formData.enable_pinned"
                label="文章置顶"
                @change="handleChangePinned"
              />
              <UCheckbox v-model="formData.allow_comments" label="开启评论" />
              <UCheckbox v-model="formData.allow_rewards" label="开启打赏" />
              <UCheckbox
                v-model="formData.custom_url_access_only"
                label="仅URL访问"
                :disabled="!formData.custom_url"
              />
            </div>

            <UFormField
              v-if="formData.enable_pinned"
              label="置顶优先级"
              name="pinned"
              description="置顶的文章将按照此优先级排序，数字越大越靠上"
            >
              <UInputNumber v-model="formData.pin_priority" class="w-full" />
            </UFormField>
          </div>
          <div class="flex-1">
            <UFormField label="封面图片" name="cover">
              <ImageSelect v-model:value="formData.cover" multiple :limit="3" />
            </UFormField>
            <Descriptions v-if="note" title="笔记信息" class="w-full">
              <DescriptionsItem label="文件名">
                {{ `${note.name}${note.extension}` }}
              </DescriptionsItem>
              <DescriptionsItem label="创建时间">
                {{ note.created_at ? dayjs(note.created_at).format($t("format.datetime")) : "" }}
              </DescriptionsItem>
              <DescriptionsItem label="更新时间">
                {{ note.updated_at ? dayjs(note.updated_at).format($t("format.datetime")) : "" }}
              </DescriptionsItem>
              <DescriptionsItem label="笔记字数">
                {{ note.chars + "字" }}
              </DescriptionsItem>
            </Descriptions>
            <Descriptions v-if="article" title="文章信息" border class="mb-4" :column="1">
              <DescriptionsItem label="创建时间">
                {{ article.created_at ? dayjs(article.created_at).format($t("dateFormat")) : "" }}
              </DescriptionsItem>
              <DescriptionsItem label="更新时间">
                {{ dayjs(article.content_updated_at).format($t("dateFormat")) }}
              </DescriptionsItem>
              <DescriptionsItem label="统计数据">
                <div class="flex gap-2">
                  <UBadge variant="outline">{{ "阅读：" + article.view_count }}</UBadge>
                  <UBadge variant="outline">{{ "评论：" + article.comment_count }}</UBadge>
                  <UBadge variant="outline">{{ "点赞：" + article.like_count }}</UBadge>
                </div>
              </DescriptionsItem>
              <DescriptionsItem label="文章字数">
                {{ article.chars + "字" }}
              </DescriptionsItem>
            </Descriptions>
            <UAlert
              v-if="needUpdate"
              title="笔记内容已更新，需要同步"
              icon="material-symbols:update"
              color="error"
              variant="outline"
              :description="`当前文章落后 ${(note?.version ?? 0) - (article?.note_version ?? 0)} 个版本`"
            />
          </div>
        </div>
      </UForm>
    </BasicModal>
  </ClientOnly>
</template>
