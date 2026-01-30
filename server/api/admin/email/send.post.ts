import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useEmail } from "@@/server/utils/email";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    to: z.email().array(),
    subject: z.string(),
    content: z.string()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const { initTransporter, sendEmail } = useEmail();

  try {
    await initTransporter();

    await sendEmail({
      to: body.to,
      subject: body.subject,
      content: body.content
    });

    return getOKResponse(event);
  } catch (error) {
    return getBadResponse(event, (error as Error).message);
  }
});
