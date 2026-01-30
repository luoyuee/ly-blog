<script setup lang="ts">
import type { FormSubmitEvent, InputMenuItem } from "@nuxt/ui";
import type { SendEmailForm } from "@/apis/admin/models";
import { BasicModal } from "@/components/basic-modal";
import { getRecipients, sendEmail } from "@/apis/admin";
import { z } from "zod";

const recipientOptions = ref<InputMenuItem[]>([]);

/**
 * 发送邮件表单校验规则
 */
const schema = z.object({
  to: z.email({ message: "请输入正确的收件人邮箱" }).array().min(1, "请选择收件人"),
  subject: z.string({ message: "请输入邮件主题" }).min(1, "请输入邮件主题"),
  content: z.string({ message: "请输入邮件内容" }).min(1, "请输入邮件内容")
});

/**
 * 全局通知实例
 */
const $notify = useNotification();

/**
 * 弹窗事件：
 * - cancel：点击取消或关闭弹窗
 * - submit：表单校验通过后提交数据
 */
const emits = defineEmits(["cancel", "submit"]);

/**
 * 表单绑定的数据
 */
const formData = ref<SendEmailForm>({
  to: [],
  subject: "",
  content: ""
});

/**
 * 弹窗显隐状态
 */
const visible = ref(false);

/**
 * 打开发送邮件弹窗
 * 并重置表单数据
 */
const handleOpen = () => {
  formData.value = {
    to: [],
    subject: "",
    content: ""
  };

  getRecipients().then((recipients) => {
    recipientOptions.value = recipients.map((item) => ({
      label: `${item.email} (${item.nickname})`,
      value: item.email,
      avatar: {
        src: item.avatar || "/images/blank_avatar.webp"
      }
    }));
  });

  visible.value = true;
};

defineExpose({
  open: handleOpen
});

const formRef = useTemplateRef("formRef");
const handleConfirm = () => {
  console.log(formRef.value);
  formRef.value?.submit();
};

const submitting = ref(false);
const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

    await sendEmail(event.data);

    $notify.success({
      title: "已提交发送请求"
    });

    visible.value = false;
  } catch (error) {
    $notify.error({
      title: "发送失败",
      error
    });
  } finally {
    submitting.value = false;
  }
};

/**
 * 取消发送邮件
 */
const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};

function onCreate(item: string) {
  recipientOptions.value.push({
    label: item,
    value: item,
    avatar: {
      src: "/images/blank_avatar.webp"
    }
  });
}
</script>
<template>
  <BasicModal v-model:visible="visible" title="发送邮件">
    <UForm
      ref="formRef"
      :state="formData"
      :schema="schema"
      :validate-on-input-delay="100"
      class="flex flex-col gap-4"
      @submit="handleSubmit"
    >
      <UFormField label="收件人邮箱" name="to">
        <UInputMenu
          v-model="formData.to"
          class="w-full"
          create-item
          multiple
          placeholder="请输入收件人邮箱"
          value-key="value"
          :items="recipientOptions"
          @create="onCreate"
        />
      </UFormField>

      <UFormField label="邮件主题" name="subject">
        <UInput v-model="formData.subject" placeholder="请输入邮件主题" />
      </UFormField>

      <UFormField label="邮件内容" name="content">
        <UTextarea v-model="formData.content" :rows="6" placeholder="请输入邮件内容" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        :disabled="submitting"
        @click="handleCancel"
      />
      <UButton label="发送" color="primary" :loading="submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
